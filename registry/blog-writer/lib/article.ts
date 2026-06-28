export interface ArticleOutlineSection {
  heading: string;
  intent: string;
}

export interface InternalLinkSuggestion {
  anchorText: string;
  targetUrl: string;
  placement: string;
}

export interface SeoCheck {
  check: string;
  guidance: string;
}

export interface ArticleDraftPlan {
  generatedAt: string;
  mode: "read_only_draft";
  keyword: string;
  audience: string;
  targetWordCount: number;
  secondaryKeywords: string[];
  outline: ArticleOutlineSection[];
  draftScaffold: string;
  internalLinkSuggestions: InternalLinkSuggestion[];
  seoChecks: SeoCheck[];
  draftingHint: string;
}

export interface InternalLinkInput {
  title: string;
  url: string;
}

export interface DraftArticleInput {
  keyword?: string;
  audience?: string;
  targetWordCount?: number;
  secondaryKeywords?: string[];
  internalLinks?: InternalLinkInput[];
}

export const draftArticleInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    keyword: {
      type: "string",
      description: "Primary target keyword or topic for the article."
    },
    audience: {
      type: "string",
      description: "Who the article is for. Defaults to a general reader."
    },
    targetWordCount: {
      type: "number",
      description: "Target article length in words. Defaults to 1500."
    },
    secondaryKeywords: {
      type: "array",
      items: { type: "string" },
      description: "Supporting keywords to weave into the article."
    },
    internalLinks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" }
        }
      },
      description: "Existing pages the article can link to internally."
    }
  }
} as const;

export function normalizeDraftArticleInput(input: unknown): DraftArticleInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Blog writer input must be an object.");
  }

  const value = input as Record<string, unknown>;

  if (value.keyword !== undefined && typeof value.keyword !== "string") {
    throw new Error("keyword must be a string.");
  }
  if (value.audience !== undefined && typeof value.audience !== "string") {
    throw new Error("audience must be a string.");
  }
  if (value.targetWordCount !== undefined && typeof value.targetWordCount !== "number") {
    throw new Error("targetWordCount must be a number.");
  }

  return {
    keyword: value.keyword as string | undefined,
    audience: value.audience as string | undefined,
    targetWordCount: value.targetWordCount as number | undefined,
    secondaryKeywords: normalizeStringList(value.secondaryKeywords, "secondaryKeywords"),
    internalLinks: normalizeInternalLinks(value.internalLinks)
  };
}

// Pure, network-free planner. It scaffolds article structure, internal-link placements, and an
// on-page SEO checklist from a keyword brief. The actual long-form copy is written by the agent
// using the copywriting skill; this tool never fetches SERP data or publishes anything.
export function draftArticle(input: DraftArticleInput = {}): ArticleDraftPlan {
  const keyword = (input.keyword ?? "").trim();
  const audience = (input.audience ?? "a general reader").trim();
  const targetWordCount = clampWordCount(input.targetWordCount ?? 1500);
  const secondaryKeywords = (input.secondaryKeywords ?? []).map((k) => k.trim()).filter(Boolean);
  const internalLinks = input.internalLinks ?? [];

  const topic = keyword || "your target topic";
  const outline = buildOutline(topic, secondaryKeywords);
  const internalLinkSuggestions = buildInternalLinkSuggestions(internalLinks, outline);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    keyword: topic,
    audience,
    targetWordCount,
    secondaryKeywords,
    outline,
    draftScaffold: buildScaffold(topic, outline, internalLinkSuggestions),
    internalLinkSuggestions,
    seoChecks: buildSeoChecks(topic, secondaryKeywords, internalLinkSuggestions.length, targetWordCount, keyword === ""),
    draftingHint:
      "Expand each outline section into prose with the copywriting skill, weave the secondary keywords in naturally, and place the suggested internal links. Present the result as a draft for operator approval; do not publish without explicit sign-off."
  };
}

