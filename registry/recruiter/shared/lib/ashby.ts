export interface AshbyApplicant {
  id: string;
  name: string;
  primaryEmail: string | null;
  position: string | null;
  location: string | null;
  source: string | null;
  createdAt: string | null;
}

export interface AshbyApplicantReview {
  generatedAt: string;
  mode: "read_only_draft";
  role: string | null;
  applicants: AshbyApplicant[];
  shortlistHint: string;
  credentialsConfigured: boolean;
}

export const reviewApplicantsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    role: {
      type: "string",
      description: "Role title to score applicants against. Used by the agent for shortlisting and outreach; optional."
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Maximum number of applicants to fetch. Defaults to 50."
    }
  }
} as const;

export interface ReviewApplicantsInput {
  role?: string;
  limit?: number;
}

export function normalizeReviewApplicantsInput(input: unknown): ReviewApplicantsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Recruiter review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.role !== undefined && typeof value.role !== "string") {
    throw new Error("role must be a string.");
  }
  if (value.limit !== undefined && (typeof value.limit !== "number" || !Number.isInteger(value.limit) || value.limit < 1 || value.limit > 100)) {
    throw new Error("limit must be an integer between 1 and 100.");
  }

  return {
    role: value.role as string | undefined,
    limit: value.limit as number | undefined
  };
}

export async function reviewApplicants(input: ReviewApplicantsInput = {}): Promise<AshbyApplicantReview> {
  const parsed = normalizeReviewApplicantsInput(input);
  const applicants = await fetchApplicants(parsed.limit ?? 50);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    role: parsed.role ?? null,
    applicants,
    shortlistHint:
      "Score each applicant against the role's must-have skills, seniority, and location, then shortlist the strongest matches with a short rationale each. Draft personalized outreach for operator approval. Do not move candidates between stages, change their status, or send messages in Ashby.",
    credentialsConfigured: Boolean(process.env.ASHBY_API_KEY)
  };
}

export async function fetchApplicants(limit = 50, fetchImpl: typeof fetch = fetch): Promise<AshbyApplicant[]> {
  const apiKey = process.env.ASHBY_API_KEY;
  if (!apiKey) throw new Error("ASHBY_API_KEY is required");

  // Ashby uses HTTP Basic auth with the API key as the username and an empty password.
  const auth = Buffer.from(`${apiKey}:`).toString("base64");

  const response = await fetchImpl("https://api.ashbyhq.com/candidate.list", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ limit })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ashby API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { results?: Array<Record<string, unknown>> };
  const rows = Array.isArray(payload.results) ? payload.results : [];
  return rows.map((row) => normalizeApplicant(row));
}

function normalizeApplicant(row: Record<string, unknown>): AshbyApplicant {
  const emails = row.emailAddresses;
  const primaryEmail = Array.isArray(emails) && emails.length > 0
    ? String((emails[0] as { value?: unknown })?.value ?? "") || null
    : row.primaryEmailAddress == null
      ? null
      : String((row.primaryEmailAddress as { value?: unknown })?.value ?? "") || null;

  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? "Unnamed candidate"),
    primaryEmail,
    position: row.position == null ? null : String(row.position),
    location: row.locationSummary == null ? null : String(row.locationSummary),
    source: row.source == null ? null : String((row.source as { title?: unknown })?.title ?? row.source),
    createdAt: row.createdAt == null ? null : String(row.createdAt)
  };
}
