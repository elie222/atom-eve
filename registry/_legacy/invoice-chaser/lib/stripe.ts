export type AgingBucket = "1-30" | "31-60" | "61-90" | "90+";

export type EscalationTier = "gentle" | "firm" | "urgent" | "final";

export interface StripeInvoice {
  id: string;
  number: string | null;
  customerName: string;
  customerEmail: string | null;
  amountDue: number;
  currency: string;
  dueDate: number | null;
  hostedInvoiceUrl: string | null;
}

export interface OverdueInvoice {
  id: string;
  number: string | null;
  customerName: string;
  customerEmail: string | null;
  amountDue: number;
  amountDisplay: string;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  agingBucket: AgingBucket;
  hostedInvoiceUrl: string | null;
}

export interface ReminderDraft {
  invoiceId: string;
  number: string | null;
  customerName: string;
  customerEmail: string | null;
  daysOverdue: number;
  escalation: EscalationTier;
  subject: string;
  body: string;
}

export interface AgingBucketSummary {
  bucket: AgingBucket;
  count: number;
  amount: number;
}

export interface CurrencyTotal {
  currency: string;
  count: number;
  amount: number;
  amountDisplay: string;
}

export interface AgingSummary {
  invoiceCount: number;
  buckets: AgingBucketSummary[];
  byCurrency: CurrencyTotal[];
}

export interface OverdueInvoiceReview {
  generatedAt: string;
  mode: "read_only_draft";
  asOf: string;
  agingSummary: AgingSummary;
  overdueInvoices: OverdueInvoice[];
  reminderDrafts: ReminderDraft[];
  draftingHint: string;
}

export const reviewOverdueInvoicesInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    currentDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "UTC date to treat as today in YYYY-MM-DD format. Defaults to the current date."
    }
  }
} as const;

export interface ReviewOverdueInvoicesInput {
  currentDate?: string;
}

export function normalizeReviewOverdueInvoicesInput(input: unknown): ReviewOverdueInvoicesInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invoice review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.currentDate === undefined) return {};
  if (typeof value.currentDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.currentDate)) {
    throw new Error("currentDate must be a YYYY-MM-DD date string.");
  }
  return { currentDate: value.currentDate };
}

export async function reviewOverdueInvoices(
  input: ReviewOverdueInvoicesInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<OverdueInvoiceReview> {
  const parsed = normalizeReviewOverdueInvoicesInput(input);
  const asOfMs = parsed.currentDate ? Date.parse(`${parsed.currentDate}T00:00:00.000Z`) : Date.now();
  const asOf = new Date(asOfMs).toISOString().slice(0, 10);

  const invoices = await fetchOpenInvoices(fetchImpl);
  const overdueInvoices = toOverdueInvoices(invoices, asOfMs);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    asOf,
    agingSummary: summarizeAging(overdueInvoices),
    overdueInvoices,
    reminderDrafts: overdueInvoices.map(draftReminder),
    draftingHint:
      "These are drafts only. Review each reminder and the aging summary, then send approved reminders from Stripe or your own outbound tool. Nothing was sent and no invoice was modified."
  };
}

export async function fetchOpenInvoices(fetchImpl: typeof fetch = fetch): Promise<StripeInvoice[]> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is required");

  const url = new URL("https://api.stripe.com/v1/invoices");
  url.searchParams.set("status", "open");
  url.searchParams.set("limit", "100");

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Stripe API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return (payload.data ?? []).map((row) => ({
    id: String(row.id ?? ""),
    number: row.number == null ? null : String(row.number),
    customerName: String(row.customer_name ?? "Unknown customer"),
    customerEmail: row.customer_email == null ? null : String(row.customer_email),
    amountDue: Number(row.amount_due ?? 0),
    currency: String(row.currency ?? "usd"),
    dueDate: row.due_date == null ? null : Number(row.due_date),
    hostedInvoiceUrl: row.hosted_invoice_url == null ? null : String(row.hosted_invoice_url)
  }));
}

