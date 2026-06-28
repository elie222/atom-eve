export interface HubSpotContact {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  company: string | null;
  lifecycleStage: string | null;
  lastModified: string | null;
}

export interface DuplicateGroup {
  reason: "email" | "name";
  key: string;
  contactIds: string[];
}

export interface MissingFieldFinding {
  contactId: string;
  email: string | null;
  missing: string[];
}

export interface StaleContactFinding {
  contactId: string;
  email: string | null;
  lastModified: string | null;
  daysSinceModified: number | null;
}

export interface CrmHygieneRecommendation {
  category: "duplicate" | "missing_field" | "stale";
  severity: "info" | "watch" | "action";
  recommendation: string;
}

const DEFAULT_REQUIRED_FIELDS = ["email", "firstName", "lastName", "phone"] as const;
const REQUIRED_FIELD_VALUES = new Set<string>(DEFAULT_REQUIRED_FIELDS);
const DEFAULT_STALE_DAYS = 180;
const DEFAULT_LIMIT = 100;

export const reviewContactsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Number of contacts to scan (HubSpot page size). Defaults to 100."
    },
    staleDays: {
      type: "integer",
      minimum: 1,
      description: "A contact is flagged stale when it has not been modified in this many days. Defaults to 180."
    },
    requiredFields: {
      type: "array",
      items: {
        type: "string",
        enum: ["email", "firstName", "lastName", "phone", "company"]
      },
      description: "Fields that should be populated on every contact. Defaults to email, firstName, lastName, phone."
    }
  }
} as const;

export interface ReviewContactsInput {
  limit?: number;
  staleDays?: number;
  requiredFields?: string[];
}

export function normalizeReviewContactsInput(input: unknown): ReviewContactsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("CRM hygiene review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    limit: optionalInteger(value.limit, "limit"),
    staleDays: optionalInteger(value.staleDays, "staleDays"),
    requiredFields: optionalFields(value.requiredFields)
  };
}

export async function reviewContacts(
  input: ReviewContactsInput = {},
  fetchImpl: typeof fetch = fetch
) {
  const parsed = normalizeReviewContactsInput(input);
  const limit = parsed.limit ?? DEFAULT_LIMIT;
  const staleDays = parsed.staleDays ?? DEFAULT_STALE_DAYS;
  const requiredFields = parsed.requiredFields ?? [...DEFAULT_REQUIRED_FIELDS];

  const contacts = await fetchContacts(limit, fetchImpl);
  const now = Date.now();
  const duplicates = findDuplicates(contacts);
  const missingFields = findMissingFields(contacts, requiredFields);
  const staleContacts = findStaleContacts(contacts, staleDays, now);

  return {
    generatedAt: new Date(now).toISOString(),
    mode: "read_only_recommendations",
    scanned: contacts.length,
    staleThresholdDays: staleDays,
    requiredFields,
    duplicates,
    missingFields,
    staleContacts,
    recommendations: recommendCleanup(duplicates, missingFields, staleContacts),
    runHistoryHint:
      "Save this report with prior runs (for example runs/crm-hygiene/YYYY-MM-DD.md) if you want to track whether the queue is shrinking over time."
  };
}

