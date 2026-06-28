export interface FailedPayment {
  chargeId: string;
  amount: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  createdAt: string;
}

export interface ExpiringCard {
  chargeId: string;
  customerEmail: string | null;
  customerName: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  expMonth: number;
  expYear: number;
}

export interface RecoveryEmailStage {
  stage: number;
  trigger: "failed_payment" | "expiring_card";
  sendOffsetDays: number;
  subject: string;
  body: string;
}

export interface RecoveryRecommendation {
  reference: string;
  severity: "info" | "watch" | "action";
  recommendation: string;
}

export interface FailedPaymentReview {
  generatedAt: string;
  mode: "read_only_draft";
  dataWindow: { limit: number; expiringWindow: { from: string; through: string } };
  failedPayments: FailedPayment[];
  expiringCards: ExpiringCard[];
  recoverySequence: RecoveryEmailStage[];
  recommendations: RecoveryRecommendation[];
  draftingHint: string;
}

export const reviewFailedPaymentsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Maximum number of recent charges to scan. Defaults to 100."
    },
    currentDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "UTC date in YYYY-MM-DD used to detect cards expiring this or next month. Defaults to today."
    }
  }
} as const;

export interface ReviewFailedPaymentsInput {
  limit?: number;
  currentDate?: string;
}

export function normalizeReviewFailedPaymentsInput(input: unknown): ReviewFailedPaymentsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Dunning review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  const result: ReviewFailedPaymentsInput = {};

  if (value.limit !== undefined) {
    const limit = Number(value.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("limit must be an integer between 1 and 100.");
    }
    result.limit = limit;
  }

  if (value.currentDate !== undefined) {
    if (typeof value.currentDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.currentDate)) {
      throw new Error("currentDate must be a YYYY-MM-DD date string.");
    }
    result.currentDate = value.currentDate;
  }

  return result;
}

interface RawCharge {
  id?: unknown;
  amount?: unknown;
  currency?: unknown;
  status?: unknown;
  created?: unknown;
  failure_code?: unknown;
  failure_message?: unknown;
  billing_details?: { email?: unknown; name?: unknown };
  payment_method_details?: {
    card?: { brand?: unknown; last4?: unknown; exp_month?: unknown; exp_year?: unknown };
  };
}

export async function reviewFailedPayments(
  input: ReviewFailedPaymentsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<FailedPaymentReview> {
  const parsed = normalizeReviewFailedPaymentsInput(input);
  const limit = parsed.limit ?? 100;
  const today = parsed.currentDate ?? new Date().toISOString().slice(0, 10);
  const charges = await fetchCharges(limit, fetchImpl);

  const failedPayments = charges
    .filter((charge) => String(charge.status ?? "") === "failed")
    .map(toFailedPayment);

  const expiringCards = collectExpiringCards(charges, today);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    dataWindow: { limit, expiringWindow: expiringWindow(today) },
    failedPayments,
    expiringCards,
    recoverySequence: buildRecoverySequence(failedPayments, expiringCards),
    recommendations: recommendRecovery(failedPayments, expiringCards),
    draftingHint:
      "These are draft recovery emails for operator approval. Personalize each stage with the customer's name and the update-payment link from your billing portal, then send them yourself or through your email tool. This agent does not charge cards or send mail."
  };
}

export async function fetchCharges(limit = 100, fetchImpl: typeof fetch = fetch): Promise<RawCharge[]> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required");

  const url = new URL("https://api.stripe.com/v1/charges");
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 100)));

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${secretKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Stripe API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { data?: RawCharge[] };
  return Array.isArray(payload.data) ? payload.data : [];
}

function toFailedPayment(charge: RawCharge): FailedPayment {
  const card = charge.payment_method_details?.card;
  return {
    chargeId: String(charge.id ?? ""),
    amount: Number(charge.amount ?? 0),
    currency: String(charge.currency ?? "usd"),
    customerEmail: optionalString(charge.billing_details?.email),
    customerName: optionalString(charge.billing_details?.name),
    failureCode: optionalString(charge.failure_code),
    failureMessage: optionalString(charge.failure_message),
    cardBrand: optionalString(card?.brand),
    cardLast4: optionalString(card?.last4),
    createdAt: new Date(Number(charge.created ?? 0) * 1000).toISOString()
  };
}