function toOverdueInvoices(invoices: StripeInvoice[], asOfMs: number): OverdueInvoice[] {
  return invoices
    .filter((invoice) => invoice.dueDate !== null && invoice.dueDate * 1000 < asOfMs)
    .map((invoice) => {
      const dueMs = (invoice.dueDate as number) * 1000;
      const daysOverdue = Math.max(0, Math.floor((asOfMs - dueMs) / 86_400_000));
      return {
        id: invoice.id,
        number: invoice.number,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        amountDue: invoice.amountDue,
        amountDisplay: formatAmount(invoice.amountDue, invoice.currency),
        currency: invoice.currency,
        dueDate: new Date(dueMs).toISOString().slice(0, 10),
        daysOverdue,
        agingBucket: bucketFor(daysOverdue),
        hostedInvoiceUrl: invoice.hostedInvoiceUrl
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

function summarizeAging(invoices: OverdueInvoice[]): AgingSummary {
  const order: AgingBucket[] = ["1-30", "31-60", "61-90", "90+"];
  const bucketTotals = new Map<AgingBucket, AgingBucketSummary>(
    order.map((bucket) => [bucket, { bucket, count: 0, amount: 0 }])
  );
  const currencyTotals = new Map<string, { currency: string; count: number; amount: number }>();

  for (const invoice of invoices) {
    const bucket = bucketTotals.get(invoice.agingBucket);
    if (bucket) {
      bucket.count += 1;
      bucket.amount += invoice.amountDue;
    }

    const currency = currencyTotals.get(invoice.currency) ?? {
      currency: invoice.currency,
      count: 0,
      amount: 0
    };
    currency.count += 1;
    currency.amount += invoice.amountDue;
    currencyTotals.set(invoice.currency, currency);
  }

  return {
    invoiceCount: invoices.length,
    buckets: order.map((bucket) => bucketTotals.get(bucket) as AgingBucketSummary),
    byCurrency: [...currencyTotals.values()].map((total) => ({
      ...total,
      amountDisplay: formatAmount(total.amount, total.currency)
    }))
  };
}

function draftReminder(invoice: OverdueInvoice): ReminderDraft {
  const escalation = escalationFor(invoice.daysOverdue);
  const label = invoice.number ? `invoice ${invoice.number}` : "your invoice";
  const tones: Record<EscalationTier, { subject: string; body: string }> = {
    gentle: {
      subject: `Friendly reminder: ${label} (${invoice.amountDisplay})`,
      body: `Hi ${invoice.customerName},\n\nJust a friendly reminder that ${label} for ${invoice.amountDisplay} was due on ${invoice.dueDate} and is now ${invoice.daysOverdue} days past due. If you have already sent payment, please disregard this note. Otherwise you can settle it here: ${invoice.hostedInvoiceUrl ?? "[invoice link]"}.\n\nThank you!`
    },
    firm: {
      subject: `Past due: ${label} (${invoice.amountDisplay})`,
      body: `Hi ${invoice.customerName},\n\nOur records show ${label} for ${invoice.amountDisplay} is now ${invoice.daysOverdue} days overdue (due ${invoice.dueDate}). Please arrange payment at your earliest convenience: ${invoice.hostedInvoiceUrl ?? "[invoice link]"}. If there is an issue with this invoice, reply and we will sort it out.\n\nThanks for your prompt attention.`
    },
    urgent: {
      subject: `Action needed: ${label} is ${invoice.daysOverdue} days overdue`,
      body: `Hi ${invoice.customerName},\n\n${label} for ${invoice.amountDisplay} is now ${invoice.daysOverdue} days overdue (due ${invoice.dueDate}). We need to bring this account current. Please pay here as soon as possible: ${invoice.hostedInvoiceUrl ?? "[invoice link]"}, or reply today to arrange a payment plan.\n\nWe would like to resolve this quickly.`
    },
    final: {
      subject: `Final notice: ${label} (${invoice.amountDisplay}) ${invoice.daysOverdue} days overdue`,
      body: `Hi ${invoice.customerName},\n\nThis is a final reminder that ${label} for ${invoice.amountDisplay} is now ${invoice.daysOverdue} days overdue (due ${invoice.dueDate}) and remains unpaid despite earlier notices. Please pay immediately: ${invoice.hostedInvoiceUrl ?? "[invoice link]"}, or contact us today to avoid further escalation.`
    }
  };

  const tone = tones[escalation];
  return {
    invoiceId: invoice.id,
    number: invoice.number,
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail,
    daysOverdue: invoice.daysOverdue,
    escalation,
    subject: tone.subject,
    body: tone.body
  };
}

function bucketFor(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 30) return "1-30";
  if (daysOverdue <= 60) return "31-60";
  if (daysOverdue <= 90) return "61-90";
  return "90+";
}

function escalationFor(daysOverdue: number): EscalationTier {
  if (daysOverdue <= 14) return "gentle";
  if (daysOverdue <= 30) return "firm";
  if (daysOverdue <= 60) return "urgent";
  return "final";
}

function formatAmount(amountInMinorUnits: number, currency: string): string {
  return `${(amountInMinorUnits / 100).toFixed(2)} ${currency.toUpperCase()}`;
}
