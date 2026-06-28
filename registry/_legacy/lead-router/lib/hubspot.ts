export interface HubspotContact {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  jobTitle: string | null;
  lifecycleStage: string | null;
  leadStatus: string | null;
  country: string | null;
  conversionEvents: number;
  pageViews: number;
  createdAt: string | null;
}

export interface LeadScore {
  icpFit: number;
  intent: number;
  total: number;
  tier: "hot" | "warm" | "nurture";
}

export interface LeadRouting {
  contactId: string;
  name: string;
  email: string | null;
  company: string | null;
  score: LeadScore;
  suggestedAssignment: string;
  firstTouchDraft: string;
  reasons: string[];
}

export const reviewNewLeadsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "How many recent contacts to read and score. Defaults to 25."
    }
  }
} as const;

export interface ReviewNewLeadsInput {
  limit?: number;
}

export function normalizeReviewNewLeadsInput(input: unknown): ReviewNewLeadsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Lead router input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.limit === undefined) return {};
  if (typeof value.limit !== "number" || !Number.isInteger(value.limit) || value.limit < 1 || value.limit > 100) {
    throw new Error("limit must be an integer between 1 and 100.");
  }
  return { limit: value.limit };
}

// Read-only, draft-first. This reads recent HubSpot contacts and proposes routing and outreach.
// It never assigns owners, updates lifecycle stages, or sends messages.
export async function reviewNewLeads(
  input: ReviewNewLeadsInput = {},
  fetchImpl: typeof fetch = fetch
) {
  const parsed = normalizeReviewNewLeadsInput(input);
  const limit = parsed.limit ?? 25;
  const contacts = await fetchRecentContacts(limit, fetchImpl);
  const leads = contacts
    .map(routeLead)
    .sort((a, b) => b.score.total - a.score.total);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    query: { limit },
    leads,
    routingHint:
      "Present each lead with its score, drafted owner assignment, and drafted first-touch for operator approval. Do not assign owners, change lifecycle stages, or send outreach without explicit sign-off."
  };
}

export async function fetchRecentContacts(
  limit = 25,
  fetchImpl: typeof fetch = fetch
): Promise<HubspotContact[]> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is required");
  }

  const properties = [
    "email",
    "firstname",
    "lastname",
    "company",
    "jobtitle",
    "lifecyclestage",
    "hs_lead_status",
    "country",
    "num_conversion_events",
    "hs_analytics_num_page_views",
    "createdate"
  ];

  const url = new URL("https://api.hubapi.com/crm/v3/objects/contacts");
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 100)));
  url.searchParams.set("archived", "false");
  url.searchParams.set("properties", properties.join(","));

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HubSpot API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { results?: Array<Record<string, unknown>> };
  return (payload.results ?? []).map((row) => {
    const props = (row.properties ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      email: optionalString(props.email),
      firstName: optionalString(props.firstname),
      lastName: optionalString(props.lastname),
      company: optionalString(props.company),
      jobTitle: optionalString(props.jobtitle),
      lifecycleStage: optionalString(props.lifecyclestage),
      leadStatus: optionalString(props.hs_lead_status),
      country: optionalString(props.country),
      conversionEvents: toNumber(props.num_conversion_events),
      pageViews: toNumber(props.hs_analytics_num_page_views),
      createdAt: optionalString(props.createdate)
    };
  });
}

export function scoreLead(contact: HubspotContact): LeadScore {
  const icpFit = scoreIcpFit(contact);
  const intent = scoreIntent(contact);
  const total = Math.round(icpFit * 0.5 + intent * 0.5);
  const tier: LeadScore["tier"] = total >= 70 ? "hot" : total >= 40 ? "warm" : "nurture";
  return { icpFit, intent, total, tier };
}

export function routeLead(contact: HubspotContact): LeadRouting {
  const score = scoreLead(contact);
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Unknown contact";
  return {
    contactId: contact.id,
    name,
    email: contact.email,
    company: contact.company,
    score,
    suggestedAssignment: draftAssignment(score.tier),
    firstTouchDraft: draftFirstTouch(contact, score.tier),
    reasons: explainScore(contact)
  };
}

const SENIOR_TITLE = /\b(ceo|cto|cfo|coo|founder|owner|chief|president|vp|vice president|head|director)\b/i;
const FREE_EMAIL = /@(gmail|yahoo|hotmail|outlook|icloud|aol|proton(mail)?)\./i;

function scoreIcpFit(contact: HubspotContact): number {
  let score = 0;
  if (contact.company) score += 30;
  if (contact.jobTitle && SENIOR_TITLE.test(contact.jobTitle)) score += 30;
  else if (contact.jobTitle) score += 15;
  if (contact.email && !FREE_EMAIL.test(contact.email)) score += 25;
  if (contact.country) score += 15;
  return Math.min(score, 100);
}

function scoreIntent(contact: HubspotContact): number {
  let score = lifecycleScore(contact.lifecycleStage);
  score += Math.min(contact.conversionEvents * 8, 30);
  if (contact.pageViews > 5) score += 15;
  else if (contact.pageViews > 0) score += 5;
  return Math.min(score, 100);
}

function lifecycleScore(stage: string | null): number {
  switch ((stage ?? "").toLowerCase()) {
    case "opportunity":
      return 60;
    case "salesqualifiedlead":
      return 50;
    case "marketingqualifiedlead":
      return 40;
    case "lead":
      return 20;
    case "subscriber":
      return 10;
    default:
      return 0;
  }
}

function draftAssignment(tier: LeadScore["tier"]): string {
  if (tier === "hot") {
    return "Draft: route to a senior account executive for same-day outreach. Assignment not applied.";
  }
  if (tier === "warm") {
    return "Draft: route to the SDR round-robin queue for follow-up within one business day. Assignment not applied.";
  }
  return "Draft: keep in marketing nurture for now; no rep assignment recommended yet. Assignment not applied.";
}

function draftFirstTouch(contact: HubspotContact, tier: LeadScore["tier"]): string {
  const firstName = contact.firstName ?? "there";
  const company = contact.company ? ` at ${contact.company}` : "";
  if (tier === "hot") {
    return `Draft first-touch: Hi ${firstName}, thanks for reaching out${company}. Based on what you shared I think we can help quickly — do you have 15 minutes this week for a focused walkthrough?`;
  }
  if (tier === "warm") {
    return `Draft first-touch: Hi ${firstName}, thanks for your interest${company}. Happy to share how teams like yours use us and answer any questions — is a short call useful, or would a quick overview by email be better?`;
  }
  return `Draft first-touch: Hi ${firstName}, thanks for signing up${company}. Here are a couple of resources to get started; reply any time if you'd like a hand or have questions.`;
}

function explainScore(contact: HubspotContact): string[] {
  const reasons: string[] = [];
  if (contact.company) reasons.push("Company name present (ICP signal).");
  if (contact.jobTitle && SENIOR_TITLE.test(contact.jobTitle)) reasons.push(`Senior title: ${contact.jobTitle}.`);
  if (contact.email && !FREE_EMAIL.test(contact.email)) reasons.push("Business email domain.");
  if (contact.lifecycleStage) reasons.push(`Lifecycle stage: ${contact.lifecycleStage}.`);
  if (contact.conversionEvents > 0) reasons.push(`${contact.conversionEvents} conversion event(s).`);
  if (contact.pageViews > 0) reasons.push(`${contact.pageViews} page view(s).`);
  if (reasons.length === 0) reasons.push("Sparse profile; gather more data before routing.");
  return reasons;
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

function toNumber(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}
