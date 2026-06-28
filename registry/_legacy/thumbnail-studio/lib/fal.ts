export interface ThumbnailSelfScore {
  // 0-100, higher means the headline reads clearly at small sizes.
  clarity: number;
  // 0-100, lower means less clickbait/sensationalism.
  clickbaitRisk: number;
  passesBar: boolean;
}

export interface ThumbnailConcept {
  index: number;
  angle: string;
  headline: string;
  visualPrompt: string;
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  selfScore: ThumbnailSelfScore;
  rationale: string;
}

export interface ThumbnailClarityBar {
  minClarity: number;
  maxClickbaitRisk: number;
  description: string;
}

export interface ThumbnailStudioReview {
  generatedAt: string;
  mode: "read_only_draft";
  topic: string;
  count: number;
  clarityBar: ThumbnailClarityBar;
  concepts: ThumbnailConcept[];
  approved: ThumbnailConcept[];
  approvalHint: string;
}

export const generateThumbnailsInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["topic"],
  properties: {
    topic: {
      type: "string",
      description: "The video or post topic to design thumbnail concepts for."
    },
    count: {
      type: "integer",
      minimum: 1,
      maximum: 6,
      description: "How many distinct concept angles to generate. Defaults to 3."
    }
  }
} as const;

export interface GenerateThumbnailsInput {
  topic: string;
  count?: number;
}

export function normalizeGenerateThumbnailsInput(input: unknown): GenerateThumbnailsInput {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Thumbnail generation input must be an object with a topic.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.topic !== "string" || value.topic.trim() === "") {
    throw new Error("topic is required and must be a non-empty string.");
  }

  let count: number | undefined;
  if (value.count !== undefined) {
    if (typeof value.count !== "number" || !Number.isInteger(value.count)) {
      throw new Error("count must be an integer between 1 and 6.");
    }
    count = Math.min(6, Math.max(1, value.count));
  }

  return { topic: value.topic.trim(), count };
}

const MIN_CLARITY = 70;
const MAX_CLICKBAIT_RISK = 20;

const CLARITY_BAR: ThumbnailClarityBar = {
  minClarity: MIN_CLARITY,
  maxClickbaitRisk: MAX_CLICKBAIT_RISK,
  description:
    "A concept clears the bar when its headline is short and legible at small sizes (clarity >= 70) and avoids sensational clickbait language (clickbaitRisk <= 20)."
};

interface ConceptAngle {
  angle: string;
  headline: (topic: string) => string;
  visual: (topic: string) => string;
}

// Distinct, honest framings. Headlines stay short and topic-anchored on purpose so the
// self-score reflects a real clarity/no-clickbait bar rather than rewarding sensational copy.
const CONCEPT_ANGLES: ConceptAngle[] = [
  {
    angle: "direct",
    headline: (topic) => titleCase(shorten(topic, 5)),
    visual: (topic) =>
      `A single bold subject that represents "${topic}", centered with strong contrast against a clean background.`
  },
  {
    angle: "how-to",
    headline: (topic) => titleCase(`How to ${shorten(topic, 4)}`),
    visual: (topic) =>
      `A clear step-by-step or hands-on scene illustrating how to do "${topic}", with one obvious focal action.`
  },
  {
    angle: "numbered",
    headline: (topic) => `3 ${titleCase(shorten(topic, 3))} Tips`,
    visual: (topic) =>
      `Three simple, evenly spaced visual elements that summarize key points about "${topic}".`
  },
  {
    angle: "question",
    headline: (topic) => `${titleCase(shorten(topic, 4))}?`,
    visual: (topic) =>
      `A curious but truthful scene that poses an honest question about "${topic}", no exaggerated expressions.`
  },
  {
    angle: "outcome",
    headline: (topic) => titleCase(`${shorten(topic, 4)} Made Simple`),
    visual: (topic) =>
      `A calm before-and-after style composition showing the clear result of "${topic}".`
  },
  {
    angle: "comparison",
    headline: (topic) => titleCase(`${shorten(topic, 3)} vs The Rest`),
    visual: (topic) =>
      `A side-by-side comparison layout contrasting two clearly labeled options related to "${topic}".`
  }
];

