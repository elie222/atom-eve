export type ChurnSegment = "cancelled" | "at_risk";

export interface ChurnSubscription {
  id: string;
  customerId: string;
  status: string;
  amount: number | null;
  currency: string | null;
  interval: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  cancellationReason: string;
  cancellationFeedback: string | null;
  segment: ChurnSegment;
}

export interface ChurnReasonGroup {
  segment: ChurnSegment;
  reason: string;
  count: number;
  subscriptionIds: string[];
}

export interface WinbackOfferDraft {
  segment: ChurnSegment;
  reason: string;
  audienceSize: number;
  draftOffer: string;
}

export interface ChurnReview {
  generatedAt: string;
  mode: "read_only_draft";
  dataWindow: {
    lookbackDays: number;
    scanned: number;
  };
  segments: {
    cancelled: number;
    atRisk: number;
  };
  subscriptions: ChurnSubscription[];
  reasonBreakdown: ChurnReasonGroup[];
  offerDrafts: WinbackOfferDraft[];
  draftingHint: string;
  credentialsConfigured: boolean;
}

export const reviewChurnInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lookbackDays: {
      type: "number",
      description: "Only include cancellations from the last N days. Defaults to 30."
    },
    limit: {
      type: "number",
      description: "Maximum number of subscriptions to scan (1-100). Defaults to 100."
    }
  }
} as const;

export interface ReviewChurnInput {
  lookbackDays?: number;
  limit?: number;
}

export function normalizeReviewChurnInput(input: unknown): ReviewChurnInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Winback review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    lookbackDays: optionalPositiveInt(value.lookbackDays, "lookbackDays"),
    limit: optionalPositiveInt(value.limit, "limit")
  };
}

export async function reviewChurn(
  input: ReviewChurnInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<ChurnReview> {
  const parsed = normalizeReviewChurnInput(input);
  const lookbackDays = parsed.lookbackDays ?? 30;
  const limit = clamp(parsed.limit ?? 100, 1, 100);
  const cutoffMs = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

  const subscriptions = (await fetchSubscriptions(limit, fetchImpl))
    .map((sub) => classifySubscription(sub))
    .filter((sub): sub is ChurnSubscription => sub !== null)
    .filter((sub) => sub.segment === "at_risk" || withinLookback(sub.canceledAt, cutoffMs));

  const reasonBreakdown = groupByReason(subscriptions);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    dataWindow: { lookbackDays, scanned: limit },
    segments: {
      cancelled: subscriptions.filter((sub) => sub.segment === "cancelled").length,
      atRisk: subscriptions.filter((sub) => sub.segment === "at_risk").length
    },
    subscriptions,
    reasonBreakdown,
    offerDrafts: reasonBreakdown.map((group) => ({
      segment: group.segment,
      reason: group.reason,
      audienceSize: group.count,
      draftOffer: draftWinbackOffer(group.segment, group.reason)
    })),
    draftingHint:
      "These are draft win-back offers only. Refine the copy and incentive per segment, then present each draft for operator approval. Do not email customers, apply coupons, or change any subscription in Stripe without explicit sign-off.",
    credentialsConfigured: Boolean(process.env.STRIPE_SECRET_KEY)
  };
}

export async function fetchSubscriptions(
  limit: number,
  fetchImpl: typeof fetch = fetch
): Promise<Array<Record<string, unknown>>> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required");

  const url = new URL("https://api.stripe.com/v1/subscriptions");
  url.searchParams.set("status", "all");
  url.searchParams.set("limit", String(clamp(limit, 1, 100)));

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${secretKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Stripe API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return payload.data ?? [];
}

function classifySubscription(row: Record<string, unknown>): ChurnSubscription | null {
  const status = String(row.status ?? "");
  const cancelAtPeriodEnd = Boolean(row.cancel_at_period_end);
  const segment = toSegment(status, cancelAtPeriodEnd);
  if (segment === null) return null;

  const details = isRecord(row.cancellation_details) ? row.cancellation_details : {};
  const price = firstPrice(row.items);

  return {
    id: String(row.id ?? ""),
    customerId: String(row.customer ?? ""),
    status,
    amount: price.unitAmount === null ? null : price.unitAmount / 100,
    currency: price.currency,
    interval: price.interval,
    cancelAtPeriodEnd,
    canceledAt: epochToIso(row.canceled_at),
    cancellationReason: normalizeReason(details.reason),
    cancellationFeedback: details.feedback == null ? null : String(details.feedback),
    segment
  };
}

function toSegment(status: string, cancelAtPeriodEnd: boolean): ChurnSegment | null {
  if (status === "canceled") return "cancelled";
  if (status === "past_due" || status === "unpaid" || cancelAtPeriodEnd) return "at_risk";
  return null;
}

function groupByReason(subscriptions: ChurnSubscription[]): ChurnReasonGroup[] {
  const groups = new Map<string, ChurnReasonGroup>();
  for (const sub of subscriptions) {
    const key = `${sub.segment}:${sub.cancellationReason}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      existing.subscriptionIds.push(sub.id);
    } else {
      groups.set(key, {
        segment: sub.segment,
        reason: sub.cancellationReason,
        count: 1,
        subscriptionIds: [sub.id]
      });
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

function draftWinbackOffer(segment: ChurnSegment, reason: string): string {
  const prefix =
    segment === "at_risk"
      ? "At-risk save play: reach out before the period ends."
      : "Win-back play: re-engage this churned cohort.";

  switch (reason) {
    case "too_expensive":
      return `${prefix} Draft a limited-time discount or a cheaper annual/lower tier and lead with the savings.`;
    case "missing_features":
      return `${prefix} Draft a "we shipped what you asked for" note highlighting recently launched features.`;
    case "too_complex":
      return `${prefix} Draft an offer for hands-on onboarding or a guided setup call to lower friction.`;
    case "low_quality":
      return `${prefix} Draft a reliability/quality update plus a goodwill credit to rebuild trust.`;
    case "switched_service":
      return `${prefix} Draft a differentiation message and a migration-back incentive.`;
    case "customer_service":
      return `${prefix} Draft a personal apology from a named owner plus a priority-support offer.`;
    case "unused":
      return `${prefix} Draft a value-reminder with a quick-win checklist and an extended trial of a key feature.`;
    case "payment_failed":
      return `${prefix} Draft a friendly payment-recovery note with a link to update the card on file.`;
    default:
      return `${prefix} Draft a personalized check-in asking what would earn their business back, with a modest goodwill incentive.`;
  }
}

function firstPrice(items: unknown): {
  unitAmount: number | null;
  currency: string | null;
  interval: string | null;
} {
  const data = isRecord(items) && Array.isArray(items.data) ? items.data : [];
  const first = data.find((item): item is Record<string, unknown> => isRecord(item));
  const price = first && isRecord(first.price) ? first.price : null;
  if (!price) return { unitAmount: null, currency: null, interval: null };
  const recurring = isRecord(price.recurring) ? price.recurring : {};
  return {
    unitAmount: price.unit_amount == null ? null : Number(price.unit_amount),
    currency: price.currency == null ? null : String(price.currency),
    interval: recurring.interval == null ? null : String(recurring.interval)
  };
}

function withinLookback(canceledAt: string | null, cutoffMs: number): boolean {
  if (!canceledAt) return false;
  return new Date(canceledAt).getTime() >= cutoffMs;
}

function normalizeReason(reason: unknown): string {
  if (reason == null || reason === "") return "unknown";
  return String(reason);
}

function epochToIso(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function optionalPositiveInt(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive number.`);
  }
  return Math.floor(value);
}
