export interface ClipSegment {
  index: number;
  source: string;
  hook: string;
  caption: string;
  rationale: string;
}

export interface ShortVideoPlan {
  generatedAt: string;
  mode: "read_only_draft";
  sourceType: "transcript" | "topic";
  clipCount: number;
  clips: ClipSegment[];
  draftingHint: string;
  credentialsConfigured: boolean;
}

export const planClipsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    transcript: {
      type: "string",
      description: "Long-form transcript or source text to mine for short vertical clips."
    },
    topic: {
      type: "string",
      description: "Topic to ideate clips around when no transcript is available."
    },
    clipCount: {
      type: "integer",
      minimum: 1,
      maximum: 8,
      description: "How many clip segments to suggest. Defaults to 3."
    }
  }
} as const;

export interface PlanClipsInput {
  transcript?: string;
  topic?: string;
  clipCount?: number;
}

export function normalizePlanClipsInput(input: unknown): PlanClipsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Short video plan input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.transcript !== undefined && typeof value.transcript !== "string") {
    throw new Error("transcript must be a string.");
  }
  if (value.topic !== undefined && typeof value.topic !== "string") {
    throw new Error("topic must be a string.");
  }
  if (
    value.clipCount !== undefined &&
    (typeof value.clipCount !== "number" || !Number.isInteger(value.clipCount))
  ) {
    throw new Error("clipCount must be an integer.");
  }

  return {
    transcript: value.transcript as string | undefined,
    topic: value.topic as string | undefined,
    clipCount: value.clipCount as number | undefined
  };
}

// Pure, network-free planner. Cutting real clips needs the source media and the fal pipeline, so
// this tool never calls fal: it segments the supplied transcript (or ideates around a topic) and
// returns draft clip segments with a hook, caption, and rationale for an operator to approve.
export function planClips(input: PlanClipsInput = {}): ShortVideoPlan {
  const transcript = input.transcript?.trim() ?? "";
  const topic = input.topic?.trim() ?? "";

  if (!transcript && !topic) {
    throw new Error("Provide a transcript or a topic to plan short clips.");
  }

  const clipCount = clampClipCount(input.clipCount);
  const sourceType: ShortVideoPlan["sourceType"] = transcript ? "transcript" : "topic";
  const clips = transcript
    ? planFromTranscript(transcript, clipCount)
    : planFromTopic(topic, clipCount);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    sourceType,
    clipCount: clips.length,
    clips,
    draftingHint:
      "These are draft clip segments, not rendered videos. Tighten each hook and caption in your own voice, confirm the source timestamps, then approve before any clip is cut or published. This tool does not call fal or produce media.",
    credentialsConfigured: Boolean(process.env.FAL_KEY)
  };
}

const HOOK_TEMPLATES = [
  (lead: string) => `Here's why ${lowerFirst(lead)}`,
  (lead: string) => `Most people get this wrong: ${lowerFirst(lead)}`,
  (lead: string) => `Stop scrolling if ${lowerFirst(lead)}`,
  (lead: string) => `The part nobody talks about: ${lowerFirst(lead)}`,
  (lead: string) => `Watch this before you ${lowerFirst(lead)}`
];

function planFromTranscript(transcript: string, clipCount: number): ClipSegment[] {
  const sentences = splitSentences(transcript);
  if (sentences.length === 0) {
    return planFromTopic(transcript.slice(0, 80), clipCount);
  }

  const buckets = chunk(sentences, clipCount);
  return buckets.map((bucket, index) => {
    const lead = bucket[0] ?? "";
    return {
      index: index + 1,
      source: bucket.join(" "),
      hook: HOOK_TEMPLATES[index % HOOK_TEMPLATES.length](trimToWords(lead, 12)),
      caption: trimToWords(bucket.join(" "), 18),
      rationale:
        "Self-contained moment from the transcript with a clear single idea, suitable for a 20-45s vertical clip."
    };
  });
}

function planFromTopic(topic: string, clipCount: number): ClipSegment[] {
  const angles = [
    `the #1 mistake people make with ${topic}`,
    `a fast win you can apply to ${topic} today`,
    `a myth about ${topic} worth debunking`,
    `a before/after story about ${topic}`,
    `a contrarian take on ${topic}`,
    `the first step to get started with ${topic}`,
    `a question your audience keeps asking about ${topic}`,
    `what you wish you knew earlier about ${topic}`
  ];

  return Array.from({ length: clipCount }, (_unused, index) => {
    const angle = angles[index % angles.length];
    return {
      index: index + 1,
      source: `Topic angle: ${angle}.`,
      hook: HOOK_TEMPLATES[index % HOOK_TEMPLATES.length](angle),
      caption: `${capitalizeFirst(angle)} — script this beat in your own voice.`,
      rationale:
        "No transcript was provided, so this is a topic-driven clip angle to script and record rather than a cut from existing footage."
    };
  });
}

function clampClipCount(value: number | undefined): number {
  if (value === undefined) return 3;
  return Math.min(8, Math.max(1, value));
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function chunk<T>(items: T[], parts: number): T[][] {
  const count = Math.min(parts, items.length);
  if (count <= 0) return [];
  const size = Math.ceil(items.length / count);
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function trimToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function lowerFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
