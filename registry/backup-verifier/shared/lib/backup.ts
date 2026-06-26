export interface RestoreScenarioPlan {
  scenario: string;
  cleanRoomSteps: string[];
  verificationChecks: string[];
}

export interface BackupGap {
  area: string;
  severity: "info" | "watch" | "action";
  finding: string;
}

export interface RestoreCheckPlan {
  generatedAt: string;
  mode: "read_only_draft";
  backupDescription: string;
  scenarios: RestoreScenarioPlan[];
  gaps: BackupGap[];
  reviewHint: string;
}

export const planRestoreCheckInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    backupDescription: {
      type: "string",
      description:
        "Description of the backup setup to verify: what is backed up, where it is stored, how often, retention, and any encryption / offsite / immutability details."
    },
    scenarios: {
      type: "array",
      items: { type: "string" },
      description:
        "Recovery scenarios to draft clean-room restore-and-verify steps for. Defaults to a standard set when omitted."
    }
  }
} as const;

export interface PlanRestoreCheckInput {
  backupDescription?: string;
  scenarios?: string[];
}

export function normalizePlanRestoreCheckInput(input: unknown): PlanRestoreCheckInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Restore check input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.backupDescription !== undefined && typeof value.backupDescription !== "string") {
    throw new Error("backupDescription must be a string.");
  }

  let scenarios: string[] | undefined;
  if (value.scenarios !== undefined) {
    if (!Array.isArray(value.scenarios) || value.scenarios.some((item) => typeof item !== "string")) {
      throw new Error("scenarios must be an array of strings.");
    }
    scenarios = value.scenarios as string[];
  }

  return {
    backupDescription: value.backupDescription as string | undefined,
    scenarios
  };
}

const DEFAULT_SCENARIOS = [
  "Full restore",
  "Point-in-time restore",
  "Single-item restore",
  "Infrastructure rebuild"
];

// Pure, network-free planner. It drafts clean-room restore-and-verify steps for the operator to run
// and reports gaps in the described backup setup. It never restores, deletes, or modifies anything.
export function planRestoreCheck(input: PlanRestoreCheckInput = {}): RestoreCheckPlan {
  const backupDescription = (input.backupDescription ?? "").trim();
  const scenarioNames =
    input.scenarios && input.scenarios.length > 0 ? input.scenarios : DEFAULT_SCENARIOS;

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    backupDescription: backupDescription || "(none provided)",
    scenarios: scenarioNames.map(planScenario),
    gaps: findGaps(backupDescription),
    reviewHint:
      "Review each clean-room plan and the reported gaps before acting. This agent does not restore, delete, or modify any backup or system; an operator must run the restore tests and remediate gaps."
  };
}

function planScenario(scenario: string): RestoreScenarioPlan {
  return {
    scenario,
    cleanRoomSteps: [
      "Provision an isolated clean-room environment with no network access to production.",
      "Pull the most recent backup artifact for this scenario and verify its checksum or signature before use.",
      "Restore the backup into the clean room only; never restore over production.",
      "Run the verification checks below and record actual recovery time (RTO) and recovery point (RPO) against targets.",
      "Capture the results, then destroy the clean-room environment and its restored copy."
    ],
    verificationChecks: verificationChecksFor(scenario)
  };
}

function verificationChecksFor(scenario: string): string[] {
  const key = scenario.trim().toLowerCase();

  if (key.includes("point") || key.includes("pitr")) {
    return [
      "Confirm the restored state matches the chosen recovery timestamp.",
      "Verify transactions after the target time are absent and those before it are present.",
      "Check the achieved recovery point against the RPO target."
    ];
  }

  if (key.includes("single") || key.includes("item") || key.includes("file") || key.includes("record")) {
    return [
      "Locate the restored record or file in the clean room.",
      "Compare its contents field-by-field or byte-for-byte against the expected value.",
      "Confirm no unrelated data was altered by the restore."
    ];
  }

  if (key.includes("infra") || key.includes("rebuild") || key.includes("bare") || key.includes("disaster")) {
    return [
      "Rebuild services from infrastructure-as-code plus the restored state.",
      "Confirm configuration, secret references, and dependencies resolve in isolation.",
      "Run smoke tests across core user flows end to end."
    ];
  }

  if (key.includes("full")) {
    return [
      "Confirm total record or row counts match the source snapshot.",
      "Validate schema and referential integrity.",
      "Boot the application against the restored data and exercise a critical read/write path."
    ];
  }

  return [
    "Confirm the restored data is complete for this scenario.",
    "Validate integrity against a known-good reference.",
    "Exercise the dependent flow to prove the restored copy is usable."
  ];
}

function findGaps(description: string): BackupGap[] {
  if (!description) {
    return [
      {
        area: "coverage",
        severity: "action",
        finding:
          "No backup setup was described. Provide what is backed up, where it is stored, how often, retention, and any encryption / offsite / immutability details so gaps can be assessed."
      }
    ];
  }

  const text = description.toLowerCase();
  const gaps: BackupGap[] = [];
  const has = (...needles: string[]) => needles.some((needle) => text.includes(needle));

  if (!has("offsite", "off-site", "another region", "second region", "3-2-1", "3 2 1", "separate account", "geo")) {
    gaps.push({
      area: "offsite-copy",
      severity: "action",
      finding:
        "No offsite or separate-account copy is mentioned. A backup in the same account or region as production can be lost with it. Confirm a 3-2-1 style copy exists."
    });
  }

  if (!has("immutab", "air gap", "air-gap", "worm", "object lock", "ransomware")) {
    gaps.push({
      area: "immutability",
      severity: "action",
      finding:
        "No immutable or air-gapped copy is mentioned. Without object-lock or WORM storage, ransomware or accidental deletion can destroy backups. Confirm an immutable retention tier."
    });
  }

  if (!has("test", "drill", "rehears", "verif", "restore exercise")) {
    gaps.push({
      area: "restore-testing",
      severity: "action",
      finding:
        "No restore testing cadence is mentioned. An untested backup is unproven. Confirm a scheduled clean-room restore drill."
    });
  }

  if (!has("encrypt")) {
    gaps.push({
      area: "encryption",
      severity: "watch",
      finding:
        "No encryption is mentioned. Confirm backups are encrypted at rest and in transit, and that key access is controlled."
    });
  }

  if (!has("retention", "retain", "days", "weeks", "months", "version")) {
    gaps.push({
      area: "retention",
      severity: "watch",
      finding:
        "No retention window is mentioned. Confirm how long backups are kept and that older recovery points exist for delayed-discovery incidents."
    });
  }

  if (!has("alert", "monitor", "notif", "fail")) {
    gaps.push({
      area: "monitoring",
      severity: "watch",
      finding:
        "No failure monitoring is mentioned. Confirm backup job failures and missed runs raise an alert."
    });
  }

  if (!has("rto", "rpo", "recovery time", "recovery point")) {
    gaps.push({
      area: "objectives",
      severity: "info",
      finding:
        "No RTO or RPO target is mentioned. Define recovery time and recovery point objectives so restore tests can be measured against them."
    });
  }

  if (gaps.length === 0) {
    gaps.push({
      area: "coverage",
      severity: "info",
      finding:
        "No obvious gaps were detected in the description. Still run the clean-room restore tests to prove recoverability."
    });
  }

  return gaps;
}
