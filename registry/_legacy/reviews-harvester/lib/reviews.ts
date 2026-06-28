export interface ReviewInput {
  id?: string;
  author?: string;
  source?: string;
  rating?: number;
  text: string;
}

export interface ReviewResponsePlan {
  id: string | null;
  author: string | null;
  source: string | null;
  rating: number | null;
  sentiment: "detractor" | "passive" | "promoter";
  isDetractor: boolean;
  priority: "high" | "normal";
  responseChecklist: string[];
  draftingHint: string;
}

export interface ReviewsDraftPlan {
  generatedAt: string;
  mode: "read_only_draft";
  reviewCount: number;
  detractorCount: number;
  responses: ReviewResponsePlan[];
  draftingHint: string;
}

export const draftResponsesInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reviews"],
  properties: {
    reviews: {
      type: "array",
      minItems: 1,
      description:
        "New reviews the operator pulled from their configured source (a G2/Trustpilot/Capterra-style feed, export, or pasted text).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text"],
        properties: {
          id: { type: "string", description: "Optional review id from the source." },
          author: { type: "string", description: "Optional reviewer name or handle." },
          source: {
            type: "string",
            description: "Optional source/platform the review came from (e.g. G2, Trustpilot, Capterra)."
          },
          rating: {
            type: "number",
            minimum: 1,
            maximum: 5,
            description: "Optional star rating on a 1-5 scale, used to classify sentiment."
          },
          text: { type: "string", description: "The review body to respond to." }
        }
      }
    }
  }
} as const;

export interface DraftResponsesInput {
  reviews: ReviewInput[];
}

export function normalizeDraftResponsesInput(input: unknown): DraftResponsesInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Draft responses input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.reviews) || value.reviews.length === 0) {
    throw new Error("reviews must be a non-empty array of reviews.");
  }

  const reviews = value.reviews.map((raw, index) => normalizeReview(raw, index));
  return { reviews };
}

function normalizeReview(raw: unknown, index: number): ReviewInput {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(`reviews[${index}] must be an object.`);
  }

  const value = raw as Record<string, unknown>;
  if (typeof value.text !== "string" || value.text.trim() === "") {
    throw new Error(`reviews[${index}].text must be a non-empty string.`);
  }
  if (value.rating !== undefined && (typeof value.rating !== "number" || Number.isNaN(value.rating))) {
    throw new Error(`reviews[${index}].rating must be a number.`);
  }
  for (const field of ["id", "author", "source"] as const) {
    if (value[field] !== undefined && typeof value[field] !== "string") {
      throw new Error(`reviews[${index}].${field} must be a string.`);
    }
  }

  return {
    id: value.id as string | undefined,
    author: value.author as string | undefined,
    source: value.source as string | undefined,
    rating: value.rating as number | undefined,
    text: value.text
  };
}

// Pure, network-free planner. Review platforms (G2, Trustpilot, Capterra, app stores) vary by
// provider and most read paths sit behind authenticated, non-standard endpoints, so the operator
// wires their own review source and passes new reviews in. This tool classifies sentiment, flags
// detractors, and returns a draft-first response checklist per review. It does not fetch reviews
// or post replies anywhere.
export function draftResponses(input: DraftResponsesInput): ReviewsDraftPlan {
  const responses = input.reviews.map((review) => planResponse(review));
  const detractorCount = responses.filter((response) => response.isDetractor).length;

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    reviewCount: responses.length,
    detractorCount,
    responses,
    draftingHint:
      "Use the copywriting skill to draft each reply from its checklist. Present every draft for operator approval with the review it answers and the platform it belongs to; escalate flagged detractors first and do not post any reply automatically."
  };
}

function planResponse(review: ReviewInput): ReviewResponsePlan {
  const sentiment = classifySentiment(review);
  const isDetractor = sentiment === "detractor";

  return {
    id: review.id ?? null,
    author: review.author ?? null,
    source: review.source ?? null,
    rating: review.rating ?? null,
    sentiment,
    isDetractor,
    priority: isDetractor ? "high" : "normal",
    responseChecklist: checklistFor(sentiment),
    draftingHint:
      "Use the copywriting skill to draft a reply that matches this review's sentiment and the platform's tone. Present the draft for operator approval; do not post it automatically."
  };
}

function classifySentiment(review: ReviewInput): "detractor" | "passive" | "promoter" {
  if (typeof review.rating === "number") {
    if (review.rating <= 2) return "detractor";
    if (review.rating >= 4) return "promoter";
    return "passive";
  }

  const tokens = new Set(tokenize(review.text));
  const negativeHits = countHits(tokens, NEGATIVE_WORDS);
  const positiveHits = countHits(tokens, POSITIVE_WORDS);

  if (negativeHits > positiveHits) return "detractor";
  if (positiveHits > negativeHits) return "promoter";
  return "passive";
}

function checklistFor(sentiment: "detractor" | "passive" | "promoter"): string[] {
  if (sentiment === "detractor") {
    return [
      "Open by acknowledging the specific problem the reviewer raised; do not get defensive.",
      "Apologize sincerely and take ownership without making excuses.",
      "State the concrete fix or next step, and offer to move the conversation to a private channel.",
      "Keep it short, human, and free of canned marketing language.",
      "Flag this review for the operator and any product owner who needs to act on the root cause."
    ];
  }

  if (sentiment === "promoter") {
    return [
      "Thank the reviewer by name and reference the specific thing they praised.",
      "Reinforce that detail briefly so the reply reads genuine, not templated.",
      "Invite a light next step (a referral, a feature they may not know about) only if it fits.",
      "Keep it warm and concise."
    ];
  }

  return [
    "Thank the reviewer and acknowledge both what worked and what fell short.",
    "Address the lukewarm point directly and note any improvement already underway.",
    "Offer a path to follow up so the reviewer feels heard.",
    "Keep the tone neutral, helpful, and concise."
  ];
}

const POSITIVE_WORDS = new Set([
  "love",
  "loved",
  "great",
  "excellent",
  "amazing",
  "awesome",
  "fantastic",
  "best",
  "perfect",
  "recommend",
  "intuitive",
  "helpful",
  "easy",
  "smooth",
  "reliable",
  "happy"
]);

const NEGATIVE_WORDS = new Set([
  "bad",
  "terrible",
  "awful",
  "horrible",
  "worst",
  "broken",
  "buggy",
  "slow",
  "crash",
  "crashes",
  "refund",
  "cancel",
  "cancelled",
  "disappointed",
  "frustrating",
  "useless",
  "unreliable",
  "overpriced",
  "confusing"
]);

function countHits(tokens: Set<string>, words: Set<string>): number {
  let hits = 0;
  for (const word of words) {
    if (tokens.has(word)) hits += 1;
  }
  return hits;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}
