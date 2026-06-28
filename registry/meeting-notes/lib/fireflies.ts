export interface MeetingParticipant {
  name: string;
  email: string | null;
}

export interface MeetingTranscript {
  id: string;
  title: string;
  date: string | null;
  durationMinutes: number | null;
  organizerEmail: string | null;
  participants: MeetingParticipant[];
}

export interface MeetingSummary {
  overview: string | null;
  shortSummary: string | null;
  keywords: string[];
  bulletGist: string[];
  actionItems: string[];
}

export interface MeetingTranscriptReview {
  generatedAt: string;
  mode: "read_only_draft";
  transcript: MeetingTranscript;
  summary: MeetingSummary;
  draftingHint: string;
}

export const reviewTranscriptInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    transcriptId: {
      type: "string",
      description: "Fireflies transcript id to review. Defaults to your most recent transcript."
    }
  }
} as const;

export interface ReviewTranscriptInput {
  transcriptId?: string;
}

export function normalizeReviewTranscriptInput(input: unknown): ReviewTranscriptInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Meeting transcript review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.transcriptId !== undefined && typeof value.transcriptId !== "string") {
    throw new Error("transcriptId must be a string.");
  }

  return {
    transcriptId: value.transcriptId as string | undefined
  };
}

export async function reviewTranscript(
  input: ReviewTranscriptInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<MeetingTranscriptReview> {
  const parsed = normalizeReviewTranscriptInput(input);
  const transcriptId = parsed.transcriptId ?? (await fetchLatestTranscriptId(fetchImpl));
  if (!transcriptId) {
    throw new Error("No Fireflies transcript found to review.");
  }
  const raw = await fetchTranscript(transcriptId, fetchImpl);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    transcript: normalizeTranscript(raw),
    summary: normalizeSummary(raw),
    draftingHint:
      "Draft meeting notes, key decisions, and assigned action items from this transcript, then propose follow-ups (owner emails, task drafts, Slack messages) as drafts for operator approval. Do not send messages, create tasks, or route follow-ups without explicit sign-off."
  };
}

async function fetchLatestTranscriptId(fetchImpl: typeof fetch): Promise<string | null> {
  const query = `query LatestTranscript {
    transcripts(limit: 1) {
      id
    }
  }`;
  const data = await fireflies<{ transcripts?: Array<{ id?: unknown }> }>(query, {}, fetchImpl);
  const rows = Array.isArray(data.transcripts) ? data.transcripts : [];
  const id = rows[0]?.id;
  return id == null ? null : String(id);
}

async function fetchTranscript(transcriptId: string, fetchImpl: typeof fetch): Promise<Record<string, unknown>> {
  const query = `query Transcript($id: String!) {
    transcript(id: $id) {
      id
      title
      dateString
      duration
      organizer_email
      participants
      meeting_attendees {
        displayName
        email
      }
      summary {
        overview
        short_summary
        keywords
        bullet_gist
        action_items
      }
    }
  }`;
  const data = await fireflies<{ transcript?: Record<string, unknown> | null }>(query, { id: transcriptId }, fetchImpl);
  if (!data.transcript) {
    throw new Error(`Fireflies transcript ${transcriptId} was not found.`);
  }
  return data.transcript;
}

async function fireflies<T>(
  query: string,
  variables: Record<string, unknown>,
  fetchImpl: typeof fetch
): Promise<T> {
  const apiKey = process.env.FIREFLIES_API_KEY;
  if (!apiKey) throw new Error("FIREFLIES_API_KEY is required");

  const response = await fetchImpl("https://api.fireflies.ai/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ query, variables })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Fireflies API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: Array<{ message?: unknown }> };
  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors.map((error) => String(error.message ?? "")).filter(Boolean).join("; ");
    throw new Error(`Fireflies API error: ${message || "unknown GraphQL error"}`);
  }
  if (!payload.data) {
    throw new Error("Fireflies API returned no data.");
  }
  return payload.data;
}

function normalizeTranscript(raw: Record<string, unknown>): MeetingTranscript {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? "Untitled meeting"),
    date: raw.dateString == null ? null : String(raw.dateString),
    durationMinutes: raw.duration == null ? null : Number(raw.duration),
    organizerEmail: raw.organizer_email == null ? null : String(raw.organizer_email),
    participants: normalizeParticipants(raw.meeting_attendees, raw.participants)
  };
}

function normalizeParticipants(attendees: unknown, fallbackEmails: unknown): MeetingParticipant[] {
  if (Array.isArray(attendees) && attendees.length > 0) {
    return attendees.map((attendee) => {
      const row = (attendee ?? {}) as Record<string, unknown>;
      const email = row.email == null ? null : String(row.email);
      return {
        name: String(row.displayName ?? email ?? "Unknown participant"),
        email
      };
    });
  }
  if (Array.isArray(fallbackEmails)) {
    return fallbackEmails.map((email) => ({ name: String(email ?? ""), email: email == null ? null : String(email) }));
  }
  return [];
}

function normalizeSummary(raw: Record<string, unknown>): MeetingSummary {
  const summary = (raw.summary ?? {}) as Record<string, unknown>;
  return {
    overview: summary.overview == null ? null : String(summary.overview),
    shortSummary: summary.short_summary == null ? null : String(summary.short_summary),
    keywords: toStringList(summary.keywords),
    bulletGist: toStringList(summary.bullet_gist),
    actionItems: toStringList(summary.action_items)
  };
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "")).filter((item) => item.length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
  return [];
}
