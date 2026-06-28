export type CopyType =
  | "button"
  | "empty-state"
  | "error"
  | "tooltip"
  | "onboarding"
  | "label"
  | "general";

export interface CopyIssue {
  kind: string;
  severity: "info" | "suggestion" | "fix";
  note: string;
}

export interface CopyItemReview {
  original: string;
  wordCount: number;
  issues: CopyIssue[];
  rewriteGoal: string;
}

export interface MicrocopyPlan {
  generatedAt: string;
  mode: "read_only_draft";
  source: "strings" | "description";
  copyType: CopyType;
  voice: string;
  items: CopyItemReview[];
  principles: string[];
  draftingHint: string;
}

export interface ImproveCopyInput {
  strings?: string[];
  screenDescription?: string;
  voice?: string;
  copyType?: CopyType;
}

const COPY_TYPES: readonly CopyType[] = [
  "button",
  "empty-state",
  "error",
  "tooltip",
  "onboarding",
  "label",
  "general"
];

export const improveCopyInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    strings: {
      type: "array",
      items: { type: "string" },
      description:
        "Existing in-product copy strings to rewrite (buttons, empty states, errors, tooltips, labels)."
    },
    screenDescription: {
      type: "string",
      description:
        "Plain-language description of the screen, flow, or empty state, used when no concrete strings are supplied."
    },
    voice: {
      type: "string",
      description:
        "Brand voice and tone to write toward (e.g. 'friendly, concise, confident'). Defaults to clear and plain."
    },
    copyType: {
      type: "string",
      enum: [...COPY_TYPES],
      description: "Kind of microcopy being rewritten. Defaults to general."
    }
  }
} as const;

export function normalizeImproveCopyInput(input: unknown): ImproveCopyInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Microcopy input must be an object.");
  }

  const value = input as Record<string, unknown>;

  let strings: string[] | undefined;
  if (value.strings !== undefined) {
    if (!Array.isArray(value.strings) || value.strings.some((item) => typeof item !== "string")) {
      throw new Error("strings must be an array of strings.");
    }
    strings = value.strings as string[];
  }
  if (value.screenDescription !== undefined && typeof value.screenDescription !== "string") {
    throw new Error("screenDescription must be a string.");
  }
  if (value.voice !== undefined && typeof value.voice !== "string") {
    throw new Error("voice must be a string.");
  }
  if (value.copyType !== undefined) {
    if (typeof value.copyType !== "string" || !COPY_TYPES.includes(value.copyType as CopyType)) {
      throw new Error(`copyType must be one of: ${COPY_TYPES.join(", ")}.`);
    }
  }

  return {
    strings,
    screenDescription: value.screenDescription as string | undefined,
    voice: value.voice as string | undefined,
    copyType: value.copyType as CopyType | undefined
  };
}

// Pure, network-free planner. It heuristically scans the in-product copy you paste in (or a screen
// description), flags clarity and voice problems, and returns a per-string rewrite goal plus a voice
// checklist. It never reads your codebase, never calls a design system, and never edits anything;
// the agent uses this plan to draft rewrites and presents them for operator approval.
export function improveCopy(input: ImproveCopyInput = {}): MicrocopyPlan {
  const voice = (input.voice ?? "clear, plain, and human; calm and concise").trim() || "clear, plain, and human; calm and concise";
  const copyType: CopyType = input.copyType ?? "general";
  const strings = (input.strings ?? []).map((line) => line.trim()).filter((line) => line.length > 0);
  const description = (input.screenDescription ?? "").trim();
  const source: "strings" | "description" = strings.length > 0 ? "strings" : "description";

  const items =
    source === "strings"
      ? strings.map((original) => reviewString(original, copyType))
      : reviewFromDescription(description, copyType);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    source,
    copyType,
    voice,
    items,
    principles: principlesFor(copyType),
    draftingHint: buildDraftingHint(source, items.length, description)
  };
}

