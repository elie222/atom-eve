export interface PodcastSegment {
  title: string;
  estimatedSeconds: number;
  sourceUpdate: string | null;
  talkingPoints: string[];
}

export interface PodcastAudioPlan {
  provider: "elevenlabs";
  ttsConfigured: boolean;
  recommendedVoice: string;
  modelId: string;
  outputFormat: string;
  note: string;
}

export interface PodcastEpisodePlan {
  generatedAt: string;
  mode: "read_only_draft";
  episodeTitle: string;
  targetMinutes: number;
  estimatedSeconds: number;
  sourceUpdates: string[];
  segments: PodcastSegment[];
  ttsConfigured: boolean;
  audioPlan: PodcastAudioPlan;
  draftingHint: string;
}

export const planEpisodeInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    updates: {
      type: "array",
      items: { type: "string" },
      description: "Recent product update notes (changelog entries, shipped features, fixes), one per item. Each becomes a script segment."
    },
    episodeTitle: {
      type: "string",
      description: "Optional episode title. Defaults to a dated product-update title."
    },
    targetMinutes: {
      type: "number",
      description: "Target episode length in minutes. Defaults to 5."
    }
  }
} as const;

export interface PlanEpisodeInput {
  updates: string[];
  episodeTitle?: string;
  targetMinutes?: number;
}

export function normalizePlanEpisodeInput(input: unknown): PlanEpisodeInput {
  if (input === undefined || input === null) return { updates: [] };
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Podcast episode input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.episodeTitle !== undefined && typeof value.episodeTitle !== "string") {
    throw new Error("episodeTitle must be a string.");
  }
  if (value.targetMinutes !== undefined && typeof value.targetMinutes !== "number") {
    throw new Error("targetMinutes must be a number.");
  }

  return {
    updates: normalizeUpdates(value.updates),
    episodeTitle: value.episodeTitle as string | undefined,
    targetMinutes: value.targetMinutes as number | undefined
  };
}

function normalizeUpdates(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (typeof value === "string") {
    return splitLines(value);
  }
  if (!Array.isArray(value)) {
    throw new Error("updates must be an array of strings or a newline-separated string.");
  }
  return value
    .map((item) => {
      if (typeof item !== "string") throw new Error("Each update must be a string.");
      return item.trim();
    })
    .filter(Boolean);
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// Pure, network-free planner. ElevenLabs offers text-to-speech (write) rather than a clean read
// endpoint, so this tool drafts the episode outline and audio plan from provided update notes and
// reports whether ELEVENLABS_API_KEY is configured for the later TTS step. It never calls
// ElevenLabs or produces audio.
export function planPodcastEpisode(input: PlanEpisodeInput = { updates: [] }): PodcastEpisodePlan {
  const updates = input.updates;
  const targetMinutes = input.targetMinutes && input.targetMinutes > 0 ? input.targetMinutes : 5;
  const ttsConfigured = Boolean(process.env.ELEVENLABS_API_KEY);
  const segments = buildSegments(updates, targetMinutes);
  const estimatedSeconds = segments.reduce((sum, segment) => sum + segment.estimatedSeconds, 0);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    episodeTitle: input.episodeTitle?.trim() || defaultTitle(),
    targetMinutes,
    estimatedSeconds,
    sourceUpdates: updates,
    segments,
    ttsConfigured,
    audioPlan: buildAudioPlan(ttsConfigured),
    draftingHint:
      updates.length === 0
        ? "No product updates were provided. Ask the operator for recent update notes (changelog entries, shipped features, fixes), then re-run plan_episode to draft a source-grounded episode."
        : "Write each segment's spoken script grounded only in the provided update notes - do not invent features, numbers, or claims. Present the full episode script and audio plan as a draft for operator approval; do not generate audio or publish until the operator signs off and ELEVENLABS_API_KEY is configured."
  };
}

function buildSegments(updates: string[], targetMinutes: number): PodcastSegment[] {
  const introSeconds = 30;
  const outroSeconds = 30;
  const segments: PodcastSegment[] = [
    {
      title: "Cold open and intro",
      estimatedSeconds: introSeconds,
      sourceUpdate: null,
      talkingPoints: [
        "Greet listeners and name the show and episode.",
        "Tease the most important update without overstating it.",
        "Keep it grounded in what actually shipped this period."
      ]
    }
  ];

  const contentSeconds = Math.max(targetMinutes * 60 - introSeconds - outroSeconds, 0);
  const perUpdate = updates.length > 0 ? Math.max(Math.round(contentSeconds / updates.length), 30) : 0;

  for (const update of updates) {
    segments.push({
      title: deriveTitle(update),
      estimatedSeconds: perUpdate,
      sourceUpdate: update,
      talkingPoints: [
        "Explain what changed in plain language.",
        "Say who it helps and why it matters, grounded only in this update note.",
        "Avoid metrics or promises that are not in the source note."
      ]
    });
  }

  segments.push({
    title: "Wrap-up and call to action",
    estimatedSeconds: outroSeconds,
    sourceUpdate: null,
    talkingPoints: [
      "Recap the updates covered.",
      "Point listeners to the changelog or docs for details.",
      "Invite feedback and close out."
    ]
  });

  return segments;
}

function buildAudioPlan(ttsConfigured: boolean): PodcastAudioPlan {
  return {
    provider: "elevenlabs",
    ttsConfigured,
    recommendedVoice: "Set ELEVENLABS_VOICE_ID to your chosen ElevenLabs voice for the TTS step.",
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
    note: ttsConfigured
      ? "ELEVENLABS_API_KEY is configured. After the operator approves the script, a separate text-to-speech step can synthesize each segment with ElevenLabs. This planner does not call ElevenLabs or produce audio."
      : "ELEVENLABS_API_KEY is not set. Configure it before the text-to-speech step. This planner does not call ElevenLabs or produce audio."
  };
}

function deriveTitle(update: string): string {
  const firstLine = update.split(/[.!?\n]/)[0]?.trim() ?? update.trim();
  if (firstLine.length <= 60) return firstLine || "Product update";
  return `${firstLine.slice(0, 57).trimEnd()}...`;
}

function defaultTitle(): string {
  return `Product Update Podcast - ${new Date().toISOString().slice(0, 10)}`;
}
