export interface StripeRefund {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string | null;
  charge: string | null;
  paymentIntent: string | null;
  created: string;
}

export interface StripeDispute {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string | null;
  charge: string | null;
  paymentIntent: string | null;
  evidenceDueBy: string | null;
  created: string;
}

export type FollowUpSeverity = "info" | "watch" | "action";

export interface RefundFollowUp {
  kind: "refund" | "dispute";
  id: string;
  status: string;
  severity: FollowUpSeverity;
  draftFollowUp: string;
}

export interface RefundChaserReview {
  generatedAt: string;
  mode: "read_only_draft";
  openRefunds: StripeRefund[];
  openDisputes: StripeDispute[];
  followUps: RefundFollowUp[];
  draftingHint: string;
}

const OPEN_REFUND_STATUSES = new Set(["pending", "requires_action"]);
const OPEN_DISPUTE_STATUSES = new Set([
  "needs_response",
  "warning_needs_response",
  "under_review",
  "warning_under_review"
]);

export const reviewRefundsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {}
} as const;

export async function reviewRefunds(fetchImpl: typeof fetch = fetch): Promise<RefundChaserReview> {
  const [refunds, disputes] = await Promise.all([fetchRefunds(fetchImpl), fetchDisputes(fetchImpl)]);
  const openRefunds = refunds.filter((refund) => OPEN_REFUND_STATUSES.has(refund.status));
  const openDisputes = disputes.filter((dispute) => OPEN_DISPUTE_STATUSES.has(dispute.status));

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    openRefunds,
    openDisputes,
    followUps: [...recommendRefundFollowUps(openRefunds), ...recommendDisputeFollowUps(openDisputes)],
    draftingHint:
      "Draft the next customer or evidence follow-up for each open refund and dispute, then present the drafts for operator approval. Do not submit dispute evidence, issue refunds, or claim anything was sent unless a separate write tool confirms it."
  };
}

export async function fetchRefunds(fetchImpl: typeof fetch = fetch): Promise<StripeRefund[]> {
  const rows = await listStripeResource("refunds", fetchImpl);
  return rows.map(normalizeRefund);
}

export async function fetchDisputes(fetchImpl: typeof fetch = fetch): Promise<StripeDispute[]> {
  const rows = await listStripeResource("disputes", fetchImpl);
  return rows.map(normalizeDispute);
}

export function recommendRefundFollowUps(refunds: StripeRefund[]): RefundFollowUp[] {
  return refunds.map((refund) => {
    const amount = formatAmount(refund.amount, refund.currency);
    if (refund.status === "requires_action") {
      return {
        kind: "refund",
        id: refund.id,
        status: refund.status,
        severity: "action",
        draftFollowUp: `Refund ${refund.id} (${amount}) needs action before it can clear. Draft a note that confirms the customer's bank details or payout method, and flag it for an operator to complete the refund.`
      };
    }
    return {
      kind: "refund",
      id: refund.id,
      status: refund.status,
      severity: "watch",
      draftFollowUp: `Refund ${refund.id} (${amount}) is still pending. Draft a short status update reassuring the customer that the refund is processing, and keep chasing until it reaches succeeded.`
    };
  });
}

export function recommendDisputeFollowUps(disputes: StripeDispute[]): RefundFollowUp[] {
  return disputes.map((dispute) => {
    const amount = formatAmount(dispute.amount, dispute.currency);
    const due = dispute.evidenceDueBy ? ` Evidence is due by ${dispute.evidenceDueBy}.` : "";
    if (dispute.status === "needs_response" || dispute.status === "warning_needs_response") {
      return {
        kind: "dispute",
        id: dispute.id,
        status: dispute.status,
        severity: "action",
        draftFollowUp: `Dispute ${dispute.id} (${amount}, reason: ${dispute.reason ?? "unknown"}) needs a response.${due} Draft the evidence narrative and the list of supporting documents to gather, then present it for operator approval before any submission.`
      };
    }
    return {
      kind: "dispute",
      id: dispute.id,
      status: dispute.status,
      severity: "watch",
      draftFollowUp: `Dispute ${dispute.id} (${amount}) is under review. Draft an internal status note and keep monitoring until it is won or lost.`
    };
  });
}

async function listStripeResource(
  resource: "refunds" | "disputes",
  fetchImpl: typeof fetch
): Promise<Array<Record<string, unknown>>> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is required");

  const url = new URL(`https://api.stripe.com/v1/${resource}`);
  url.searchParams.set("limit", "100");

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Stripe API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return Array.isArray(payload.data) ? payload.data : [];
}

function normalizeRefund(row: Record<string, unknown>): StripeRefund {
  return {
    id: String(row.id ?? ""),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? "usd"),
    status: String(row.status ?? "unknown"),
    reason: row.reason == null ? null : String(row.reason),
    charge: row.charge == null ? null : String(row.charge),
    paymentIntent: row.payment_intent == null ? null : String(row.payment_intent),
    created: toIso(row.created)
  };
}

function normalizeDispute(row: Record<string, unknown>): StripeDispute {
  const evidenceDetails = row.evidence_details;
  const dueBy =
    evidenceDetails && typeof evidenceDetails === "object"
      ? (evidenceDetails as { due_by?: unknown }).due_by
      : undefined;

  return {
    id: String(row.id ?? ""),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? "usd"),
    status: String(row.status ?? "unknown"),
    reason: row.reason == null ? null : String(row.reason),
    charge: row.charge == null ? null : String(row.charge),
    paymentIntent: row.payment_intent == null ? null : String(row.payment_intent),
    evidenceDueBy: dueBy == null ? null : toIso(dueBy),
    created: toIso(row.created)
  };
}

function toIso(seconds: unknown): string {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return new Date(0).toISOString();
  return new Date(value * 1000).toISOString();
}

function formatAmount(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}
