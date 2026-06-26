import { dedupeLeads, searchLeads, type ApolloLead, type IcpFilters } from "./apollo.js";
import { bestPerformingCampaign, reviewCampaigns, type CampaignAnalytics } from "./instantly.js";

export interface SequenceStep {
  step: number;
  purpose: string;
  sendDelayDays: number;
}

export interface OutreachPlan {
  generatedAt: string;
  mode: "read_only_draft";
  icp: IcpFilters;
  campaignGoal: string;
  leadCount: number;
  sampleLeads: ApolloLead[];
  campaignPerformance: CampaignAnalytics[];
  bestPerformer: CampaignAnalytics | null;
  suggestedSequence: SequenceStep[];
  dedupeHint: string;
  draftingHint: string;
}

export const reviewOutreachInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    titles: {
      type: "array",
      items: { type: "string" },
      description: "ICP job titles to target, e.g. [\"Head of Growth\", \"VP Marketing\"]."
    },
    locations: {
      type: "array",
      items: { type: "string" },
      description: "ICP locations, e.g. [\"United States\"]."
    },
    keywords: {
      type: "string",
      description: "Free-text keyword filter for the person or company."
    },
    employeeRanges: {
      type: "array",
      items: { type: "string" },
      description: "Apollo company-size ranges, e.g. [\"11,50\", \"51,200\"]."
    },
    limit: {
      type: "number",
      description: "Maximum number of leads to pull. Defaults to 25."
    },
    campaignGoal: {
      type: "string",
      description: "What this outreach campaign should achieve. Defaults to booking intro calls."
    }
  }
} as const;

export interface ReviewOutreachInput {
  titles?: string[];
  locations?: string[];
  keywords?: string;
  employeeRanges?: string[];
  limit?: number;
  campaignGoal?: string;
}

export function normalizeReviewOutreachInput(input: unknown): ReviewOutreachInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Outreach review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    titles: optionalStringArray(value.titles, "titles"),
    locations: optionalStringArray(value.locations, "locations"),
    keywords: optionalString(value.keywords, "keywords"),
    employeeRanges: optionalStringArray(value.employeeRanges, "employeeRanges"),
    limit: optionalNumber(value.limit, "limit"),
    campaignGoal: optionalString(value.campaignGoal, "campaignGoal")
  };
}

// Read + plan only. Pulls fresh ICP leads from Apollo and recent Instantly campaign performance,
// then returns a draft plan for the next cold-email campaign. It never creates, edits, or launches
// anything in Instantly and never contacts a lead.
export async function reviewOutreach(input: ReviewOutreachInput = {}, fetchImpl: typeof fetch = fetch): Promise<OutreachPlan> {
  const icp: IcpFilters = {
    titles: input.titles ?? [],
    locations: input.locations ?? [],
    keywords: input.keywords ?? null,
    employeeRanges: input.employeeRanges ?? [],
    limit: input.limit && input.limit > 0 ? Math.min(Math.floor(input.limit), 100) : 25
  };
  const campaignGoal = input.campaignGoal ?? "Book intro calls with new ICP accounts.";

  const [rawLeads, campaignPerformance] = await Promise.all([
    searchLeads(icp, fetchImpl),
    reviewCampaigns(fetchImpl)
  ]);
  const leads = dedupeLeads(rawLeads);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    icp,
    campaignGoal,
    leadCount: leads.length,
    sampleLeads: leads.slice(0, 10),
    campaignPerformance,
    bestPerformer: bestPerformingCampaign(campaignPerformance),
    suggestedSequence: suggestedSequence(),
    dedupeHint:
      "These leads were deduped within this pull by email, LinkedIn URL, then Apollo id. Persist this lead list alongside prior runs so a later campaign does not re-contact the same people.",
    draftingHint:
      "Use the copywriting skill to write the subject line and body for each sequence step, modeling tone and angle on the best-performing campaign above. Present every email as a draft with its step and send delay for operator approval. Do not create or launch the campaign in Instantly."
  };
}

function suggestedSequence(): SequenceStep[] {
  return [
    { step: 1, purpose: "Cold intro: open with a specific, relevant pain point and a soft, single ask.", sendDelayDays: 0 },
    { step: 2, purpose: "Bump: add one proof point or short case study and restate the ask.", sendDelayDays: 3 },
    { step: 3, purpose: "Value add: share a useful resource or insight with no hard pitch.", sendDelayDays: 4 },
    { step: 4, purpose: "Breakup: final follow-up, easy opt-out, leave the door open for later.", sendDelayDays: 5 }
  ];
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  return value;
}

function optionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) throw new Error(`${field} must be a number.`);
  return value;
}

function optionalStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${field} must be an array of strings.`);
  }
  return value as string[];
}
