export interface SpendLineItem {
  id: string;
  created: string;
  amount: number;
  currency: string;
  merchant: string;
  description: string | null;
  category: SpendCategory;
  status: string;
  refunded: boolean;
}

export type SpendCategory =
  | "software_saas"
  | "infrastructure"
  | "advertising"
  | "payments_fees"
  | "payroll_contractors"
  | "uncategorized";

export interface CategoryTotal {
  category: SpendCategory;
  currency: string;
  total: number;
  count: number;
}

export interface SpendFlag {
  type: "duplicate" | "anomaly" | "review_saas" | "refund";
  severity: "info" | "watch" | "action";
  merchant: string;
  detail: string;
}

export interface DataWindow {
  since: string | null;
  limit: number;
}

export interface SpendReview {
  generatedAt: string;
  mode: "read_only_recommendations";
  dataWindow: DataWindow;
  lineItems: SpendLineItem[];
  categoryTotals: CategoryTotal[];
  flags: SpendFlag[];
  runHistoryHint: string;
}

interface RawCharge {
  id: string;
  amount: number;
  currency: string;
  created: number;
  description: string | null;
  statement_descriptor: string | null;
  calculated_statement_descriptor: string | null;
  status: string;
  refunded: boolean;
  billing_details: { name: string | null } | null;
}

export const reviewSpendInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Number of most recent charges to inspect. Defaults to 100."
    },
    since: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "Only inspect charges created on or after this UTC date (YYYY-MM-DD). Optional."
    }
  }
} as const;

export interface ReviewSpendInput {
  limit?: number;
  since?: string;
}

export function normalizeReviewSpendInput(input: unknown): ReviewSpendInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Spend review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    limit: optionalLimit(value.limit),
    since: optionalDate(value.since, "since")
  };
}

export async function reviewSpend(input: ReviewSpendInput = {}): Promise<SpendReview> {
  const parsed = normalizeReviewSpendInput(input);
  const limit = parsed.limit ?? 100;
  const since = parsed.since ?? null;
  const charges = await fetchCharges(limit, since);
  const lineItems = charges.map(toLineItem);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_recommendations",
    dataWindow: { since, limit },
    lineItems,
    categoryTotals: summarizeByCategory(lineItems),
    flags: flagSpend(lineItems),
    runHistoryHint:
      "Save this response with prior runs if you want week-over-week spend trends beyond this single snapshot. No charges were created, refunded, or changed."
  };
}

export async function fetchCharges(
  limit = 100,
  since: string | null = null,
  fetchImpl: typeof fetch = fetch
): Promise<RawCharge[]> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is required");

  const url = new URL("https://api.stripe.com/v1/charges");
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 100)));
  if (since) url.searchParams.set("created[gte]", String(dateToUnix(since)));

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Stripe API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return (payload.data ?? []).map((row) => normalizeRawCharge(row));
}

function normalizeRawCharge(row: Record<string, unknown>): RawCharge {
  const billing = row.billing_details;
  const billingName =
    billing && typeof billing === "object"
      ? toNullableString((billing as Record<string, unknown>).name)
      : null;

  return {
    id: String(row.id ?? ""),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? "usd"),
    created: Number(row.created ?? 0),
    description: toNullableString(row.description),
    statement_descriptor: toNullableString(row.statement_descriptor),
    calculated_statement_descriptor: toNullableString(row.calculated_statement_descriptor),
    status: String(row.status ?? "unknown"),
    refunded: Boolean(row.refunded),
    billing_details: { name: billingName }
  };
}

function toLineItem(charge: RawCharge): SpendLineItem {
  const merchant = pickMerchant(charge);
  return {
    id: charge.id,
    created: new Date(charge.created * 1000).toISOString(),
    amount: Math.round(charge.amount) / 100,
    currency: charge.currency,
    merchant,
    description: charge.description,
    category: categorize(merchant, charge.description),
    status: charge.status,
    refunded: charge.refunded
  };
}

function pickMerchant(charge: RawCharge): string {
  const raw =
    charge.description ??
    charge.statement_descriptor ??
    charge.calculated_statement_descriptor ??
    charge.billing_details?.name ??
    "Unknown merchant";
  return raw.trim() || "Unknown merchant";
}

