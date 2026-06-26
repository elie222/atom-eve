export interface ObjectionCluster {
  theme: string;
  frequency: number;
  objections: string[];
  representativeQuote: string;
}

export interface CopyDraft {
  theme: string;
  section: "headline" | "subheadline" | "body" | "cta" | "faq";
  draft: string;
}

export interface CopyDraftPlan {
  generatedAt: string;
  mode: "read_only_draft";
  page: string;
  totalObjections: number;
  clusters: ObjectionCluster[];
  copyDrafts: CopyDraft[];
  draftingHint: string;
}

export interface DraftCopyInput {
  objections?: string[];
  notes?: string;
  page?: string;
}

export const draftCopyInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    objections: {
      type: "array",
      items: { type: "string" },
      description: "Buyer objections, one per item."
    },
    notes: {
      type: "string",
      description: "Raw call, ticket, churn, or review notes. Each line is treated as one objection."
    },
    page: {
      type: "string",
      description: "The page or product the copy is for. Defaults to a generic landing page."
    }
  }
} as const;

export function normalizeDraftCopyInput(input: unknown): DraftCopyInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Buyer voice input must be an object.");
  }

  const value = input as Record<string, unknown>;

  if (value.notes !== undefined && typeof value.notes !== "string") {
    throw new Error("notes must be a string.");
  }
  if (value.page !== undefined && typeof value.page !== "string") {
    throw new Error("page must be a string.");
  }

  let objections: string[] | undefined;
  if (value.objections !== undefined) {
    if (!Array.isArray(value.objections)) {
      throw new Error("objections must be an array of strings.");
    }
    objections = value.objections.map((item) => {
      if (typeof item !== "string") throw new Error("objections must be an array of strings.");
      return item;
    });
  }

  return {
    objections,
    notes: value.notes as string | undefined,
    page: value.page as string | undefined
  };
}

interface ThemeRule {
  theme: string;
  keywords: string[];
}

const THEME_RULES: ThemeRule[] = [
  { theme: "Price and value", keywords: ["price", "cost", "expensive", "afford", "budget", "cheap", "worth", "value", "pricing"] },
  { theme: "Trust and credibility", keywords: ["trust", "scam", "legit", "secure", "security", "reviews", "proof", "risk", "safe", "reputation"] },
  { theme: "Time and effort", keywords: ["time", "slow", "long", "setup", "onboarding", "migrate", "migration", "implement", "busy"] },
  { theme: "Complexity and ease of use", keywords: ["hard", "complex", "complicated", "confusing", "difficult", "learn", "intuitive", "easy", "simple"] },
  { theme: "Support and onboarding", keywords: ["support", "help", "documentation", "docs", "training", "service", "response"] },
  { theme: "Competitive fit", keywords: ["competitor", "alternative", "versus", "vs", "switch", "already use", "compare", "better than"] },
  { theme: "Need and relevance", keywords: ["need", "necessary", "why", "relevant", "use case", "fit", "for me", "too much", "overkill"] }
];

const OTHER_THEME = "Other objections";

// Pure, network-free planner. It clusters the objections you paste in by theme and scaffolds
// landing-page copy for each cluster. It never reads from a CRM or help desk and never publishes;
// the agent rewrites the scaffolds in the customers' own words using the copywriting skill.
export function draftCopy(input: DraftCopyInput = {}): CopyDraftPlan {
  const page = (input.page ?? "your landing page").trim() || "your landing page";
  const objections = collectObjections(input);
  const clusters = clusterObjections(objections);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    page,
    totalObjections: objections.length,
    clusters,
    copyDrafts: buildCopyDrafts(clusters),
    draftingHint:
      objections.length === 0
        ? "No objections were provided. Ask for the source call/ticket notes before drafting."
        : "Rewrite each scaffold with the copywriting skill in the customers' own language, addressing the highest-frequency themes first. Present every piece as a draft for operator approval; do not edit or publish a page without sign-off."
  };
}

function collectObjections(input: DraftCopyInput): string[] {
  const fromList = (input.objections ?? []).map((line) => line.trim());
  const fromNotes = (input.notes ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim());
  return [...fromList, ...fromNotes].filter(Boolean);
}

function clusterObjections(objections: string[]): ObjectionCluster[] {
  const byTheme = new Map<string, string[]>();

  for (const objection of objections) {
    const theme = classify(objection);
    const list = byTheme.get(theme) ?? [];
    list.push(objection);
    byTheme.set(theme, list);
  }

  return [...byTheme.entries()]
    .map(([theme, items]) => ({
      theme,
      frequency: items.length,
      objections: items,
      representativeQuote: items[0]
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

function classify(objection: string): string {
  const text = objection.toLowerCase();
  for (const rule of THEME_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.theme;
    }
  }
  return OTHER_THEME;
}

function buildCopyDrafts(clusters: ObjectionCluster[]): CopyDraft[] {
  const drafts: CopyDraft[] = [];

  for (const cluster of clusters) {
    const quote = cluster.representativeQuote;
    drafts.push(
      {
        theme: cluster.theme,
        section: "headline",
        draft: `<!-- Address "${cluster.theme}" head-on. Echo the buyer's words: "${quote}" -->`
      },
      {
        theme: cluster.theme,
        section: "subheadline",
        draft: `<!-- One line that reframes "${cluster.theme}" as a benefit, using language from the notes. -->`
      },
      {
        theme: cluster.theme,
        section: "body",
        draft: `<!-- Acknowledge the concern ("${quote}"), then show the proof or mechanism that resolves it. -->`
      },
      {
        theme: cluster.theme,
        section: "faq",
        draft: `<!-- Q in the buyer's voice about "${cluster.theme}". A: a direct, specific answer. -->`
      },
      {
        theme: cluster.theme,
        section: "cta",
        draft: `<!-- A CTA that removes the "${cluster.theme}" friction (e.g. guarantee, free trial, no card). -->`
      }
    );
  }

  return drafts;
}
