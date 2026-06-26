// Pure, network-free incident comms planner. Given the incident details an operator provides, it
// drafts a customer-facing status update and a post-mortem outline for approval. It does not call any
// status-page or messaging API and never posts on its own; a separate write tool would do that.

export type IncidentStatusStage = "investigating" | "identified" | "monitoring" | "resolved";

const STATUS_STAGES: readonly IncidentStatusStage[] = [
  "investigating",
  "identified",
  "monitoring",
  "resolved"
];

export interface IncidentDetails {
  title: string;
  severity: string;
  status: IncidentStatusStage;
  impact: string;
  affectedServices: string[];
  startedAt: string | null;
}

export interface StatusUpdateDraft {
  channel: string;
  headline: string;
  body: string;
  nextUpdateBy: string;
}

export interface IncidentCommsPlan {
  generatedAt: string;
  mode: "read_only_draft";
  posted: false;
  incident: IncidentDetails;
  statusUpdate: StatusUpdateDraft;
  postMortemOutline: string[];
  draftingHint: string;
}

export const draftIncidentUpdateInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      description: 'Short incident title, e.g. "Elevated API error rates".'
    },
    severity: {
      type: "string",
      description: "Incident severity such as critical, major, or minor. Defaults to major."
    },
    status: {
      type: "string",
      enum: ["investigating", "identified", "monitoring", "resolved"],
      description: "Current incident lifecycle stage. Defaults to investigating."
    },
    impact: {
      type: "string",
      description: "Customer-facing description of what is affected and how."
    },
    affectedServices: {
      type: "array",
      items: { type: "string" },
      description: "Names of affected services or components."
    },
    startedAt: {
      type: "string",
      description: "When the incident started, as an ISO timestamp or human-readable time."
    }
  }
} as const;

export interface DraftIncidentUpdateInput {
  title?: string;
  severity?: string;
  status?: string;
  impact?: string;
  affectedServices?: string[];
  startedAt?: string;
}

export function normalizeDraftIncidentUpdateInput(input: unknown): DraftIncidentUpdateInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Incident update input must be an object.");
  }

  const value = input as Record<string, unknown>;

  for (const key of ["title", "severity", "status", "impact", "startedAt"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "string") {
      throw new Error(`${key} must be a string.`);
    }
  }

  let affectedServices: string[] | undefined;
  if (value.affectedServices !== undefined) {
    if (!Array.isArray(value.affectedServices) || value.affectedServices.some((s) => typeof s !== "string")) {
      throw new Error("affectedServices must be an array of strings.");
    }
    affectedServices = value.affectedServices as string[];
  }

  return {
    title: value.title as string | undefined,
    severity: value.severity as string | undefined,
    status: value.status as string | undefined,
    impact: value.impact as string | undefined,
    affectedServices,
    startedAt: value.startedAt as string | undefined
  };
}

export function planIncidentComms(input: DraftIncidentUpdateInput = {}): IncidentCommsPlan {
  const incident = normalizeIncident(input);
  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    posted: false,
    incident,
    statusUpdate: buildStatusUpdate(incident),
    postMortemOutline: buildPostMortemOutline(),
    draftingHint:
      "Refine the customer-facing status update for voice and accuracy using the real incident details, then present both the status update and the post-mortem outline as drafts for operator approval. Do not post to a status page, send to customers, or claim anything was published unless a separate write tool actually confirms it."
  };
}

function normalizeIncident(input: DraftIncidentUpdateInput): IncidentDetails {
  return {
    title: cleanString(input.title) ?? "Untitled incident",
    severity: (cleanString(input.severity) ?? "major").toLowerCase(),
    status: normalizeStage(input.status),
    impact: cleanString(input.impact) ?? "Impact is still being assessed.",
    affectedServices: (input.affectedServices ?? []).map((s) => s.trim()).filter(Boolean),
    startedAt: cleanString(input.startedAt) ?? null
  };
}

function normalizeStage(status: string | undefined): IncidentStatusStage {
  const stage = (cleanString(status) ?? "").toLowerCase();
  return STATUS_STAGES.includes(stage as IncidentStatusStage)
    ? (stage as IncidentStatusStage)
    : "investigating";
}

function buildStatusUpdate(incident: IncidentDetails): StatusUpdateDraft {
  const services =
    incident.affectedServices.length > 0
      ? incident.affectedServices.join(", ")
      : "affected services";

  const lines = [
    `${stageVerb(incident.status)} ${services}.`,
    "",
    `Impact: ${incident.impact}`,
    incident.startedAt ? `Started: ${incident.startedAt}` : null,
    "",
    closingLine(incident.status)
  ].filter((line): line is string => line !== null);

  return {
    channel: "status page / customer email",
    headline: `[${stageLabel(incident.status)}] ${incident.title}`,
    body: lines.join("\n"),
    nextUpdateBy: updateCadence(incident.severity, incident.status)
  };
}

function stageLabel(status: IncidentStatusStage): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function stageVerb(status: IncidentStatusStage): string {
  switch (status) {
    case "identified":
      return "We have identified the cause affecting";
    case "monitoring":
      return "A fix has been applied and we are monitoring";
    case "resolved":
      return "This incident is resolved for";
    case "investigating":
    default:
      return "We are investigating an issue affecting";
  }
}

function closingLine(status: IncidentStatusStage): string {
  switch (status) {
    case "identified":
      return "We are working on a fix and will share the next update shortly.";
    case "monitoring":
      return "We will confirm resolution once we are confident the fix holds.";
    case "resolved":
      return "Thank you for your patience. A post-mortem will follow.";
    case "investigating":
    default:
      return "We will post another update as soon as we know more.";
  }
}

function updateCadence(severity: string, status: IncidentStatusStage): string {
  if (status === "resolved") return "No further status updates required; publish the post-mortem.";
  switch (severity) {
    case "critical":
      return "Post the next update within 30 minutes.";
    case "minor":
      return "Post the next update within a few hours, or when status changes.";
    case "major":
    default:
      return "Post the next update within 60 minutes.";
  }
}

function buildPostMortemOutline(): string[] {
  return [
    "Summary: one-paragraph overview of what happened and the customer impact.",
    "Timeline: detection, escalation, mitigation, and resolution with timestamps.",
    "Impact: who and what was affected, for how long, and by how much.",
    "Root cause: the underlying technical cause, not just the trigger.",
    "Resolution: what was done to mitigate and fully resolve the incident.",
    "Action items: concrete preventive follow-ups with owners and due dates.",
    "Lessons learned: what worked, what did not, and detection/response gaps."
  ];
}

function cleanString(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
