export interface PitchMatch {
  matchedKeywords: string[];
  signal: "strong" | "partial" | "weak";
  rationale: string;
}

export interface PitchDraftPlan {
  generatedAt: string;
  mode: "read_only_draft";
  query: string;
  expertise: string;
  match: PitchMatch;
  responseChecklist: string[];
  draftingHint: string;
}

export const draftPitchInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["query"],
  properties: {
    query: {
      type: "string",
      description:
        "The journalist source request text to respond to (e.g. a Connectively/Featured/HARO-style query the operator pulled from their configured feed)."
    },
    expertise: {
      type: "string",
      description:
        "The operator's area of expertise to match the request against. Defaults to a general note when omitted."
    }
  }
} as const;

export interface DraftPitchInput {
  query: string;
  expertise?: string;
}

export function normalizeDraftPitchInput(input: unknown): DraftPitchInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Draft pitch input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.query !== "string" || value.query.trim() === "") {
    throw new Error("query must be a non-empty string with the journalist source request.");
  }
  if (value.expertise !== undefined && typeof value.expertise !== "string") {
    throw new Error("expertise must be a string.");
  }

  return {
    query: value.query,
    expertise: value.expertise as string | undefined
  };
}

// Pure, network-free planner. Journalist source request feeds vary by provider (Connectively,
// Featured, HARO-style services) and the operator wires their own query source, so this tool does
// not call any feed. It scores how well a single request matches the operator's expertise and
// returns a draft-first checklist for a quotable response.
export function draftPitch(input: DraftPitchInput): PitchDraftPlan {
  const query = input.query.trim();
  const expertise = (input.expertise ?? "").trim() || "general subject-matter expertise";

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    query,
    expertise,
    match: scoreMatch(query, expertise),
    responseChecklist: [
      "Open with a one-sentence credential that establishes why this source is worth quoting.",
      "Answer the journalist's specific question directly; do not pad with marketing language.",
      "Provide one concrete, quotable line the writer can lift verbatim.",
      "Add a supporting data point, example, or contrarian angle if one is genuinely available.",
      "Keep the response under ~150 words and match the publication's tone.",
      "Close with a short bio and contact line for attribution."
    ],
    draftingHint:
      "Use the copywriting skill to draft the quotable response from this checklist. Present the draft for operator approval with the target publication and deadline noted; do not submit or send the pitch automatically."
  };
}

function scoreMatch(query: string, expertise: string): PitchMatch {
  const queryTokens = tokenize(query);
  const expertiseTokens = new Set(tokenize(expertise));
  const matchedKeywords = [...new Set(queryTokens.filter((token) => expertiseTokens.has(token)))];

  if (matchedKeywords.length >= 2) {
    return {
      matchedKeywords,
      signal: "strong",
      rationale:
        "The request overlaps with the stated expertise on multiple terms. A focused, quotable response is likely to land."
    };
  }

  if (matchedKeywords.length === 1) {
    return {
      matchedKeywords,
      signal: "partial",
      rationale:
        "The request touches the stated expertise on one term. Draft a response only if a genuinely useful angle exists, otherwise skip it."
    };
  }

  return {
    matchedKeywords,
    signal: "weak",
    rationale:
      "No obvious overlap with the stated expertise. Confirm relevance with the operator before drafting a response."
  };
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "are",
  "you",
  "your",
  "our",
  "who",
  "what",
  "how",
  "any",
  "can",
  "looking",
  "seeking",
  "need",
  "expert",
  "experts",
  "expertise",
  "general"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}
