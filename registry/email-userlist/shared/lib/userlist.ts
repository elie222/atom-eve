export interface UserlistEventPlan {
  eventName: string;
  when: string;
}

export interface UserlistCampaignPlan {
  generatedAt: string;
  mode: "read_only_draft";
  lifecycleStage: string;
  suggestedEvents: UserlistEventPlan[];
  draftingHint: string;
  credentialsConfigured: boolean;
}

export const reviewUserlistPlanInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lifecycleStage: {
      type: "string",
      description: "Lifecycle stage to plan events and copy for. Defaults to onboarding."
    }
  }
} as const;

export interface ReviewUserlistPlanInput {
  lifecycleStage?: string;
}

export function normalizeReviewUserlistPlanInput(input: unknown): ReviewUserlistPlanInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Userlist plan input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.lifecycleStage !== undefined && typeof value.lifecycleStage !== "string") {
    throw new Error("lifecycleStage must be a string.");
  }

  return {
    lifecycleStage: value.lifecycleStage as string | undefined
  };
}

// Pure, network-free planner. The Userlist Push API is event/push-oriented and offers no clean
// "list audiences" read endpoint, so this tool drafts an event/trait plan for the operator to push
// rather than reading from Userlist.
export function reviewUserlistPlan(input: ReviewUserlistPlanInput = {}): UserlistCampaignPlan {
  const lifecycleStage = input.lifecycleStage ?? "onboarding";
  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    lifecycleStage,
    suggestedEvents: suggestEvents(lifecycleStage),
    draftingHint:
      "Use the copywriting skill to draft the message for each suggested event. Present each draft with its subject line and triggering event for operator approval; do not push events or send without explicit sign-off.",
    credentialsConfigured: Boolean(process.env.USERLIST_PUSH_KEY)
  };
}

function suggestEvents(lifecycleStage: string): UserlistEventPlan[] {
  const stage = lifecycleStage.trim().toLowerCase();

  if (stage === "activation") {
    return [
      { eventName: "feature_first_use", when: "User uses a core feature for the first time." },
      { eventName: "setup_incomplete", when: "User signed up but has not completed setup after 48 hours." },
      { eventName: "first_value_reached", when: "User hits their first success milestone." }
    ];
  }

  if (stage === "retention") {
    return [
      { eventName: "weekly_active", when: "User has been active every week for a month." },
      { eventName: "usage_dropped", when: "User activity falls below their usual baseline." },
      { eventName: "feature_unused", when: "A high-value feature has not been used in 30 days." }
    ];
  }

  if (stage === "winback" || stage === "win_back") {
    return [
      { eventName: "churned", when: "Subscription cancelled or lapsed." },
      { eventName: "inactive_60d", when: "No activity for 60 days." },
      { eventName: "reactivation_offer_eligible", when: "Churned user qualifies for a comeback offer." }
    ];
  }

  // Default: onboarding.
  return [
    { eventName: "signed_up", when: "User creates an account." },
    { eventName: "onboarding_step_completed", when: "User finishes a key onboarding step." },
    { eventName: "onboarding_stalled", when: "User has not progressed in onboarding after 24 hours." }
  ];
}
