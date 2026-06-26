// Read-only Stripe revenue reader. It lists active and recently canceled subscriptions plus paid
// invoices to summarize MRR, new/churn, and top accounts for a weekly digest. It never creates,
// updates, or cancels anything in Stripe.

export interface TopAccount {
  customerId: string;
  monthlyAmount: number;
  subscriptionCount: number;
}

export interface RevenueRecommendation {
  severity: "info" | "watch" | "action";
  recommendation: string;
}

export interface RevenueDigest {
  generatedAt: string;
  mode: "read_only_recommendations";
  window: { since: string; until: string; days: number };
  currency: string;
  mixedCurrencies: boolean;
  mrr: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  newMrr: number;
  churnedSubscriptions: number;
  churnedMrr: number;
  collectedInWindow: number;
  topAccounts: TopAccount[];
  recommendations: RevenueRecommendation[];
  runHistoryHint: string;
}

interface StripePrice {
  unit_amount: number | null;
  currency?: string;
  recurring?: { interval?: string; interval_count?: number } | null;
}

interface StripeSubscriptionItem {
  quantity?: number;
  price?: StripePrice | null;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  created: number;
  canceled_at: number | null;
  currency?: string;
  items?: { data?: StripeSubscriptionItem[] };
}

interface StripeInvoice {
  amount_paid?: number;
}

export const reviewRevenueInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    windowDays: {
      type: "integer",
      minimum: 1,
      maximum: 90,
      description: "Lookback window in days for new, churned, and collected metrics. Defaults to 7."
    },
    topAccountsLimit: {
      type: "integer",
      minimum: 1,
      maximum: 50,
      description: "How many top accounts by MRR to include. Defaults to 5."
    }
  }
} as const;

export interface ReviewRevenueInput {
  windowDays?: number;
  topAccountsLimit?: number;
}

export function normalizeReviewRevenueInput(input: unknown): ReviewRevenueInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Revenue digest input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    windowDays: optionalInteger(value.windowDays, "windowDays", 1, 90),
    topAccountsLimit: optionalInteger(value.topAccountsLimit, "topAccountsLimit", 1, 50)
  };
}

