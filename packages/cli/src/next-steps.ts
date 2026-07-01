import { bold, cyan, dim, green } from "./style.js";
import type { AtomEveConfig, AtomManifest } from "./types.js";

interface NextStepsOptions {
  title?: string;
  appDir?: string;
  vercel?: boolean;
  dev?: string;
  suggestAdd?: boolean;
  slack?: boolean;
  requiredEnv?: readonly string[];
  docsUrl?: string;
}

// The generic Slack usage hint — every eve install ships a bidirectional Slack
// channel, so the app can be @mentioned to run on demand. The name is chosen by
// the user in Vercel Connect, so we show the format, not a literal handle.
const SLACK_USAGE_LINES = [
  "Run it anytime: @mention your app (the name you gave it in Vercel Connect)",
  '                e.g. "@your-app audit example.com and summarize"'
];
const NEXT_STEP_NOTE_COLUMN = 33;

export function printNextSteps(options: NextStepsOptions) {
  console.log("");
  console.log(`${green("✓")} ${bold(options.title ? `Installed ${options.title}` : "Project ready")}`);

  console.log("");
  console.log(bold("Next steps"));
  if (options.appDir) console.log(`  ${cyan(`cd ${options.appDir}`)}`);
  if (options.suggestAdd) printNextStep("npx atom-eve add <agent>", "browse atomeve.dev");
  if (options.vercel) printNextStep("vercel link && vercel env pull", "auth for the AI Gateway + Slack (OIDC token)");
  if (options.dev) printNextStep(options.dev, "run it locally");

  const env = options.requiredEnv ?? [];
  const slackEnv = options.slack ? env.filter((name) => name.startsWith("SLACK_")) : [];
  const otherEnv = options.slack ? env.filter((name) => !name.startsWith("SLACK_")) : env;

  if (options.slack) {
    console.log("");
    console.log(bold("Slack"));
    for (const line of SLACK_USAGE_LINES) console.log(`  ${line}`);
    for (const name of slackEnv) printEnvGuide(name);
  }

  if (otherEnv.length) {
    console.log("");
    console.log(bold("Configure"));
    for (const name of otherEnv) printEnvGuide(name);
  }

  if (options.docsUrl) {
    console.log("");
    console.log(`  ${dim(options.docsUrl)}`);
  }
}

// `slack` reflects whether the install added the bidirectional Slack channel; the
// caller computes it (from install options) so this module stays install-agnostic.
export function printPostInstallNextSteps(manifest: AtomManifest, config: AtomEveConfig, slack: boolean) {
  const createAppDir = process.env.ATOM_EVE_CREATE_CD?.trim() || undefined;
  const isEve = config.target === "eve";
  printNextSteps({
    title: manifest.title ?? manifest.name,
    appDir: createAppDir,
    vercel: isEve && createAppDir !== undefined,
    dev: isEve ? "npx eve dev" : undefined,
    slack: isEve && slack,
    requiredEnv: manifest.requiredEnv,
    docsUrl: agentDocsUrl(manifest)
  });
}

function printNextStep(command: string, note: string) {
  const pad = Math.max(2, NEXT_STEP_NOTE_COLUMN - command.length);
  console.log(`  ${cyan(command)}${" ".repeat(pad)}${dim(note)}`);
}

// Guidance is derived from the var name so shared env vars (a Slack channel ID lives
// in many agents) don't repeat the same copy in every atom.json. Multi-line hints
// bake in their own continuation indent; each line prints at the base indent.
function printEnvGuide(name: string) {
  for (const line of envGuidance(name).split("\n")) console.log(`  ${line}`);
}

function envGuidance(name: string): string {
  if (/^SLACK_.*CHANNEL_ID$/.test(name)) {
    return `Slack channel to post to: set ${name} to the channel's ID\n  (in Slack: open the channel → click its name → copy Channel ID)`;
  }
  return `set ${name}`;
}

function agentDocsUrl(manifest: Pick<AtomManifest, "name">): string {
  return `https://www.atomeve.dev/agents/${manifest.name}`;
}