function buildOutline(topic: string, secondaryKeywords: string[]): ArticleOutlineSection[] {
  const sections: ArticleOutlineSection[] = [
    {
      heading: `Introduction: why ${topic} matters`,
      intent: "Hook the reader, state the search intent, and promise what they'll learn."
    },
    {
      heading: `What is ${topic}?`,
      intent: "Define the topic plainly and put the primary keyword in the first 100 words."
    }
  ];

  for (const keyword of secondaryKeywords.slice(0, 4)) {
    sections.push({
      heading: keyword,
      intent: `Cover this supporting subtopic and use "${keyword}" naturally in the H2.`
    });
  }

  sections.push(
    {
      heading: `How to get started with ${topic}`,
      intent: "Give a concrete, step-by-step or practical section the reader can act on."
    },
    {
      heading: `Common mistakes with ${topic}`,
      intent: "Address objections and pitfalls to build trust and depth."
    },
    {
      heading: "Frequently asked questions",
      intent: "Answer 3-5 real questions; eligible for FAQ schema."
    },
    {
      heading: "Conclusion and next step",
      intent: "Summarize the payoff and close with a single clear call to action."
    }
  );

  return sections;
}

function buildInternalLinkSuggestions(
  links: InternalLinkInput[],
  outline: ArticleOutlineSection[]
): InternalLinkSuggestion[] {
  // Spread provided links across the body sections (skip the intro at index 0).
  const bodySections = outline.slice(1);
  return links.map((link, index) => {
    const target = bodySections[index % Math.max(bodySections.length, 1)];
    return {
      anchorText: link.title,
      targetUrl: link.url,
      placement: target ? `Within "${target.heading}"` : "Within the body"
    };
  });
}

function buildScaffold(
  topic: string,
  outline: ArticleOutlineSection[],
  links: InternalLinkSuggestion[]
): string {
  const lines: string[] = [`# ${capitalize(topic)}`, ""];
  const linksBySection = new Map<string, InternalLinkSuggestion[]>();
  for (const link of links) {
    const list = linksBySection.get(link.placement) ?? [];
    list.push(link);
    linksBySection.set(link.placement, list);
  }

  for (const section of outline) {
    lines.push(`## ${section.heading}`);
    lines.push(`<!-- ${section.intent} -->`);
    const sectionLinks = linksBySection.get(`Within "${section.heading}"`) ?? [];
    for (const link of sectionLinks) {
      lines.push(`<!-- internal link: [${link.anchorText}](${link.targetUrl}) -->`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function buildSeoChecks(
  topic: string,
  secondaryKeywords: string[],
  internalLinkCount: number,
  targetWordCount: number,
  keywordMissing: boolean
): SeoCheck[] {
  const checks: SeoCheck[] = [];

  if (keywordMissing) {
    checks.push({
      check: "Primary keyword supplied",
      guidance: "No keyword was provided. Ask for the primary keyword before drafting for SEO."
    });
  }

  checks.push(
    {
      check: "Title tag",
      guidance: `Keep it under 60 characters and include "${topic}" near the front.`
    },
    {
      check: "Meta description",
      guidance: `Write 150-160 characters that include "${topic}" and a reason to click.`
    },
    {
      check: "Single H1 and keyword early",
      guidance: `Use exactly one H1 and place "${topic}" in the first 100 words.`
    },
    {
      check: "Secondary keywords in H2s",
      guidance:
        secondaryKeywords.length > 0
          ? `Work these into headings naturally: ${secondaryKeywords.join(", ")}.`
          : "No secondary keywords given. Consider adding 2-4 supporting terms for coverage."
    },
    {
      check: "Internal links",
      guidance:
        internalLinkCount > 0
          ? `Place the ${internalLinkCount} suggested internal link(s) where they fit contextually.`
          : "No internal links supplied. Add 2-4 relevant internal links to existing pages."
    },
    {
      check: "External authority links",
      guidance: "Cite 1-2 reputable external sources to support key claims."
    },
    {
      check: "Image alt text",
      guidance: `Add descriptive alt text and include "${topic}" on at least one relevant image.`
    },
    {
      check: "Word count",
      guidance: `Aim for roughly ${targetWordCount} words; match depth to search intent.`
    },
    {
      check: "FAQ schema",
      guidance: "If the FAQ section ships, add FAQPage structured data."
    }
  );

  return checks;
}

function normalizeStringList(value: unknown, field: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error(`${field} must be an array of strings.`);
  return value.map((item) => {
    if (typeof item !== "string") throw new Error(`${field} must be an array of strings.`);
    return item;
  });
}

function normalizeInternalLinks(value: unknown): InternalLinkInput[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("internalLinks must be an array.");
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Each internal link must be an object with title and url.");
    }
    const row = item as Record<string, unknown>;
    return {
      title: String(row.title ?? "").trim() || "Related page",
      url: String(row.url ?? "").trim()
    };
  });
}

function clampWordCount(value: number): number {
  if (!Number.isFinite(value)) return 1500;
  return Math.min(Math.max(Math.round(value), 300), 6000);
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}
