export interface ReadTranscriptInput {
  transcriptId?: string;
  limitSentences?: number;
}

export interface MeetingAttendee {
  name: string;
  email: string | null;
}

export interface MeetingSpeaker {
  id: string;
  name: string;
}

export interface TranscriptSentence {
  index: number | null;
  speakerId: string | null;
  speakerName: string | null;
  startTime: string | null;
  endTime: string | null;
  text: string;
  rawText: string;
}

export interface MeetingSummary {
  overview: string | null;
  shortSummary: string | null;
  keywords: string[];
  bulletGist: string[];
  actionItems: string[];
}

export interface MeetingTranscript {
  id: string;
  title: string;
  date: string | null;
  durationMinutes: number | null;
  organizerEmail: string | null;
  transcriptUrl: string | null;
  meetingLink: string | null;
  participants: string[];
  attendees: MeetingAttendee[];
  speakers: MeetingSpeaker[];
  summary: MeetingSummary;
  sentences: TranscriptSentence[];
}

export interface MeetingTranscriptResult {
  generatedAt: string;
  transcriptId: string;
  sentenceLimit: number;
  transcript: MeetingTranscript;
}

export const readTranscriptInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    transcriptId: {
      type: "string",
      description: "Fireflies transcript id to read. Defaults to the most recent transcript.",
    },
    limitSentences: {
      type: "integer",
      minimum: 1,
      maximum: 1000,
      description: "Maximum number of transcript sentences to return. Defaults to 500.",
    },
  },
} as const;

export function normalizeReadTranscriptInput(input: unknown): ReadTranscriptInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Fireflies transcript input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.transcriptId !== undefined && typeof value.transcriptId !== "string") {
    throw new Error("transcriptId must be a string.");
  }
  if (
    value.limitSentences !== undefined &&
    (typeof value.limitSentences !== "number" || !Number.isInteger(value.limitSentences))
  ) {
    throw new Error("limitSentences must be an integer.");
  }

  return {
    transcriptId: value.transcriptId as string | undefined,
    limitSentences: value.limitSentences as number | undefined,
  };
}

export async function readTranscript(
  input: ReadTranscriptInput = {},
  fetchImpl: typeof fetch = fetch,
): Promise<MeetingTranscriptResult> {
  const parsed = normalizeReadTranscriptInput(input);
  const transcriptId = parsed.transcriptId ?? (await fetchLatestTranscriptId(fetchImpl));
  if (!transcriptId) {
    throw new Error("No Fireflies transcript found to read.");
  }

  const sentenceLimit = parsed.limitSentences ?? 500;
  const raw = await fetchTranscript(transcriptId, fetchImpl);
  const transcript = normalizeTranscript(raw, sentenceLimit);

  return {
    generatedAt: new Date().toISOString(),
    transcriptId,
    sentenceLimit,
    transcript,
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
      transcript_url
      meeting_link
      participants
      meeting_attendees {
        displayName
        email
      }
      speakers {
        id
        name
      }
      summary {
        overview
        short_summary
        keywords
        bullet_gist
        action_items
      }
      sentence {
        index
        speaker_id
        speaker_name
        start_time
        end_time
        text
        raw_text
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
  fetchImpl: typeof fetch,
): Promise<T> {
  const apiKey = process.env.FIREFLIES_API_KEY;
  if (!apiKey) throw new Error("FIREFLIES_API_KEY is required.");

  const response = await fetchImpl("https://api.fireflies.ai/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Fireflies API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: Array<{ message?: unknown }> };
  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors
      .map((error) => String(error.message ?? ""))
      .filter(Boolean)
      .join("; ");
    throw new Error(`Fireflies API error: ${message || "unknown GraphQL error"}`);
  }
  if (!payload.data) {
    throw new Error("Fireflies API returned no data.");
  }
  return payload.data;
}

function normalizeTranscript(raw: Record<string, unknown>, sentenceLimit: number): MeetingTranscript {
  return {
    id: stringValue(raw.id),
    title: stringValue(raw.title) || "Untitled meeting",
    date: nullableString(raw.dateString),
    durationMinutes: numberValue(raw.duration),
    organizerEmail: nullableString(raw.organizer_email),
    transcriptUrl: nullableString(raw.transcript_url),
    meetingLink: nullableString(raw.meeting_link),
    participants: toStringList(raw.participants),
    attendees: normalizeAttendees(raw.meeting_attendees),
    speakers: normalizeSpeakers(raw.speakers),
    summary: normalizeSummary(raw.summary),
    sentences: normalizeSentences(raw.sentence).slice(0, sentenceLimit),
  };
}

function normalizeAttendees(value: unknown): MeetingAttendee[] {
  if (!Array.isArray(value)) return [];
  return value.map((attendee) => {
    const row = objectValue(attendee);
    const email = nullableString(row.email);
    return {
      name: stringValue(row.displayName) || email || "Unknown attendee",
      email,
    };
  });
}

function normalizeSpeakers(value: unknown): MeetingSpeaker[] {
  if (!Array.isArray(value)) return [];
  return value.map((speaker) => {
    const row = objectValue(speaker);
    return {
      id: stringValue(row.id),
      name: stringValue(row.name),
    };
  });
}

function normalizeSummary(value: unknown): MeetingSummary {
  const summary = objectValue(value);
  return {
    overview: nullableString(summary.overview),
    shortSummary: nullableString(summary.short_summary),
    keywords: toStringList(summary.keywords),
    bulletGist: toStringList(summary.bullet_gist),
    actionItems: toStringList(summary.action_items),
  };
}

function normalizeSentences(value: unknown): TranscriptSentence[] {
  if (!Array.isArray(value)) return [];
  return value.map((sentence) => {
    const row = objectValue(sentence);
    return {
      index: numberValue(row.index),
      speakerId: nullableString(row.speaker_id),
      speakerName: nullableString(row.speaker_name),
      startTime: nullableString(row.start_time),
      endTime: nullableString(row.end_time),
      text: stringValue(row.text),
      rawText: stringValue(row.raw_text),
    };
  });
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown): string {
  return value == null ? "" : String(value);
}

function nullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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