export async function fetchContacts(
  limit: number = DEFAULT_LIMIT,
  fetchImpl: typeof fetch = fetch
): Promise<HubSpotContact[]> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is required");
  }

  const url = new URL("https://api.hubapi.com/crm/v3/objects/contacts");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "properties",
    "email,firstname,lastname,phone,company,lifecyclestage,lastmodifieddate"
  );

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `HubSpot API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const payload = (await response.json()) as {
    results?: Array<{ id?: unknown; properties?: Record<string, unknown> }>;
  };
  return (payload.results ?? []).map((row) => {
    const props = (row.properties ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      email: str(props.email),
      firstName: str(props.firstname),
      lastName: str(props.lastname),
      phone: str(props.phone),
      company: str(props.company),
      lifecycleStage: str(props.lifecyclestage),
      lastModified: str(props.lastmodifieddate)
    };
  });
}

export function findDuplicates(contacts: HubSpotContact[]): DuplicateGroup[] {
  const byEmail = new Map<string, string[]>();
  const byName = new Map<string, string[]>();

  for (const contact of contacts) {
    const email = contact.email?.trim().toLowerCase();
    if (email) {
      byEmail.set(email, [...(byEmail.get(email) ?? []), contact.id]);
    }
    const name = [contact.firstName, contact.lastName]
      .map((part) => part?.trim().toLowerCase())
      .filter(Boolean)
      .join(" ");
    if (name) {
      byName.set(name, [...(byName.get(name) ?? []), contact.id]);
    }
  }

  const groups: DuplicateGroup[] = [];
  for (const [key, contactIds] of byEmail) {
    if (contactIds.length > 1) groups.push({ reason: "email", key, contactIds });
  }
  for (const [key, contactIds] of byName) {
    if (contactIds.length > 1) groups.push({ reason: "name", key, contactIds });
  }
  return groups;
}

export function findMissingFields(
  contacts: HubSpotContact[],
  requiredFields: string[]
): MissingFieldFinding[] {
  const findings: MissingFieldFinding[] = [];
  for (const contact of contacts) {
    const missing = requiredFields.filter((field) => !isPopulated(contact, field));
    if (missing.length > 0) {
      findings.push({ contactId: contact.id, email: contact.email, missing });
    }
  }
  return findings;
}

export function findStaleContacts(
  contacts: HubSpotContact[],
  staleDays: number,
  now: number
): StaleContactFinding[] {
  const findings: StaleContactFinding[] = [];
  for (const contact of contacts) {
    const days = daysSince(contact.lastModified, now);
    if (days !== null && days >= staleDays) {
      findings.push({
        contactId: contact.id,
        email: contact.email,
        lastModified: contact.lastModified,
        daysSinceModified: days
      });
    }
  }
  return findings;
}

export function recommendCleanup(
  duplicates: DuplicateGroup[],
  missingFields: MissingFieldFinding[],
  staleContacts: StaleContactFinding[]
): CrmHygieneRecommendation[] {
  const recommendations: CrmHygieneRecommendation[] = [];

  if (duplicates.length > 0) {
    recommendations.push({
      category: "duplicate",
      severity: "action",
      recommendation: `Found ${duplicates.length} duplicate group(s). Review each set in HubSpot and merge the records after operator approval. No records were changed.`
    });
  }

  if (missingFields.length > 0) {
    recommendations.push({
      category: "missing_field",
      severity: "watch",
      recommendation: `Found ${missingFields.length} contact(s) missing required fields. Enrich or route these to the owner for completion. No records were changed.`
    });
  }

  if (staleContacts.length > 0) {
    recommendations.push({
      category: "stale",
      severity: "watch",
      recommendation: `Found ${staleContacts.length} stale contact(s) with no recent activity. Review for re-engagement, archival, or owner reassignment after operator approval. No records were changed.`
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      category: "missing_field",
      severity: "info",
      recommendation: "No hygiene issues detected in the scanned contacts. Keep monitoring."
    });
  }

  return recommendations;
}

function isPopulated(contact: HubSpotContact, field: string): boolean {
  switch (field) {
    case "email":
      return Boolean(contact.email?.trim());
    case "firstName":
      return Boolean(contact.firstName?.trim());
    case "lastName":
      return Boolean(contact.lastName?.trim());
    case "phone":
      return Boolean(contact.phone?.trim());
    case "company":
      return Boolean(contact.company?.trim());
    default:
      return true;
  }
}

function daysSince(value: string | null, now: number): number | null {
  if (!value) return null;
  const raw = /^\d+$/.test(value) ? Number(value) : Date.parse(value);
  if (!Number.isFinite(raw)) return null;
  return Math.floor((now - raw) / 86_400_000);
}

function str(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length === 0 ? null : text;
}

function optionalInteger(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }
  return value;
}

function optionalFields(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("requiredFields must be an array of strings.");
  }
  const fields = (value as string[]).filter((field) => REQUIRED_FIELD_VALUES.has(field) || field === "company");
  return fields.length > 0 ? fields : undefined;
}
