export interface ProspectPlan {
  prospectType: string;
  whereToFind: string;
  qualification: string;
  draftOutreach: string;
}

export interface LinkBuildingPlan {
  generatedAt: string;
  mode: "read_only_draft";
  topic: string;
  prospects: ProspectPlan[];
  outreachHint: string;
}

export const findProspectsInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["topic"],
  properties: {
    topic: {
      type: "string",
      description: "Topic or niche to find backlink and guest-post prospects for."
    }
  }
} as const;

export interface FindProspectsInput {
  topic: string;
}

export function normalizeFindProspectsInput(input: unknown): FindProspectsInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Link building input must be an object with a topic string.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.topic !== "string" || value.topic.trim().length === 0) {
    throw new Error("topic must be a non-empty string.");
  }

  return { topic: value.topic.trim() };
}

// Pure, network-free planner. This tool does not crawl the web, scrape contact details, or send
// email. It proposes prospect archetypes and personalized outreach drafts for the operator to
// research and send themselves.
export function findProspects(input: FindProspectsInput): LinkBuildingPlan {
  const parsed = normalizeFindProspectsInput(input);
  const topic = parsed.topic;

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    topic,
    prospects: buildProspects(topic),
    outreachHint:
      "Use the programmatic SEO skill to sharpen each draft's angle and personalization. Present every message as a draft for operator approval; the prospect types are categories to research, not verified live URLs or contacts."
  };
}

function buildProspects(topic: string): ProspectPlan[] {
  return [
    {
      prospectType: "Resource page link",
      whereToFind: `Search for pages listing tools and guides about ${topic}, e.g. "${topic}" intitle:resources or inurl:links.`,
      qualification: "Page already curates external links and ranks for the topic, so a relevant addition is on-theme and easy to approve.",
      draftOutreach: `Subject: A resource for your ${topic} list\n\nHi {{name}}, I came across your roundup of ${topic} resources while researching the space. We recently published a guide on ${topic} that covers {{specific angle}} in more depth than most of what's out there. If it's a fit, it might be a useful addition for your readers. Either way, thanks for keeping such a helpful list.`
    },
    {
      prospectType: "Guest post",
      whereToFind: `Find blogs that publish contributor content on ${topic}, e.g. "${topic}" "write for us" or "${topic}" "guest post".`,
      qualification: "Publication accepts contributors, has an engaged audience overlapping ours, and covers adjacent topics we can add a fresh angle to.",
      draftOutreach: `Subject: Guest post idea on ${topic}\n\nHi {{name}}, I read your recent piece on {{their article}} and liked {{specific detail}}. I'd love to contribute a piece on ${topic} for your audience, for example "{{proposed title}}" with {{2-3 takeaways}}. I can tailor the angle to what your readers respond to. Would a draft be welcome?`
    },
    {
      prospectType: "Broken link replacement",
      whereToFind: `Find pages about ${topic} that link to dead or outdated resources, using a broken-link checker on top-ranking ${topic} articles.`,
      qualification: "Target page has a confirmed broken outbound link and our content is a close, current replacement for what it pointed to.",
      draftOutreach: `Subject: A couple of broken links on your ${topic} page\n\nHi {{name}}, while reading your article on ${topic} I noticed a couple of links that no longer resolve ({{broken URL}}). In case it helps, we have a current resource on the same subject that could stand in: {{your URL}}. Thanks for the useful write-up either way.`
    },
    {
      prospectType: "Competitor backlink outreach",
      whereToFind: `Pull the backlink profiles of the top-ranking pages for ${topic} and list sites that link to multiple competitors but not to us.`,
      qualification: "Site already links to competing ${topic} content, signaling editorial interest and a realistic chance of linking to a better resource.",
      draftOutreach: `Subject: Worth a mention alongside your ${topic} coverage?\n\nHi {{name}}, I noticed you reference {{competitor}} in your piece on ${topic}. We've published a resource that goes further on {{specific gap}} and might complement what you already link to. No pressure at all, but happy to share details if it's useful.`
    },
    {
      prospectType: "Expert roundup / podcast",
      whereToFind: `Find roundups, newsletters, and podcasts covering ${topic} that feature outside contributors or interviews.`,
      qualification: "Format regularly features outside voices, and our perspective on ${topic} adds a distinct, quotable angle.",
      draftOutreach: `Subject: A perspective for your ${topic} coverage\n\nHi {{name}}, I enjoy how you cover ${topic} in {{their format}}. If you ever feature outside perspectives, I'd be glad to contribute a short take or join an interview on {{specific angle}}. Happy to send a few talking points so you can judge the fit.`
    }
  ];
}
