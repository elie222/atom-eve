export interface ComplianceCheck {
  category: string;
  whatToScan: string;
  detectionHint: string;
  severity: "info" | "watch" | "action";
}

export interface ComplianceGuard {
  guard: string;
  rationale: string;
}

export interface ComplianceScanPlan {
  generatedAt: string;
  mode: "read_only_draft";
  scope: string;
  environment: string;
  checks: ComplianceCheck[];
  guards: ComplianceGuard[];
  draftingHint: string;
}

export const planComplianceScanInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    scope: {
      type: "string",
      description:
        "Description of the data store, dataset, or policy to scan for disallowed or PII data. Defaults to the project's primary production data store."
    },
    environment: {
      type: "string",
      description: "Environment to scan. Defaults to production."
    }
  }
} as const;

export interface PlanComplianceScanInput {
  scope?: string;
  environment?: string;
}

export function normalizePlanComplianceScanInput(input: unknown): PlanComplianceScanInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Compliance scan input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.scope !== undefined && typeof value.scope !== "string") {
    throw new Error("scope must be a string.");
  }
  if (value.environment !== undefined && typeof value.environment !== "string") {
    throw new Error("environment must be a string.");
  }

  return {
    scope: value.scope as string | undefined,
    environment: value.environment as string | undefined
  };
}

// Pure, network-free planner. This tool drafts a read-only scan for disallowed/PII production data
// and the guards to prevent recurrence. It never connects to a data store and never deletes or
// modifies any data; the operator runs the drafted scan and remediation themselves.
export function planComplianceScan(input: PlanComplianceScanInput = {}): ComplianceScanPlan {
  const scope = input.scope?.trim() || "the project's primary production data store";
  const environment = input.environment?.trim() || "production";

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    scope,
    environment,
    checks: suggestChecks(scope),
    guards: suggestGuards(),
    draftingHint:
      "Run the drafted checks as read-only queries or scans and report matches as findings for operator review. Do not delete, redact, or modify any production data automatically; propose remediation and the preventive guards for explicit operator approval."
  };
}

function suggestChecks(scope: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [
    {
      category: "Direct identifiers (PII)",
      whatToScan: "Columns, documents, and log lines that may hold emails, full names, or phone numbers.",
      detectionHint: "Match email patterns, phone patterns, and free-text name fields not flagged as identity data.",
      severity: "action"
    },
    {
      category: "Government identifiers",
      whatToScan: "Fields that could store national IDs, SSNs, passport, or tax numbers.",
      detectionHint: "Scan for SSN-shaped and national-ID-shaped values; these are rarely required in production stores.",
      severity: "action"
    },
    {
      category: "Authentication secrets",
      whatToScan: "Plaintext passwords, API keys, access tokens, or private keys stored in tables, configs, or logs.",
      detectionHint: "Match high-entropy strings, known key prefixes, and password columns that are not one-way hashed.",
      severity: "action"
    },
    {
      category: "Free-text leakage",
      whatToScan: "Notes, comments, description, and unstructured log columns that may embed PII.",
      detectionHint: "Sample records and pattern-match identifiers inside otherwise-untyped text fields.",
      severity: "watch"
    },
    {
      category: "Test and seed data in production",
      whatToScan: "Synthetic, fixture, or QA records that should not live alongside real customer data.",
      detectionHint: "Look for known test domains, placeholder values, and seeded fixture markers.",
      severity: "watch"
    }
  ];

  const text = scope.toLowerCase();
  if (/(payment|card|stripe|pci|pan|cvv)/.test(text)) {
    checks.push({
      category: "Cardholder data (PCI scope)",
      whatToScan: "Primary account numbers (PAN), CVV/CVC, or full magnetic-stripe data.",
      detectionHint: "Match PAN-shaped numbers passing a Luhn check; CVV must never be stored at rest.",
      severity: "action"
    });
  }
  if (/(health|phi|medical|patient|hipaa)/.test(text)) {
    checks.push({
      category: "Protected health information (PHI)",
      whatToScan: "Diagnoses, treatments, or identifiers tying a person to a health record.",
      detectionHint: "Flag health-context fields lacking access controls or minimization.",
      severity: "action"
    });
  }
  if (/(child|minor|kid|coppa)/.test(text)) {
    checks.push({
      category: "Data on minors",
      whatToScan: "Records that may belong to children or lack verified-age handling.",
      detectionHint: "Flag age/birthdate fields and any data implying users under the consent age.",
      severity: "action"
    });
  }

  return checks;
}

function suggestGuards(): ComplianceGuard[] {
  return [
    {
      guard: "Add CI secret scanning and pre-commit hooks.",
      rationale: "Stops keys, tokens, and credentials from reaching production stores and logs in the first place."
    },
    {
      guard: "Classify columns and apply field-level masking or tokenization for sensitive data.",
      rationale: "Keeps PII unreadable at rest so an exposure does not become a breach."
    },
    {
      guard: "Enforce least-privilege roles and audit logging on production data access.",
      rationale: "Limits who can read raw records and makes recurrence detectable."
    },
    {
      guard: "Add automated PII detection to the data pipeline and a pre-deploy lint gate.",
      rationale: "Catches disallowed data before it lands, instead of only finding it after the fact."
    },
    {
      guard: "Keep test and seed data out of production with environment-scoped fixtures.",
      rationale: "Prevents synthetic and QA records from polluting the real dataset."
    }
  ];
}