function collectExpiringCards(charges: RawCharge[], today: string): ExpiringCard[] {
  const window = expiringWindow(today);
  const seen = new Set<string>();
  const result: ExpiringCard[] = [];

  for (const charge of charges) {
    const card = charge.payment_method_details?.card;
    if (!card) continue;
    const expMonth = Number(card.exp_month ?? 0);
    const expYear = Number(card.exp_year ?? 0);
    if (!expMonth || !expYear) continue;

    const expKey = `${expYear}-${String(expMonth).padStart(2, "0")}`;
    if (expKey < window.from || expKey > window.through) continue;

    const last4 = optionalString(card.last4) ?? "";
    const email = optionalString(charge.billing_details?.email) ?? "";
    const dedupeKey = `${email}:${last4}:${expKey}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    result.push({
      chargeId: String(charge.id ?? ""),
      customerEmail: optionalString(charge.billing_details?.email),
      customerName: optionalString(charge.billing_details?.name),
      cardBrand: optionalString(card.brand),
      cardLast4: last4 || null,
      expMonth,
      expYear
    });
  }

  return result;
}

export function buildRecoverySequence(
  failedPayments: FailedPayment[],
  expiringCards: ExpiringCard[]
): RecoveryEmailStage[] {
  const stages: RecoveryEmailStage[] = [];

  if (failedPayments.length > 0) {
    stages.push(
      {
        stage: 1,
        trigger: "failed_payment",
        sendOffsetDays: 0,
        subject: "Quick heads up: your last payment didn't go through",
        body:
          "Hi {{customer_name}},\n\nWe tried to process your recent payment but the charge didn't go through. This usually means an expired card or a temporary bank decline.\n\nYou can update your payment details here: {{update_payment_link}}\n\nNo action is needed beyond that and we'll retry automatically. Reply if anything looks off."
      },
      {
        stage: 2,
        trigger: "failed_payment",
        sendOffsetDays: 3,
        subject: "Reminder: please update your payment method",
        body:
          "Hi {{customer_name}},\n\nWe still weren't able to collect your payment. To avoid any interruption, please update your card here: {{update_payment_link}}\n\nIf you've already taken care of this, you can ignore this note. We're happy to help if you have questions."
      },
      {
        stage: 3,
        trigger: "failed_payment",
        sendOffsetDays: 7,
        subject: "Final reminder before your account is affected",
        body:
          "Hi {{customer_name}},\n\nThis is the last reminder that your payment is still outstanding. To keep your account active, please update your payment method here: {{update_payment_link}}\n\nIf there's a billing issue we should know about, just reply and we'll sort it out together."
      }
    );
  }

  if (expiringCards.length > 0) {
    stages.push({
      stage: stages.length + 1,
      trigger: "expiring_card",
      sendOffsetDays: 0,
      subject: "Your card on file is about to expire",
      body:
        "Hi {{customer_name}},\n\nThe {{card_brand}} card ending in {{card_last4}} on your account expires soon. Update it now to avoid a missed payment: {{update_payment_link}}\n\nIt only takes a moment. Thanks for keeping things up to date."
    });
  }

  return stages;
}

export function recommendRecovery(
  failedPayments: FailedPayment[],
  expiringCards: ExpiringCard[]
): RecoveryRecommendation[] {
  const recommendations: RecoveryRecommendation[] = [];

  for (const payment of failedPayments) {
    const hardDecline = (payment.failureCode ?? "").includes("do_not_honor") ||
      (payment.failureCode ?? "").includes("lost_card") ||
      (payment.failureCode ?? "").includes("stolen_card");
    recommendations.push({
      reference: payment.chargeId,
      severity: hardDecline ? "action" : "watch",
      recommendation: hardDecline
        ? "Hard decline detected. Draft the recovery sequence and ask the customer to use a different card; an automatic retry is unlikely to succeed. No charge or email was sent."
        : "Soft decline. Draft the recovery sequence and let Stripe's automatic retries continue. No charge or email was sent."
    });
  }

  for (const card of expiringCards) {
    recommendations.push({
      reference: card.chargeId,
      severity: "info",
      recommendation:
        "Card is expiring soon. Draft the expiring-card notice so the customer can update before the next billing cycle. No charge or email was sent."
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      reference: "none",
      severity: "info",
      recommendation: "No failed charges or expiring cards in the scanned window. Keep monitoring."
    });
  }

  return recommendations;
}

function expiringWindow(today: string): { from: string; through: string } {
  const parsed = new Date(`${today}T00:00:00.000Z`);
  const from = `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`;
  const next = new Date(parsed);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const through = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
  return { from, through };
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}
