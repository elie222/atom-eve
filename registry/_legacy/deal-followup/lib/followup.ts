export interface NextStep {
  owner: "us" | "prospect" | "unspecified";
  action: string;
  source: string;
}

export interface CrmFieldDraft {
  field: string;
  suggestedValue: string;
  evidence: string;
}

export interface DealFollowupPlan {
  generatedAt: string;
  mode: "read_only_draft";
  transcriptStats: { lines: number; words: number };
  recapEmail: {
    subjectHint: string;
    sections: string[];
  };
  nextSteps: NextStep[];
  crmFieldDrafts: CrmFieldDraft[];
  draftingHint: string;
}

export const planDealFollowupInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["transcript"],
  properties: {
    transcript: {
      type: "string",
      description: "Full text transcript of the sales call to summarize and plan follow-up for."
    }
  }
} as const;

export interface PlanDealFollowupInput {
  transcript: string;
}

export function normalizePlanDealFollowupInput(input: unknown): PlanDealFollowupInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Deal follow-up input must be an object with a transcript.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.transcript !== "string" || value.transcript.trim() === "") {
    throw new Error("transcript must be a non-empty string.");
  }

  return { transcript: value.transcript };
}

// Pure, network-free planner. It parses the supplied transcript into candidate next steps, CRM
// field signals, and a recap-email scaffold. It never reads from or writes to email or any CRM;
// the agent drafts the prose and the operator approves and sends.
export function planDealFollowup(input: PlanDealFollowupInput): DealFollowupPlan {
  const lines = splitLines(input.transcript);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    transcriptStats: {
      lines: lines.length,
      words: countWords(input.transcript)
    },
    recapEmail: {
      subjectHint: "Recap and next steps from our call",
      sections: [
        "Thank-you and a one-line summary of the call's purpose",
        "Key priorities and pain points the prospect raised, in their own words",
        "How our solution maps to those priorities",
        "Agreed next steps with owners and dates",
        "A clear, low-friction call to action"
      ]
    },
    nextSteps: extractNextSteps(lines),
    crmFieldDrafts: extractCrmFieldDrafts(lines),
    draftingHint:
      "Draft the recap email by filling in each section using the prospect's own words from the transcript. Present the recap email, the extracted next steps (with owners and dates), and the suggested CRM field updates as drafts for operator approval. This tool only parses the transcript; it does not send email or write to any CRM."
  };
}

const NEXT_STEP_CUE =
  /\b(i'?ll|we'?ll|i will|we will|you'?ll|they'?ll|let'?s|next step|follow[- ]?up|circle back|loop in|send (you|over|the|a)|share (the|a)|schedule|set up|book a|put together|draft|get back to you|action item|by (monday|tuesday|wednesday|thursday|friday|eod|end of (day|week)|next week|next quarter))\b/i;

function extractNextSteps(lines: string[]): NextStep[] {
  const steps: NextStep[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (!NEXT_STEP_CUE.test(line)) continue;
    const action = truncate(line);
    if (seen.has(action)) continue;
    seen.add(action);
    steps.push({ owner: detectOwner(line), action, source: line });
  }
  return steps;
}

function detectOwner(line: string): NextStep["owner"] {
  if (/\b(i'?ll|we'?ll|i will|we will|let me|i can|we can|on (my|our) (side|end))\b/i.test(line)) {
    return "us";
  }
  if (/\b(you'?ll|they'?ll|you will|your team|on your (side|end))\b/i.test(line)) {
    return "prospect";
  }
  return "unspecified";
}

const CRM_FIELD_RULES: Array<{ field: string; pattern: RegExp }> = [
  { field: "budget", pattern: /\bbudget\b|\$[\d,]+(?:\.\d+)?|\b\d+\s?k\b|\bper (seat|user|month|year)\b/i },
  {
    field: "timeline",
    pattern: /\b(timeline|deadline|go[- ]?live|launch|by Q[1-4]|this quarter|next quarter|end of (the )?(month|quarter|year))\b/i
  },
  {
    field: "decision_makers",
    pattern: /\b(decision[- ]?maker|sign[- ]?off|approval|cfo|cto|ceo|coo|vp of|head of|procurement|stakeholder)\b/i
  },
  { field: "pain_points", pattern: /\b(problem|pain|challenge|struggle|frustrat|bottleneck|manual|currently (using|doing))\b/i },
  { field: "use_case", pattern: /\b(use case|trying to|looking to|want to|need to|hoping to|goal is)\b/i },
  { field: "competitors", pattern: /\b(competitor|currently use|alternative|versus|compared to|evaluating)\b/i },
  { field: "next_meeting", pattern: /\b(next (call|meeting)|follow[- ]?up call|demo|reconvene)\b/i }
];

function extractCrmFieldDrafts(lines: string[]): CrmFieldDraft[] {
  const drafts: CrmFieldDraft[] = [];
  for (const rule of CRM_FIELD_RULES) {
    const match = lines.find((line) => rule.pattern.test(line));
    if (!match) continue;
    drafts.push({ field: rule.field, suggestedValue: truncate(match), evidence: match });
  }
  return drafts;
}

function splitLines(transcript: string): string[] {
  return transcript
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function countWords(text: string): number {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function truncate(text: string, max = 280): string {
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
