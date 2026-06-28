export type LaunchChannel = "producthunt" | "hackernews" | "launch-day";

export interface LaunchCopyDraft {
  label: string;
  draft: string;
}

export interface LaunchScheduleItem {
  when: string;
  task: string;
}

export interface LaunchPlan {
  generatedAt: string;
  mode: "read_only_draft";
  product: string;
  channel: LaunchChannel;
  assetChecklist: string[];
  draftCopy: LaunchCopyDraft[];
  schedule: LaunchScheduleItem[];
  draftingHint: string;
}

export const planLaunchInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["product"],
  properties: {
    product: {
      type: "string",
      description: "The product or feature being launched (used to scaffold the draft copy)."
    },
    channel: {
      type: "string",
      enum: ["producthunt", "hackernews", "launch-day"],
      description:
        "Launch channel playbook to plan: producthunt, hackernews (Show HN), or launch-day (general multi-channel). Defaults to producthunt."
    }
  }
} as const;

export interface PlanLaunchInput {
  product: string;
  channel?: LaunchChannel;
}

export function normalizePlanLaunchInput(input: unknown): PlanLaunchInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Plan launch input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.product !== "string" || value.product.trim() === "") {
    throw new Error("product must be a non-empty string naming what is being launched.");
  }

  return {
    product: value.product,
    channel: normalizeChannel(value.channel)
  };
}

function normalizeChannel(value: unknown): LaunchChannel | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new Error("channel must be a string.");
  }

  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, "");
  if (normalized === "producthunt" || normalized === "ph") return "producthunt";
  if (normalized === "hackernews" || normalized === "hn" || normalized === "showhn") return "hackernews";
  if (normalized === "launchday" || normalized === "launch" || normalized === "general" || normalized === "all") {
    return "launch-day";
  }

  throw new Error("channel must be one of: producthunt, hackernews, launch-day.");
}

const DRAFTING_HINT =
  "Use the marketing-ideas skill to turn this checklist and these scaffolds into finished, on-brand copy and comments. Present everything as drafts for operator approval alongside the proposed schedule; do not post, submit, schedule, or send anything without explicit sign-off.";

// Pure, network-free planner. It builds a draft-first launch playbook (asset checklist, copy
// scaffolds, and posting schedule) for a single channel. It does not call Product Hunt, Hacker
// News, or any other platform API and does not post or schedule anything.
export function planLaunch(input: PlanLaunchInput): LaunchPlan {
  const product = input.product.trim();
  const channel = input.channel ?? "producthunt";

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    product,
    channel,
    ...playbookFor(channel, product),
    draftingHint: DRAFTING_HINT
  };
}

interface ChannelPlaybook {
  assetChecklist: string[];
  draftCopy: LaunchCopyDraft[];
  schedule: LaunchScheduleItem[];
}

function playbookFor(channel: LaunchChannel, product: string): ChannelPlaybook {
  if (channel === "hackernews") return hackerNewsPlaybook(product);
  if (channel === "launch-day") return launchDayPlaybook(product);
  return productHuntPlaybook(product);
}

function productHuntPlaybook(product: string): ChannelPlaybook {
  return {
    assetChecklist: [
      "Thumbnail/logo: a 240x240px PNG or GIF that reads clearly at small size.",
      "Gallery: 3-6 images at 1270x760px showing the core flow, plus an optional demo video or GIF.",
      "Pick the topics/categories and add up to 4 relevant tags.",
      "Line up a hunter (or self-hunt) and confirm the maker account is verified.",
      "Prepare a launch-day offer or exclusive for the Product Hunt community, if you are running one."
    ],
    draftCopy: [
      { label: "Name", draft: product },
      { label: "Tagline (<=60 chars)", draft: `[One-line value prop for ${product} in under 60 characters]` },
      { label: "Description", draft: `[2-3 sentences on what ${product} does, who it is for, and why now]` },
      {
        label: "First maker comment",
        draft: `Hi Product Hunt! I built ${product} because [problem]. [What it does and the one thing to try first.] I'll be here all day to answer questions and would love your feedback.`
      }
    ],
    schedule: [
      { when: "T-7 days", task: "Finalize assets and copy; line up the hunter and let your audience know a launch is coming." },
      { when: "T-1 day", task: "Schedule the listing for 12:01am PT; brief your team and supporters on engaging authentically (no vote-begging)." },
      { when: "Launch 12:01am PT", task: "Publish the listing and post the first maker comment." },
      { when: "Launch day", task: "Reply to every comment quickly; share to your channels without asking for upvotes." },
      { when: "T+1 day", task: "Thank supporters, recap results, and follow up with interested commenters." }
    ]
  };
}

function hackerNewsPlaybook(product: string): ChannelPlaybook {
  return {
    assetChecklist: [
      "A working URL or live demo that loads fast and needs no signup to evaluate.",
      "A clear 'Show HN:' title under ~80 characters.",
      "A first comment with context: what it is, why you built it, and what is technically interesting.",
      "Confirm the site can handle an HN traffic spike (caching, rate limits, error pages)."
    ],
    draftCopy: [
      { label: "Title", draft: `Show HN: ${product} – [what it does in a few words]` },
      {
        label: "First comment",
        draft: `I built ${product} because [problem]. [How it works and what is technically interesting.] It's [free/open-source/paid]. Happy to answer questions and hear feedback.`
      }
    ],
    schedule: [
      { when: "Pick the day", task: "Post on a weekday morning US Eastern time when HN is active; avoid weekends and holidays." },
      { when: "At post", task: "Submit the Show HN and immediately add the context comment." },
      { when: "First few hours", task: "Reply to every comment honestly and quickly; engage critics in good faith." },
      { when: "Throughout", task: "Do not ask for upvotes or use voting rings; let the post stand on its merits." }
    ]
  };
}

function launchDayPlaybook(product: string): ChannelPlaybook {
  return {
    assetChecklist: [
      "Landing page updated with the launch offer and one clear primary CTA.",
      "Announcement email drafted for your list.",
      "Social posts drafted for each channel you use (X, LinkedIn, etc.).",
      "Press/outreach list and a short pitch ready, if you are doing press.",
      "Support and analytics ready to handle the traffic and questions."
    ],
    draftCopy: [
      { label: "Announcement email subject", draft: `[Subject line announcing ${product} is live]` },
      {
        label: "Announcement email body",
        draft: `Today we're launching ${product}. [What it does, who it's for, and the one action you want readers to take.]`
      },
      {
        label: "Social post",
        draft: `${product} is live. [One-line hook + link + the single best reason to try it today.]`
      }
    ],
    schedule: [
      { when: "T-7 days", task: "Tease the launch to your audience and finalize all assets and copy." },
      { when: "T-1 day", task: "Queue the email and social posts as drafts; confirm the landing page and tracking work." },
      { when: "Launch morning", task: "Publish the announcement, send the email, and post to your channels." },
      { when: "Launch day", task: "Respond to replies and questions; monitor analytics and support." },
      { when: "T+1 day", task: "Recap results, thank early users, and follow up with leads." }
    ]
  };
}