const CATEGORY_KEYWORDS: Array<{ category: SpendCategory; keywords: string[] }> = [
  {
    category: "infrastructure",
    keywords: ["aws", "amazon web", "gcp", "google cloud", "azure", "cloudflare", "vercel", "netlify", "digitalocean", "heroku", "render", "fly.io"]
  },
  {
    category: "advertising",
    keywords: ["google ads", "facebook", "meta ads", "linkedin ads", "twitter ads", "x ads", "tiktok ads", "reddit ads"]
  },
  {
    category: "payments_fees",
    keywords: ["stripe", "paypal", "processing fee", "transaction fee", "payout fee"]
  },
  {
    category: "payroll_contractors",
    keywords: ["payroll", "gusto", "deel", "remote.com", "rippling", "contractor", "upwork", "fiverr"]
  },
  {
    category: "software_saas",
    keywords: ["saas", "subscription", "notion", "slack", "github", "figma", "linear", "zoom", "datadog", "sentry", "openai", "anthropic", "twilio", "sendgrid", "mailgun", "loops", "hubspot", "salesforce", "license", "seat"]
  }
];

function categorize(merchant: string, description: string | null): SpendCategory {
  const haystack = `${merchant} ${description ?? ""}`.toLowerCase();
  for (const rule of CATEGORY_KEYWORDS) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }
  return "uncategorized";
}

function summarizeByCategory(lineItems: SpendLineItem[]): CategoryTotal[] {
  const totals = new Map<string, CategoryTotal>();
  for (const item of lineItems) {
    if (item.refunded) continue;
    const key = `${item.category}:${item.currency}`;
    const existing = totals.get(key);
    if (existing) {
      existing.total = Math.round((existing.total + item.amount) * 100) / 100;
      existing.count += 1;
    } else {
      totals.set(key, {
        category: item.category,
        currency: item.currency,
        total: item.amount,
        count: 1
      });
    }
  }
  return [...totals.values()].sort((a, b) => b.total - a.total);
}

export function flagSpend(lineItems: SpendLineItem[]): SpendFlag[] {
  const flags: SpendFlag[] = [];
  const active = lineItems.filter((item) => !item.refunded);

  flags.push(...findDuplicates(active));
  flags.push(...findAnomalies(active));
  flags.push(...findSaasForReview(active));

  for (const item of lineItems) {
    if (item.refunded) {
      flags.push({
        type: "refund",
        severity: "info",
        merchant: item.merchant,
        detail: `Charge ${item.id} for ${formatAmount(item.amount, item.currency)} was refunded. Confirm it was intentional.`
      });
    }
  }

  return flags;
}

function findDuplicates(lineItems: SpendLineItem[]): SpendFlag[] {
  const groups = new Map<string, SpendLineItem[]>();
  for (const item of lineItems) {
    const key = `${item.merchant.toLowerCase()}|${item.amount}|${item.currency}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  const flags: SpendFlag[] = [];
  for (const bucket of groups.values()) {
    if (bucket.length > 1) {
      const sample = bucket[0];
      flags.push({
        type: "duplicate",
        severity: "watch",
        merchant: sample.merchant,
        detail: `${bucket.length} charges of ${formatAmount(sample.amount, sample.currency)} from "${sample.merchant}" in this window. Possible duplicate subscription or double-billing to verify.`
      });
    }
  }
  return flags;
}

function findAnomalies(lineItems: SpendLineItem[]): SpendFlag[] {
  if (lineItems.length < 3) return [];
  const amounts = lineItems.map((item) => item.amount).sort((a, b) => a - b);
  const median = amounts[Math.floor(amounts.length / 2)];
  if (median <= 0) return [];

  const flags: SpendFlag[] = [];
  for (const item of lineItems) {
    if (item.amount > median * 3 && item.amount >= 100) {
      flags.push({
        type: "anomaly",
        severity: "action",
        merchant: item.merchant,
        detail: `Charge ${item.id} for ${formatAmount(item.amount, item.currency)} from "${item.merchant}" is more than 3x the median charge (${formatAmount(median, item.currency)}). Review before it recurs.`
      });
    }
  }
  return flags;
}

function findSaasForReview(lineItems: SpendLineItem[]): SpendFlag[] {
  const seen = new Set<string>();
  const flags: SpendFlag[] = [];
  for (const item of lineItems) {
    if (item.category !== "software_saas") continue;
    const key = item.merchant.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    flags.push({
      type: "review_saas",
      severity: "info",
      merchant: item.merchant,
      detail: `Recurring SaaS spend on "${item.merchant}". Confirm the tool is still in active use before the next renewal; cancel unused seats yourself if not.`
    });
  }
  return flags;
}

function formatAmount(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}

function dateToUnix(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00.000Z`).getTime() / 1000);
}

function toNullableString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value);
  return str.length > 0 ? str : null;
}

function optionalLimit(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error("limit must be an integer between 1 and 100.");
  }
  return value;
}

function optionalDate(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must be a YYYY-MM-DD date string.`);
  }
  return value;
}