export async function generateThumbnails(
  input: GenerateThumbnailsInput,
  fetchImpl: typeof fetch = fetch
): Promise<ThumbnailStudioReview> {
  const topic = input.topic;
  const count = input.count ?? 3;
  const angles = CONCEPT_ANGLES.slice(0, count);

  const concepts = await Promise.all(
    angles.map(async (angle, i): Promise<ThumbnailConcept> => {
      const headline = angle.headline(topic);
      const visualPrompt = buildVisualPrompt(angle.visual(topic));
      const image = await generateImage(visualPrompt, fetchImpl);
      const clarity = scoreClarity(headline);
      const clickbaitRisk = scoreClickbaitRisk(headline);
      const passesBar = clarity >= MIN_CLARITY && clickbaitRisk <= MAX_CLICKBAIT_RISK;
      return {
        index: i + 1,
        angle: angle.angle,
        headline,
        visualPrompt,
        imageUrl: image?.url ?? null,
        width: image?.width ?? null,
        height: image?.height ?? null,
        selfScore: { clarity, clickbaitRisk, passesBar },
        rationale: buildRationale(headline, clarity, clickbaitRisk, passesBar)
      };
    })
  );

  const approved = concepts.filter((concept) => concept.selfScore.passesBar);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    topic,
    count,
    clarityBar: CLARITY_BAR,
    concepts,
    approved,
    approvalHint:
      approved.length > 0
        ? "Present the approved concept images and their self-scored rationale to the operator for sign-off. Nothing has been published or uploaded."
        : "No concept cleared the clarity/no-clickbait bar. Refine the topic or raise count and regenerate before presenting anything for approval. Nothing has been published or uploaded."
  };
}

interface GeneratedImage {
  url: string;
  width: number | null;
  height: number | null;
}

async function generateImage(prompt: string, fetchImpl: typeof fetch): Promise<GeneratedImage | null> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY is required");

  const response = await fetchImpl("https://fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      image_size: "landscape_16_9",
      num_images: 1,
      num_inference_steps: 4
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`fal.ai API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { images?: Array<Record<string, unknown>> };
  const image = payload.images?.[0];
  if (!image || typeof image.url !== "string") return null;

  return {
    url: image.url,
    width: Number(image.width) || null,
    height: Number(image.height) || null
  };
}

function buildVisualPrompt(scene: string): string {
  return [
    "Professional 16:9 YouTube/social thumbnail.",
    scene,
    "High contrast, one clear focal point, readable at small sizes, vibrant but truthful and not misleading.",
    "No on-image text, no watermark, no exaggerated shocked faces."
  ].join(" ");
}

const CLICKBAIT_TERMS = [
  "shocking",
  "insane",
  "you won't believe",
  "won't believe",
  "crazy",
  "unbelievable",
  "mind-blowing",
  "mind blowing",
  "secret",
  "this one trick",
  "one weird trick",
  "gone wrong",
  "exposed",
  "the truth about",
  "life-changing"
];

function scoreClarity(headline: string): number {
  const words = headline.split(/\s+/).filter(Boolean);
  let score = 100;
  if (words.length > 6) score -= (words.length - 6) * 12;
  if (words.length < 2) score -= 20;

  const letters = headline.replace(/[^A-Za-z]/g, "");
  const caps = headline.replace(/[^A-Z]/g, "").length;
  if (letters.length > 4 && caps > letters.length * 0.6) score -= 25;

  return clamp(score);
}

function scoreClickbaitRisk(headline: string): number {
  const lower = headline.toLowerCase();
  let risk = 0;
  for (const term of CLICKBAIT_TERMS) {
    if (lower.includes(term)) risk += 30;
  }
  const exclamations = (headline.match(/!/g) ?? []).length;
  if (exclamations > 1) risk += exclamations * 10;
  if ((headline.match(/\?/g) ?? []).length > 1) risk += 15;
  return clamp(risk);
}

function buildRationale(headline: string, clarity: number, clickbaitRisk: number, passesBar: boolean): string {
  const verdict = passesBar
    ? "Clears the clarity/no-clickbait bar."
    : "Does not clear the bar yet; tighten the headline or pick another angle.";
  return `Headline "${headline}" scored clarity ${clarity}/100 and clickbait risk ${clickbaitRisk}/100. ${verdict}`;
}

function shorten(topic: string, maxWords: number): string {
  return topic.split(/\s+/).filter(Boolean).slice(0, maxWords).join(" ");
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
