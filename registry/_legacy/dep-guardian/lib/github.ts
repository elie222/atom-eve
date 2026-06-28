export type DependencyKind = "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies";

export type RiskLevel = "high" | "medium" | "low";

export interface DependencyFinding {
  name: string;
  kind: DependencyKind;
  versionRange: string;
  risk: RiskLevel;
  reason: string;
}

export interface DependencyUpdateGroup {
  risk: RiskLevel;
  title: string;
  dependencies: string[];
  proposedAction: string;
}

export interface DependencyReview {
  generatedAt: string;
  mode: "read_only_recommendations";
  repo: string;
  ref: string;
  manifestPath: string;
  totalDependencies: number;
  findings: DependencyFinding[];
  proposedUpdateGroups: DependencyUpdateGroup[];
  draftingHint: string;
}

export const reviewDependenciesInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ref: {
      type: "string",
      description: "Branch, tag, or commit SHA to inspect. Defaults to the repository's default branch."
    },
    path: {
      type: "string",
      description: "Path to the package.json manifest in the repo. Defaults to package.json."
    }
  }
} as const;

export interface ReviewDependenciesInput {
  ref?: string;
  path?: string;
}

export function normalizeReviewDependenciesInput(input: unknown): ReviewDependenciesInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Dependency review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.ref !== undefined && typeof value.ref !== "string") {
    throw new Error("ref must be a string.");
  }
  if (value.path !== undefined && typeof value.path !== "string") {
    throw new Error("path must be a string.");
  }

  return {
    ref: value.ref as string | undefined,
    path: value.path as string | undefined
  };
}

const RISK_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };

export async function reviewDependencies(
  input: ReviewDependenciesInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<DependencyReview> {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error("GITHUB_REPO is required (owner/repo).");

  const manifestPath = input.path ?? "package.json";
  const { manifest, ref } = await fetchPackageJson(repo, input.ref, manifestPath, fetchImpl);

  const findings = collectFindings(manifest).sort(
    (a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || a.name.localeCompare(b.name)
  );

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_recommendations",
    repo,
    ref,
    manifestPath,
    totalDependencies: findings.length,
    findings,
    proposedUpdateGroups: groupUpdates(findings),
    draftingHint:
      "Present the flagged dependencies in risk order and propose grouped updates for operator approval. This agent is read-only: it does not open pull requests, change package.json, or run package manager commands. Apply any upgrade yourself after review."
  };
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export async function fetchPackageJson(
  repo: string,
  ref: string | undefined,
  manifestPath: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ manifest: PackageJson; ref: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required.");

  const url = new URL(`https://api.github.com/repos/${repo}/contents/${manifestPath}`);
  if (ref) url.searchParams.set("ref", ref);

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "dep-guardian-agent"
    }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { content?: string; encoding?: string; sha?: string };
  if (typeof payload.content !== "string") {
    throw new Error(`No file content returned for ${manifestPath}.`);
  }

  const decoded = Buffer.from(payload.content, (payload.encoding as BufferEncoding) ?? "base64").toString("utf8");
  let manifest: PackageJson;
  try {
    manifest = JSON.parse(decoded) as PackageJson;
  } catch {
    throw new Error(`Could not parse ${manifestPath} as JSON.`);
  }

  return { manifest, ref: ref ?? "default branch" };
}

const DEPENDENCY_KINDS: DependencyKind[] = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies"
];

export function collectFindings(manifest: PackageJson): DependencyFinding[] {
  const findings: DependencyFinding[] = [];
  for (const kind of DEPENDENCY_KINDS) {
    const entries = manifest[kind];
    if (!entries) continue;
    for (const [name, versionRange] of Object.entries(entries)) {
      const classified = classifyDependency(name, versionRange, kind);
      if (classified) findings.push(classified);
    }
  }
  return findings;
}

export function classifyDependency(
  name: string,
  versionRange: string,
  kind: DependencyKind
): DependencyFinding | null {
  const spec = versionRange.trim();

  if (/^(git\+|github:|git:|https?:|file:|link:|workspace:)/i.test(spec)) {
    return {
      name,
      kind,
      versionRange: spec,
      risk: "high",
      reason:
        "Non-registry source (git/url/file/workspace). It bypasses npm version resolution and is hard to audit for known vulnerabilities."
    };
  }

  if (spec === "" || spec === "*" || spec === "latest" || spec === "x" || /^[xX]\./.test(spec)) {
    return {
      name,
      kind,
      versionRange: spec || "(empty)",
      risk: "high",
      reason: "Unpinned floating range accepts any published version, so installs are non-reproducible and can pull breaking releases."
    };
  }

  if (/^(>=|>|<=|<)/.test(spec) && !/\|\|/.test(spec)) {
    return {
      name,
      kind,
      versionRange: spec,
      risk: "high",
      reason: "Open-ended comparator range can resolve to unexpected major versions on the next install."
    };
  }

  if (/-(alpha|beta|rc|next|canary|dev|pre)/i.test(spec)) {
    return {
      name,
      kind,
      versionRange: spec,
      risk: "medium",
      reason: "Pre-release version is unstable and may change behavior without a stable release."
    };
  }

  if (/^[\^~]?0\./.test(spec)) {
    return {
      name,
      kind,
      versionRange: spec,
      risk: "medium",
      reason: "Pre-1.0 package (0.x) has no SemVer stability guarantee; minor bumps can introduce breaking changes."
    };
  }

  if (/^\d/.test(spec)) {
    return {
      name,
      kind,
      versionRange: spec,
      risk: "low",
      reason: "Exactly pinned version. Stable for reproducibility but will not receive patch or security updates without a manual bump."
    };
  }

  return null;
}

export function groupUpdates(findings: DependencyFinding[]): DependencyUpdateGroup[] {
  const groups: DependencyUpdateGroup[] = [];
  const byRisk: Record<RiskLevel, { title: string; action: string }> = {
    high: {
      title: "High risk: unpinned or non-registry dependencies",
      action:
        "Propose pinning these to an explicit registry version range and re-auditing. Do not change them automatically."
    },
    medium: {
      title: "Medium risk: pre-1.0 or pre-release dependencies",
      action: "Propose reviewing changelogs and moving to a stable release where one exists, after operator approval."
    },
    low: {
      title: "Low risk: exactly pinned dependencies",
      action: "Propose a batched bump to the latest compatible patch/minor to pick up security fixes, pending review."
    }
  };

  for (const risk of ["high", "medium", "low"] as RiskLevel[]) {
    const names = findings.filter((f) => f.risk === risk).map((f) => f.name);
    if (names.length === 0) continue;
    groups.push({
      risk,
      title: byRisk[risk].title,
      dependencies: names,
      proposedAction: byRisk[risk].action
    });
  }

  return groups;
}