export async function reviewRevenue(
  input: ReviewRevenueInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<RevenueDigest> {
  const parsed = normalizeReviewRevenueInput(input);
  const windowDays = parsed.windowDays ?? 7;
  const topAccountsLimit = parsed.topAccountsLimit ?? 5;

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const windowStartUnix = Math.floor(windowStart.getTime() / 1000);

  const [activeSubs, canceledSubs, paidInvoices] = await Promise.all([
    fetchSubscriptions("active", fetchImpl),
    fetchSubscriptions("canceled", fetchImpl),
    fetchPaidInvoices(windowStartUnix, fetchImpl)
  ]);

  const currencies = activeSubs
    .map((sub) => normalizeCurrency(sub))
    .filter((value): value is string => Boolean(value));
  const currency = dominantCurrency(currencies) ?? "usd";
  const mixedCurrencies = new Set(currencies).size > 1;

  const mrr = activeSubs.reduce((total, sub) => total + subscriptionMonthlyMinor(sub), 0);
  const newSubs = activeSubs.filter((sub) => sub.created >= windowStartUnix);
  const newMrr = newSubs.reduce((total, sub) => total + subscriptionMonthlyMinor(sub), 0);
  const churnedSubs = canceledSubs.filter(
    (sub) => sub.canceled_at !== null && sub.canceled_at >= windowStartUnix
  );
  const churnedMrr = churnedSubs.reduce((total, sub) => total + subscriptionMonthlyMinor(sub), 0);
  const collectedInWindow = paidInvoices.reduce((total, invoice) => total + (invoice.amount_paid ?? 0), 0);

  const topAccounts = buildTopAccounts(activeSubs, topAccountsLimit);

  return {
    generatedAt: now.toISOString(),
    mode: "read_only_recommendations",
    window: { since: isoDate(windowStart), until: isoDate(now), days: windowDays },
    currency,
    mixedCurrencies,
    mrr: toMajor(mrr),
    activeSubscriptions: activeSubs.length,
    newSubscriptions: newSubs.length,
    newMrr: toMajor(newMrr),
    churnedSubscriptions: churnedSubs.length,
    churnedMrr: toMajor(churnedMrr),
    collectedInWindow: toMajor(collectedInWindow),
    topAccounts: topAccounts.map((account) => ({
      ...account,
      monthlyAmount: toMajor(account.monthlyAmount)
    })),
    recommendations: recommendRevenueActions({
      mrr,
      newSubs: newSubs.length,
      churnedSubs: churnedSubs.length,
      churnedMrr,
      topAccountMinor: topAccounts[0]?.monthlyAmount ?? 0,
      mixedCurrencies
    }),
    runHistoryHint:
      "Expansion and contraction need a prior snapshot to compute. Save this digest with your past weekly runs (for example runs/revenue-digest/YYYY-MM-DD.json) so the agent can compare against last week and report expansion MRR."
  };
}

export async function fetchSubscriptions(
  status: "active" | "canceled",
  fetchImpl: typeof fetch = fetch
): Promise<StripeSubscription[]> {
  const payload = await stripeGet<{ data?: StripeSubscription[] }>(
    "subscriptions",
    { status, limit: "100", "expand[]": "data.items.data.price" },
    fetchImpl
  );
  return payload.data ?? [];
}

export async function fetchPaidInvoices(
  createdGte: number,
  fetchImpl: typeof fetch = fetch
): Promise<StripeInvoice[]> {
  const payload = await stripeGet<{ data?: StripeInvoice[] }>(
    "invoices",
    { status: "paid", limit: "100", "created[gte]": String(createdGte) },
    fetchImpl
  );
  return payload.data ?? [];
}

async function stripeGet<T>(
  path: string,
  params: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<T> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is required");

  const url = new URL(`https://api.stripe.com/v1/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Stripe API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }
  return (await response.json()) as T;
}

export function subscriptionMonthlyMinor(sub: StripeSubscription): number {
  const items = sub.items?.data ?? [];
  return items.reduce((total, item) => total + itemMonthlyMinor(item), 0);
}

function itemMonthlyMinor(item: StripeSubscriptionItem): number {
  const price = item.price;
  if (!price || !price.recurring) return 0;
  const quantity = item.quantity ?? 1;
  const amount = (price.unit_amount ?? 0) * quantity;
  const intervalCount = price.recurring.interval_count ?? 1;
  if (intervalCount <= 0) return 0;

  switch (price.recurring.interval) {
    case "month":
      return amount / intervalCount;
    case "year":
      return amount / (12 * intervalCount);
    case "week":
      return (amount * 52) / (12 * intervalCount);
    case "day":
      return (amount * 365) / (12 * intervalCount);
    default:
      return 0;
  }
}

function buildTopAccounts(subs: StripeSubscription[], limit: number): TopAccount[] {
  const byCustomer = new Map<string, TopAccount>();
  for (const sub of subs) {
    const customerId = sub.customer || "unknown";
    const existing = byCustomer.get(customerId) ?? {
      customerId,
      monthlyAmount: 0,
      subscriptionCount: 0
    };
    existing.monthlyAmount += subscriptionMonthlyMinor(sub);
    existing.subscriptionCount += 1;
    byCustomer.set(customerId, existing);
  }
  return [...byCustomer.values()]
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
    .slice(0, limit);
}

interface RecommendationContext {
  mrr: number;
  newSubs: number;
  churnedSubs: number;
  churnedMrr: number;
  topAccountMinor: number;
  mixedCurrencies: boolean;
}

export function recommendRevenueActions(context: RecommendationContext): RevenueRecommendation[] {
  const recommendations: RevenueRecommendation[] = [];

  if (context.mixedCurrencies) {
    recommendations.push({
      severity: "watch",
      recommendation:
        "Subscriptions span multiple currencies. MRR is summed across currencies without conversion, so treat the totals as approximate and segment by currency before reporting."
    });
  }

  const churnRatio = context.mrr > 0 ? context.churnedMrr / context.mrr : 0;
  if (churnRatio > 0.05) {
    recommendations.push({
      severity: "action",
      recommendation:
        "Churned MRR is more than 5% of current MRR this window. Review cancellation reasons and at-risk accounts. No subscriptions were changed."
    });
  } else if (context.churnedSubs > 0) {
    recommendations.push({
      severity: "watch",
      recommendation:
        "Some subscriptions churned this window. Confirm whether they were voluntary or failed-payment churn before drawing conclusions."
    });
  }

  if (context.newSubs === 0) {
    recommendations.push({
      severity: "watch",
      recommendation: "No new subscriptions started in this window. Check acquisition and checkout funnels."
    });
  }

  if (context.mrr > 0 && context.topAccountMinor / context.mrr > 0.25) {
    recommendations.push({
      severity: "watch",
      recommendation:
        "A single account is more than 25% of MRR. Flag the revenue-concentration risk to the operator."
    });
  }

  recommendations.push({
    severity: "info",
    recommendation:
      "Compare this digest against last week's saved snapshot to report expansion and contraction MRR. This run only reads Stripe and makes no changes."
  });

  return recommendations;
}

function normalizeCurrency(sub: StripeSubscription): string | null {
  if (sub.currency) return sub.currency;
  const price = sub.items?.data?.[0]?.price;
  return price?.currency ?? null;
}

function dominantCurrency(currencies: string[]): string | null {
  if (currencies.length === 0) return null;
  const counts = new Map<string, number>();
  for (const currency of currencies) {
    counts.set(currency, (counts.get(currency) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = -1;
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }
  return best;
}

function toMajor(minor: number): number {
  return Math.round((minor / 100) * 100) / 100;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function optionalInteger(value: unknown, field: string, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}.`);
  }
  return value;
}
