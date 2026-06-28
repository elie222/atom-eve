export interface FeedbackItem {
  text: string;
  source?: string;
  theme?: string;
  value?: number;
}

export interface FeedbackTheme {
  theme: string;
  frequency: number;
  totalValue: number;
  averageValue: number;
  score: number;
  sources: string[];
  examples: string[];
}

export interface FeedbackAggregation {
  generatedAt: string;
  mode: "read_only_planning";
  totalItems: number;
  themeCount: number;
  themes: FeedbackTheme[];
  planningHint: string;
}

export const aggregateFeedbackInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      description: "Raw feedback items collected from tickets, reviews, and community channels.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text"],
        properties: {
          text: {
            type: "string",
            description: "The feedback content."
          },
          source: {
            type: "string",
            description: "Where the feedback came from, e.g. ticket, review, community."
          },
          theme: {
            type: "string",
            description: "Optional explicit theme label to group by. If omitted, the planner groups by normalized text."
          },
          value: {
            type: "number",
            description: "Optional business value or weight for this item (e.g. account MRR or severity). Defaults to 1."
          }
        }
      }
    }
  }
} as const;

export interface AggregateFeedbackInput {
  items: FeedbackItem[];
}

export function normalizeAggregateFeedbackInput(input: unknown): AggregateFeedbackInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Feedback aggregation input must be an object with an items array.");
  }

  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.items)) {
    throw new Error("items must be an array of feedback items.");
  }

  const items = value.items.map((raw, index) => normalizeItem(raw, index));
  return { items };
}

function normalizeItem(raw: unknown, index: number): FeedbackItem {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(`items[${index}] must be an object.`);
  }

  const value = raw as Record<string, unknown>;
  if (typeof value.text !== "string" || value.text.trim() === "") {
    throw new Error(`items[${index}].text must be a non-empty string.`);
  }
  if (value.source !== undefined && typeof value.source !== "string") {
    throw new Error(`items[${index}].source must be a string.`);
  }
  if (value.theme !== undefined && typeof value.theme !== "string") {
    throw new Error(`items[${index}].theme must be a string.`);
  }
  if (value.value !== undefined && (typeof value.value !== "number" || !Number.isFinite(value.value))) {
    throw new Error(`items[${index}].value must be a finite number.`);
  }

  return {
    text: value.text,
    source: value.source as string | undefined,
    theme: value.theme as string | undefined,
    value: value.value as number | undefined
  };
}

interface ThemeBucket {
  label: string;
  frequency: number;
  totalValue: number;
  sources: Set<string>;
  examples: string[];
}

// Pure, network-free planner. It dedupes the feedback items supplied in the prompt into themes and
// ranks them by frequency x value so an operator can decide what to act on. It reads nothing and
// changes nothing.
export function aggregateFeedback(input: AggregateFeedbackInput): FeedbackAggregation {
  const buckets = new Map<string, ThemeBucket>();

  for (const item of input.items) {
    const explicitTheme = item.theme?.trim();
    const key = explicitTheme && explicitTheme !== "" ? `theme:${explicitTheme.toLowerCase()}` : `text:${normalizeKey(item.text)}`;
    const label = explicitTheme && explicitTheme !== "" ? explicitTheme : item.text.trim();
    const weight = item.value ?? 1;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { label, frequency: 0, totalValue: 0, sources: new Set<string>(), examples: [] };
      buckets.set(key, bucket);
    }

    bucket.frequency += 1;
    bucket.totalValue += weight;
    if (item.source && item.source.trim() !== "") {
      bucket.sources.add(item.source.trim());
    }
    const example = item.text.trim();
    if (bucket.examples.length < 3 && !bucket.examples.includes(example)) {
      bucket.examples.push(example);
    }
  }

  const themes: FeedbackTheme[] = [...buckets.values()]
    .map((bucket) => {
      const averageValue = bucket.totalValue / bucket.frequency;
      return {
        theme: bucket.label,
        frequency: bucket.frequency,
        totalValue: round(bucket.totalValue),
        averageValue: round(averageValue),
        score: round(bucket.frequency * averageValue),
        sources: [...bucket.sources].sort(),
        examples: bucket.examples
      };
    })
    .sort((a, b) => b.score - a.score || b.frequency - a.frequency || a.theme.localeCompare(b.theme));

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_planning",
    totalItems: input.items.length,
    themeCount: themes.length,
    themes,
    planningHint:
      "Present the ranked themes as a read-only summary for the team. Highlight the top themes by score (frequency x value) with representative examples. Do not file tickets, reply to customers, or change anything without explicit operator sign-off."
  };
}

function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