function reviewString(original: string, copyType: CopyType): CopyItemReview {
  const wordCount = countWords(original);
  const issues: CopyIssue[] = [];

  const isShort = copyType === "button" || copyType === "label";
  if (isShort && wordCount > 4) {
    issues.push({
      kind: "length",
      severity: "fix",
      note: "Tighten to a 1-3 word action or label; long buttons and labels read as instructions."
    });
  } else if (!isShort && wordCount > 25) {
    issues.push({
      kind: "length",
      severity: "suggestion",
      note: "Split into shorter sentences; aim for one idea per line so it scans quickly."
    });
  }

  if (copyType === "button" && /\b(click here|submit|ok|go|here|continue)\b/i.test(original)) {
    issues.push({
      kind: "vague-cta",
      severity: "fix",
      note: "Name the outcome with a specific verb (e.g. 'Save changes', 'Create project') instead of a generic label."
    });
  }

  if (/\b(null|undefined|error code|exception|invalid input|backend|server error|api|token|payload)\b/i.test(original)) {
    issues.push({
      kind: "jargon",
      severity: "fix",
      note: "Replace system or developer terms with plain human language the user understands."
    });
  }

  if (/\b(was|were|been|is being|are being|has been|have been)\b/i.test(original)) {
    issues.push({
      kind: "passive-voice",
      severity: "suggestion",
      note: "Prefer active voice; say who does what (e.g. 'We saved your changes')."
    });
  }

  if (countExclamations(original) > 1 || hasShouting(original)) {
    issues.push({
      kind: "tone",
      severity: "suggestion",
      note: "Drop all-caps and extra exclamation marks; keep the tone calm and confident."
    });
  }

  if (copyType === "empty-state" && !hasActionGuidance(original)) {
    issues.push({
      kind: "no-next-step",
      severity: "fix",
      note: "Empty states should tell the user what to do next, not just that something is empty."
    });
  }

  if (copyType === "error") {
    if (!hasRecoveryGuidance(original)) {
      issues.push({
        kind: "no-recovery",
        severity: "fix",
        note: "Errors should say what happened and how to fix it, with a clear next step."
      });
    }
    if (/\b(you (failed|cannot|can't|must not|are not allowed)|invalid|illegal|forbidden|denied)\b/i.test(original)) {
      issues.push({
        kind: "blaming-tone",
        severity: "suggestion",
        note: "Avoid blaming the user; describe the problem neutrally and point to the fix."
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      kind: "voice-pass",
      severity: "info",
      note: "No clarity flags detected. Still pass it against the voice checklist and tighten if you can."
    });
  }

  return { original, wordCount, issues, rewriteGoal: rewriteGoalFor(copyType) };
}

function reviewFromDescription(description: string, copyType: CopyType): CopyItemReview[] {
  const label = description.length > 0 ? "described screen" : "screen";
  return [
    {
      original: description.length > 0 ? description : "(no copy or description provided)",
      wordCount: countWords(description),
      issues: [
        {
          kind: "from-description",
          severity: "info",
          note:
            description.length > 0
              ? `No concrete strings were provided. Draft copy for the ${label} from the description and the voice checklist.`
              : "No copy or description was provided. Ask for the exact strings (or at least a screen description) before drafting."
        }
      ],
      rewriteGoal: rewriteGoalFor(copyType)
    }
  ];
}

function rewriteGoalFor(copyType: CopyType): string {
  switch (copyType) {
    case "button":
      return "Rewrite as a 1-3 word action that names the outcome and matches the brand voice.";
    case "empty-state":
      return "Rewrite to reassure, explain why it's empty, and give one clear next action.";
    case "error":
      return "Rewrite to say what happened in plain language and exactly how to recover, without blame.";
    case "tooltip":
      return "Rewrite as a short, scannable hint that adds info the label alone doesn't convey.";
    case "onboarding":
      return "Rewrite to orient the user, set expectations, and move them to the next step.";
    case "label":
      return "Rewrite as a concise, unambiguous label using the user's vocabulary.";
    default:
      return "Rewrite for clarity and voice: one idea, active voice, plain words, and a clear action.";
  }
}

function principlesFor(copyType: CopyType): string[] {
  const base = [
    "Lead with the user's goal, not the system's state.",
    "Use plain, human language; cut jargon and internal terms.",
    "Prefer active voice and concrete verbs.",
    "Keep it short: one idea per line, no filler.",
    `Match the requested voice consistently across every string (${copyType} copy).`
  ];
  if (copyType === "error") {
    base.push("Pair every error with a recovery step; never leave the user stuck.");
  }
  if (copyType === "empty-state") {
    base.push("Turn the empty state into an invitation with a single clear action.");
  }
  if (copyType === "button") {
    base.push("Buttons name outcomes ('Create project'), not generic verbs ('Submit').");
  }
  return base;
}

function buildDraftingHint(source: "strings" | "description", itemCount: number, description: string): string {
  if (source === "description" && description.length === 0) {
    return "No copy or description was provided. Ask for the exact in-product strings (or at least a screen description) before drafting rewrites.";
  }
  if (source === "description") {
    return "No concrete strings were provided, so the plan is inferred from the description. Draft candidate copy from the voice checklist, but ask for the exact strings to pin down rewrites. Present every rewrite as a draft for operator approval; do not change any product copy.";
  }
  return `Reviewed ${itemCount} string(s). Draft a rewrite for each, fixing the flagged issues first and matching the voice checklist. Show the original next to your rewrite as a draft for operator approval; do not edit product copy or claim anything shipped.`;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countExclamations(text: string): number {
  return (text.match(/!/g) ?? []).length;
}

function hasShouting(text: string): boolean {
  return (text.match(/\b[A-Z]{3,}\b/g) ?? []).length > 0;
}

function hasActionGuidance(text: string): boolean {
  return /\b(create|add|start|invite|import|connect|upload|set up|get started|try|browse|explore|new)\b/i.test(text);
}

function hasRecoveryGuidance(text: string): boolean {
  return /\b(try|check|retry|again|contact|reconnect|re-enter|refresh|sign in|update|verify)\b/i.test(text);
}
