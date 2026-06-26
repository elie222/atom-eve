export type KeywordIntent = "informational" | "commercial" | "transactional" | "navigational";

export interface KeywordMetric {
  keyword: string;
  searchVolume: number;
  difficulty: number | null;
  competition: number | null;
  intent: KeywordIntent;
}

export interface KeywordCluster {
  theme: string;
  intent: KeywordIntent;
  keywords: KeywordMetric[];
  totalSearchVolume: number;
  averageDifficulty: number | null;
  priorityScore: number;
}

export interface KeywordResearchReport {
  generatedAt: string;
  mode: "read_only_research";
  seeds: string[];
  locationName: string;
  languageName: string;
  keywords: KeywordMetric[];
  clusters: KeywordCluster[];
  contentMapHint: string;
  credentialsConfigured: boolean;
}

export const researchKeywordsInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["seeds"],
  properties: {
    seeds: {
      type: "array",
      minItems: 1,
      items: { type: "string" },
      description: "Seed keywords or topics to expand into keyword ideas."
    },
    locationName: {
      type: "string",
      description: "DataForSEO location name. Defaults to United States."
    },
    languageName: {
      type: "string",
      description: "DataForSEO language name. Defaults to English."
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 1000,
      description: "Maximum keyword ideas to request. Defaults to 100."
    }
  }
} as const;

export interface ResearchKeywordsInput {
  seeds: string[];
  locationName?: string;
  languageName?: string;
  limit?: number;
}

export function normalizeResearchKeywordsInput(input: unknown): ResearchKeywordsInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Keyword research input must be an object with a seeds array.");
  }

  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.seeds)) {
    throw new Error("seeds must be an array of strings.");
  }
  const seeds = value.seeds
    .map((seed) => (typeof seed === "string" ? seed.trim() : ""))
    .filter((seed) => seed.length > 0);
  if (seeds.length === 0) {
    throw new Error("Provide at least one non-empty seed keyword.");
  }

  if (value.locationName !== undefined && typeof value.locationName !== "string") {
    throw new Error("locationName must be a string.");
  }
  if (value.languageName !== undefined && typeof value.languageName !== "string") {
    throw new Error("languageName must be a string.");
  }
  if (value.limit !== undefined && (typeof value.limit !== "number" || !Number.isInteger(value.limit))) {
    throw new Error("limit must be an integer.");
  }

  return {
    seeds,
    locationName: value.locationName as string | undefined,
    languageName: value.languageName as string | undefined,
    limit: value.limit as number | undefined
  };
}

export async function researchKeywords(
  input: ResearchKeywordsInput,
  fetchImpl: typeof fetch = fetch
): Promise<KeywordResearchReport> {
  const parsed = normalizeResearchKeywordsInput(input);
  const locationName = parsed.locationName ?? "United States";
  const languageName = parsed.languageName ?? "English";
  const limit = parsed.limit ?? 100;
  const keywords = await fetchKeywordIdeas(parsed.seeds, locationName, languageName, limit, fetchImpl);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_research",
    seeds: parsed.seeds,
    locationName,
    languageName,
    keywords,
    clusters: clusterKeywords(keywords),
    contentMapHint:
      "Use the programmatic SEO skill to turn the highest-priority clusters into a content map. This is read-only research; nothing was published or changed.",
    credentialsConfigured: Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)
  };
}

async function fetchKeywordIdeas(
  seeds: string[],
  locationName: string,
  languageName: string,
  limit: number,
  fetchImpl: typeof fetch
): Promise<KeywordMetric[]> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are required");
  }

  const auth = Buffer.from(`${login}:${password}`).toString("base64");
  const response = await fetchImpl("https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      {
        keywords: seeds,
        location_name: locationName,
        language_name: languageName,
        limit
      }
    ])
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`DataForSEO API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as {
    tasks?: Array<{ result?: Array<{ items?: Array<Record<string, unknown>> }> }>;
  };
  const items = payload.tasks?.flatMap((task) => task.result?.flatMap((result) => result.items ?? []) ?? []) ?? [];

  return items.map((item) => {
    const keyword = String(item.keyword ?? "");
    const info = (item.keyword_info ?? {}) as Record<string, unknown>;
    const properties = (item.keyword_properties ?? {}) as Record<string, unknown>;
    const difficultyRaw = properties.keyword_difficulty;
    const competitionRaw = info.competition;
    return {
      keyword,
      searchVolume: Number(info.search_volume ?? 0),
      difficulty: difficultyRaw == null ? null : Number(difficultyRaw),
      competition: competitionRaw == null ? null : Number(competitionRaw),
      intent: classifyIntent(keyword)
    };
  });
}

export function classifyIntent(keyword: string): KeywordIntent {
  const text = keyword.toLowerCase();
  if (/(buy|price|pricing|cost|discount|coupon|deal|cheap|order|subscribe)/.test(text)) {
    return "transactional";
  }
  if (/(best|top|review|reviews|vs|comparison|compare|alternative|software|tool|tools|service)/.test(text)) {
    return "commercial";
  }
  if (/(login|sign in|download|app|dashboard)/.test(text)) {
    return "navigational";
  }
  return "informational";
}

export function clusterKeywords(keywords: KeywordMetric[]): KeywordCluster[] {
  const groups = new Map<string, KeywordMetric[]>();
  for (const keyword of keywords) {
    const key = `${keyword.intent}:${themeToken(keyword.keyword)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(keyword);
    else groups.set(key, [keyword]);
  }

  const clusters: KeywordCluster[] = [];
  for (const [key, members] of groups) {
    const [intent, token] = key.split(":");
    const totalSearchVolume = members.reduce((sum, item) => sum + item.searchVolume, 0);
    const difficulties = members.map((item) => item.difficulty).filter((value): value is number => value !== null);
    const averageDifficulty =
      difficulties.length === 0
        ? null
        : Math.round((difficulties.reduce((sum, value) => sum + value, 0) / difficulties.length) * 10) / 10;
    const priorityScore = Math.round((totalSearchVolume / ((averageDifficulty ?? 0) + 1)) * 10) / 10;
    clusters.push({
      theme: token,
      intent: intent as KeywordIntent,
      keywords: members.sort((a, b) => b.searchVolume - a.searchVolume),
      totalSearchVolume,
      averageDifficulty,
      priorityScore
    });
  }

  return clusters.sort((a, b) => b.priorityScore - a.priorityScore);
}

function themeToken(keyword: string): string {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "for",
    "to",
    "of",
    "in",
    "on",
    "and",
    "or",
    "best",
    "top",
    "how",
    "what",
    "is",
    "vs"
  ]);
  const token = keyword
    .toLowerCase()
    .split(/\s+/)
    .find((word) => word.length > 2 && !stopWords.has(word));
  return token ?? keyword.toLowerCase().trim() ?? "general";
}
