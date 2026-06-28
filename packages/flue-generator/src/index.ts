// eve → flue generator.
//
// eve is the single authored source of truth (an `agent/` folder). Flue is a
// GENERATED, best-effort artifact: this maps the ~80% that translates cleanly to
// flue's `src/**` layout and pushes the rest (host CLI installs, outbound Slack,
// remote skills) into a per-agent FLUE.md checklist.
//
// The rule: every line of generated CODE must typecheck against the real
// `@flue/runtime`. FLUE.md covers only runtime wiring, never broken code. When an
// eve construct can't be generated to typecheck, we generate the safe subset and
// note the gap.

// A single file from an eve agent, addressed relative to the agent's `agent/`
// folder (e.g. "agent.ts", "instructions.md", "sandbox/workspace/setup-gh.sh").
export interface EveAgentFile {
  path: string;
  content: string;
}

export interface RemoteSkillRef {
  ref: string;
}

export interface GenerateFlueAgentInput {
  // Agent slug, e.g. "stripe-pulse". Used for file names and imports.
  name: string;
  // Every file under the eve agent's `agent/` folder.
  files: EveAgentFile[];
  // Remote skills declared in atom.json (resolved from skills.sh by eve at
  // install time). Flue has no equivalent install step, so these become a
  // FLUE.md note rather than vendored files.
  remoteSkills?: RemoteSkillRef[];
}

export interface GenerateFlueAgentResult {
  // Generated flue source tree, keyed by path relative to the flue project root
  // (e.g. "src/agents/stripe-pulse.ts"). FLUE.md is returned separately.
  files: Record<string, string>;
  // Per-agent checklist of runtime wiring the user must finish by hand.
  flueMd: string;
}

interface ScheduleInfo {
  // Source file name without extension, e.g. "weekly-pulse".
  name: string;
  cron: string;
  // Task-mode prompt (`defineSchedule({ cron, markdown })`). Present for the
  // common report agents; absent for the channel-driven `{ cron, run }` form.
  markdown?: string;
}

interface SkillInfo {
  // Skill directory name, e.g. "revenue-pulse".
  dir: string;
  // Generated SKILL.md content (with a guaranteed `name:` frontmatter key).
  content: string;
}

const FLUE_RUNTIME_DEP = "@flue/runtime";

export function generateFlueAgent(input: GenerateFlueAgentInput): GenerateFlueAgentResult {
  const { name } = input;
  const byPath = new Map(input.files.map((file) => [file.path, file.content] as const));

  const instructions = byPath.get("instructions.md");
  if (instructions === undefined) {
    throw new Error(`${name}: eve agent is missing agent/instructions.md`);
  }

  const agentTs = byPath.get("agent.ts");
  if (agentTs === undefined) {
    throw new Error(`${name}: eve agent is missing agent/agent.ts`);
  }

  const hasSandbox = input.files.some((file) => file.path.startsWith("sandbox/"));
  const sandboxClis = collectSandboxClis(input.files);
  const skills = collectSkills(name, input.files);
  const schedules = collectSchedules(input.files);
  const channelFiles = input.files.filter(
    (file) => file.path.startsWith("channels/") && file.path.endsWith(".ts")
  );
  const hasSlackChannel = channelFiles.some((file) => /slack/i.test(file.path));
  const remoteSkills = input.remoteSkills ?? [];

  const model = extractModel(agentTs);

  const files: Record<string, string> = {};

  // instructions.md → src/agents/<name>.md (verbatim) + markdown import.
  files[`src/agents/${name}.md`] = instructions;

  // skills → src/skills/<dir>/SKILL.md (+ guaranteed name: frontmatter).
  for (const skill of skills) {
    files[`src/skills/${skill.dir}/SKILL.md`] = skill.content;
  }

  // agent.ts → src/agents/<name>.ts
  files[`src/agents/${name}.ts`] = renderAgentModule({
    name,
    model,
    hasSandbox,
    skills
  });

  // schedules → workflows + app.ts (only the task-mode `markdown` schedules
  // generate runnable code; channel-driven `run` schedules go to FLUE.md).
  const taskSchedules = schedules.filter((schedule) => schedule.markdown !== undefined);
  for (const schedule of taskSchedules) {
    files[`src/workflows/${schedule.name}.ts`] = renderWorkflowModule({
      name,
      schedule,
      model,
      hasSandbox,
      skills
    });
  }
  if (taskSchedules.length > 0) {
    files["src/app.ts"] = renderAppModule(taskSchedules);
  }

  const flueMd = renderFlueMd({
    name,
    hasSandbox,
    sandboxClis,
    schedules,
    taskSchedules,
    hasSlackChannel,
    skills,
    remoteSkills,
    model
  });

  return { files, flueMd };
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

// Pull the model expression out of `defineAgent({ model: <expr> })`. Carries the
// `process.env.AGENT_MODEL ?? "..."` form across verbatim so flue keeps the same
// env override. eve uses "anthropic/claude-sonnet-4.6"; flue's gateway expects
// the same `provider/model` shape, so no remap is needed.
function extractModel(agentTs: string): string {
  const match = agentTs.match(/model\s*:\s*([^,\n}]+)/);
  if (!match) {
    throw new Error("eve agent.ts has no `model:` field");
  }
  return match[1]!.trim();
}

// Each schedules/*.ts is `defineSchedule({ cron, markdown })` (report agents) or
// `defineSchedule({ cron, run })` (channel agents). Extract the cron and, when
// present, the markdown task prompt.
function collectSchedules(files: EveAgentFile[]): ScheduleInfo[] {
  const schedules: ScheduleInfo[] = [];
  for (const file of files) {
    if (!file.path.startsWith("schedules/") || !file.path.endsWith(".ts")) continue;
    const base = file.path.slice("schedules/".length).replace(/\.ts$/, "");
    const cron = extractStringField(file.content, "cron");
    if (cron === undefined) continue;
    schedules.push({
      name: base,
      cron,
      markdown: extractStringField(file.content, "markdown")
    });
  }
  return schedules.sort((a, b) => a.name.localeCompare(b.name));
}

// Read a `<field>: "..."` (single- or multi-line, single/double/back-quoted)
// string literal from a source file. Returns the decoded JS string value.
function extractStringField(source: string, field: string): string | undefined {
  const re = new RegExp(`${field}\\s*:\\s*(['"\`])`);
  const open = source.match(re);
  if (!open || open.index === undefined) return undefined;
  const quote = open[1]!;
  const start = open.index + open[0].length;
  let out = "";
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i]!;
    if (ch === "\\") {
      const next = source[i + 1];
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next !== undefined) out += next;
      i += 1;
      continue;
    }
    if (ch === quote) return out;
    out += ch;
  }
  return undefined;
}

// Derive the host CLIs to install from the sandbox setup scripts. eve's bootstrap
// runs these in the sandbox; flue's local() does NOT auto-install, so they become
// a FLUE.md checklist. We name them from the `setup-*.sh` file names plus a small
// known mapping for the install commands.
function collectSandboxClis(files: EveAgentFile[]): string[] {
  const clis = new Set<string>();
  for (const file of files) {
    if (!file.path.startsWith("sandbox/workspace/")) continue;
    const base = file.path.split("/").pop() ?? "";
    const setup = base.match(/^setup-(.+)\.sh$/);
    if (setup) {
      clis.add(setup[1]!);
    }
    // setup-clis.sh installs more than one binary; recover them from the content.
    if (base === "setup-clis.sh" || base === "setup-agent-browser.sh") {
      if (/\bstripe\b/.test(file.content)) clis.add("stripe");
      if (/posthog-cli/.test(file.content)) clis.add("posthog-cli");
      if (/agent-browser/.test(file.content)) clis.add("agent-browser");
      if (/\bplaywright\b/.test(file.content)) clis.add("playwright");
      clis.delete("clis");
    }
  }
  return [...clis].sort();
}

// Copy each skill's SKILL.md, guaranteeing a `name:` frontmatter key (flue's
// skill loader requires it; eve derives the name from the directory).
function collectSkills(agentName: string, files: EveAgentFile[]): SkillInfo[] {
  const skills: SkillInfo[] = [];
  for (const file of files) {
    const match = file.path.match(/^skills\/([^/]+)\/SKILL\.md$/);
    if (!match) continue;
    const dir = match[1]!;
    skills.push({ dir, content: ensureSkillName(file.content, dir) });
  }
  return skills.sort((a, b) => a.dir.localeCompare(b.dir));
}

// Frontmatter is `---\n<yaml>\n---`. If it lacks a top-level `name:` key, inject
// one derived from the skill directory.
function ensureSkillName(content: string, dir: string): string {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    return `---\nname: ${dir}\n---\n\n${content}`;
  }
  if (/^name\s*:/m.test(fm[1]!)) return content;
  const body = fm[1]!;
  return content.replace(fm[0], `---\nname: ${dir}\n${body}\n---`);
}

// ---------------------------------------------------------------------------
// Code rendering
// ---------------------------------------------------------------------------

interface AgentRenderInput {
  name: string;
  model: string;
  hasSandbox: boolean;
  skills: SkillInfo[];
}

function renderAgentModule(input: AgentRenderInput): string {
  const { name, model, hasSandbox, skills } = input;
  const lines: string[] = [];
  lines.push(`import { defineAgent, type AgentRouteHandler } from "${FLUE_RUNTIME_DEP}";`);
  if (hasSandbox) {
    lines.push(`import { local } from "${FLUE_RUNTIME_DEP}/node";`);
  }
  lines.push(`import instructions from "./${name}.md" with { type: "markdown" };`);
  for (const skill of skills) {
    lines.push(
      `import ${skillImportId(skill.dir)} from "../skills/${skill.dir}/SKILL.md" with { type: "skill" };`
    );
  }
  lines.push("");
  lines.push("// Authorize direct HTTP access to this agent instance here.");
  lines.push("export const route: AgentRouteHandler = async (_c, next) => next();");
  lines.push("");
  lines.push("export default defineAgent(() => ({");
  lines.push(`  model: ${model},`);
  lines.push("  instructions,");
  if (hasSandbox) {
    lines.push("  sandbox: local(),");
  }
  if (skills.length > 0) {
    lines.push(`  skills: [${skills.map((skill) => skillImportId(skill.dir)).join(", ")}],`);
  }
  lines.push("}));");
  lines.push("");
  return lines.join("\n");
}

interface WorkflowRenderInput {
  name: string;
  schedule: ScheduleInfo;
  model: string;
  hasSandbox: boolean;
  skills: SkillInfo[];
}

function renderWorkflowModule(input: WorkflowRenderInput): string {
  const { name, schedule, model, hasSandbox, skills } = input;
  const prompt = schedule.markdown ?? "";
  const lines: string[] = [];
  lines.push(`import { defineAgent, defineWorkflow } from "${FLUE_RUNTIME_DEP}";`);
  if (hasSandbox) {
    lines.push(`import { local } from "${FLUE_RUNTIME_DEP}/node";`);
  }
  lines.push("import * as v from \"valibot\";");
  lines.push(`import instructions from "../agents/${name}.md" with { type: "markdown" };`);
  for (const skill of skills) {
    lines.push(
      `import ${skillImportId(skill.dir)} from "../skills/${skill.dir}/SKILL.md" with { type: "skill" };`
    );
  }
  lines.push("");
  lines.push("// Finite scheduled operation. eve runs the agent on this prompt at the cron");
  lines.push("// tick (task mode); flue models that as a workflow invoked by cron in app.ts.");
  lines.push("export default defineWorkflow({");
  lines.push("  agent: defineAgent(() => ({");
  lines.push(`    model: ${model},`);
  lines.push("    instructions,");
  if (hasSandbox) {
    lines.push("    sandbox: local(),");
  }
  if (skills.length > 0) {
    lines.push(`    skills: [${skills.map((skill) => skillImportId(skill.dir)).join(", ")}],`);
  }
  lines.push("  })),");
  lines.push("  input: v.object({ scheduledAt: v.optional(v.string()) }),");
  lines.push("  output: v.object({ ok: v.boolean() }),");
  lines.push("  async run({ harness }) {");
  lines.push("    const session = await harness.session();");
  lines.push(`    await session.prompt(${JSON.stringify(prompt)});`);
  lines.push("    return { ok: true };");
  lines.push("  },");
  lines.push("});");
  lines.push("");
  return lines.join("\n");
}

function renderAppModule(schedules: ScheduleInfo[]): string {
  const lines: string[] = [];
  lines.push(`import { invoke } from "${FLUE_RUNTIME_DEP}";`);
  lines.push(`import { flue } from "${FLUE_RUNTIME_DEP}/routing";`);
  lines.push('import { Hono } from "hono";');
  lines.push('import { Cron } from "croner";');
  for (const schedule of schedules) {
    lines.push(`import ${workflowImportId(schedule.name)} from "./workflows/${schedule.name}.ts";`);
  }
  lines.push("");
  lines.push("// Croner runs while this Node process is alive; use a persistent scheduler");
  lines.push("// (e.g. BullMQ) or platform cron for restart-safe production schedules.");
  for (const schedule of schedules) {
    lines.push(`new Cron(`);
    lines.push(`  ${JSON.stringify(schedule.cron)},`);
    lines.push("  {");
    lines.push("    protect: true,");
    lines.push('    timezone: "UTC",');
    lines.push("    catch: (error: unknown) =>");
    lines.push(
      `      console.error("Scheduled ${schedule.name} admission failed", error),`
    );
    lines.push("  },");
    lines.push("  async () => {");
    lines.push(`    await invoke(${workflowImportId(schedule.name)}, {`);
    lines.push("      input: { scheduledAt: new Date().toISOString() },");
    lines.push("    });");
    lines.push("  },");
    lines.push(");");
    lines.push("");
  }
  lines.push("const app = new Hono();");
  lines.push('app.route("/", flue());');
  lines.push("");
  lines.push("export default app;");
  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// FLUE.md
// ---------------------------------------------------------------------------

interface FlueMdInput {
  name: string;
  hasSandbox: boolean;
  sandboxClis: string[];
  schedules: ScheduleInfo[];
  taskSchedules: ScheduleInfo[];
  hasSlackChannel: boolean;
  skills: SkillInfo[];
  remoteSkills: RemoteSkillRef[];
  model: string;
}

function renderFlueMd(input: FlueMdInput): string {
  const { name } = input;
  const out: string[] = [];
  out.push(`# ${name} — finish the flue setup`);
  out.push("");
  out.push(
    "This flue agent was generated from the eve source. The generated code under"
  );
  out.push(
    "`src/**` typechecks against `@flue/runtime`; the items below are runtime wiring"
  );
  out.push("you still need to do by hand.");
  out.push("");

  // Dependencies
  const deps = [FLUE_RUNTIME_DEP];
  if (input.taskSchedules.length > 0) deps.push("croner", "valibot", "hono");
  // The outbound Slack tool snippet (below) is authored in valibot.
  if (input.hasSlackChannel) deps.push("valibot");
  out.push("## Dependencies");
  out.push("");
  out.push("Add to your flue project:");
  out.push("");
  out.push("```bash");
  out.push(`npm install ${[...new Set(deps)].join(" ")}`);
  out.push("```");
  out.push("");

  // Sandbox / host CLIs
  if (input.hasSandbox) {
    out.push("## Host CLIs (sandbox)");
    out.push("");
    out.push(
      "The agent runs on the host via `local()`. Unlike eve's sandbox bootstrap, `local()`"
    );
    out.push(
      "does NOT auto-install CLIs — install these on the host (or in your container image)"
    );
    out.push("and make sure they are on `PATH`:");
    out.push("");
    if (input.sandboxClis.length > 0) {
      for (const cli of input.sandboxClis) {
        out.push(`- \`${cli}\`${cliInstallHint(cli)}`);
      }
    } else {
      out.push("- (see the eve agent's `sandbox/workspace/*.sh` for the exact tools)");
    }
    out.push("");
    out.push(
      "Pass any secrets the CLIs need through `local({ env: { … } })` (it exposes only a"
    );
    out.push("narrow allowlist by default):");
    out.push("");
    out.push("```ts");
    out.push("sandbox: local({ env: { /* e.g. */ STRIPE_API_KEY: process.env.STRIPE_API_KEY } }),");
    out.push("```");
    out.push("");
  }

  // Schedules
  if (input.schedules.length > 0) {
    out.push("## Schedules");
    out.push("");
    if (input.taskSchedules.length > 0) {
      out.push(
        "These crons are generated into `src/app.ts` (Croner) and run while the Node process"
      );
      out.push("is alive. For restart-safe production scheduling, move them to platform cron");
      out.push("(Cloudflare `wrangler.jsonc` + `invoke(...)`) or a persistent queue:");
      out.push("");
      for (const schedule of input.taskSchedules) {
        out.push(`- \`${schedule.name}\`: \`${schedule.cron}\` (UTC)`);
      }
      out.push("");
    }
    const channelSchedules = input.schedules.filter(
      (schedule) => schedule.markdown === undefined
    );
    if (channelSchedules.length > 0) {
      out.push(
        "The following eve schedule(s) hand their result to a channel (`{ cron, run }`),"
      );
      out.push(
        "which flue has no direct equivalent for. Wire them as a cron that invokes a"
      );
      out.push("workflow which posts via your outbound tool (see Channels below):");
      out.push("");
      for (const schedule of channelSchedules) {
        out.push(`- \`${schedule.name}\`: \`${schedule.cron}\` (UTC) → post to the channel`);
      }
      out.push("");
    }
  }

  // Channels
  if (input.hasSlackChannel) {
    out.push("## Slack (channels)");
    out.push("");
    out.push(
      "eve's Slack channel is bidirectional. Flue channels are **inbound-only**, so this"
    );
    out.push("splits into two pieces you must add:");
    out.push("");
    out.push(
      "1. **Inbound** — an `src/channels/slack.ts` exporting a `channel` that verifies the"
    );
    out.push(
      "   Slack signature and `dispatch(...)`es app-mention events to the agent. Set"
    );
    out.push("   `SLACK_SIGNING_SECRET`.");
    out.push(
      "2. **Outbound** — a `post_*` tool the agent calls to post results, since channels"
    );
    out.push("   cannot send. Example `chat.postMessage` tool:");
    out.push("");
    out.push("```ts");
    out.push('import { defineTool } from "@flue/runtime";');
    out.push('import * as v from "valibot";');
    out.push("");
    out.push("export const postToSlackTool = defineTool({");
    out.push('  name: "post_to_slack",');
    out.push('  description: "Post the result to the team Slack channel.",');
    out.push("  input: v.object({ text: v.pipe(v.string(), v.minLength(1)) }),");
    out.push("  async run({ input }) {");
    out.push("    const token = process.env.SLACK_BOT_TOKEN;");
    out.push("    const channel = process.env.SLACK_CHANNEL_ID;");
    out.push("    if (!token || !channel) throw new Error(\"SLACK_BOT_TOKEN and SLACK_CHANNEL_ID are required.\");");
    out.push('    const res = await fetch("https://slack.com/api/chat.postMessage", {');
    out.push('      method: "POST",');
    out.push("      headers: {");
    out.push("        authorization: `Bearer ${token}`,");
    out.push('        "content-type": "application/json; charset=utf-8",');
    out.push("      },");
    out.push("      body: JSON.stringify({ channel, text: input.text }),");
    out.push("    });");
    out.push("    const body = (await res.json()) as { ok: boolean; error?: string };");
    out.push("    if (!body.ok) throw new Error(`Slack post failed: ${body.error}`);");
    out.push("    return { posted: true };");
    out.push("  },");
    out.push("});");
    out.push("```");
    out.push("");
    out.push(
      "Add the tool to the agent's `tools: [...]` and set `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID`."
    );
    out.push("");
  }

  // Remote skills
  if (input.remoteSkills.length > 0) {
    out.push("## Remote skills");
    out.push("");
    out.push(
      "These skills are pulled from skills.sh by eve at install time and are not vendored."
    );
    out.push("Add them to your flue project and import them into the agent's `skills: [...]`:");
    out.push("");
    for (const skill of input.remoteSkills) {
      out.push(`- \`npx skills add ${skill.ref}\``);
    }
    out.push("");
  }

  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function skillImportId(dir: string): string {
  return toCamel(dir) + "Skill";
}

function workflowImportId(name: string): string {
  return toCamel(name) + "Workflow";
}

function toCamel(value: string): string {
  return value.replace(/[-_]+(.)/g, (_, c: string) => c.toUpperCase());
}

function cliInstallHint(cli: string): string {
  const hints: Record<string, string> = {
    stripe: " — Stripe CLI (https://stripe.com/docs/stripe-cli); auth via `STRIPE_API_KEY`",
    "posthog-cli": " — `npm install -g @posthog/cli`; auth via `POSTHOG_CLI_API_KEY` + `POSTHOG_CLI_PROJECT_ID`",
    "agent-browser": " — `npm install -g agent-browser playwright` + a Chromium",
    playwright: " — `npx playwright install --with-deps chromium`",
    gh: " — GitHub CLI (https://cli.github.com); auth via `GH_TOKEN`"
  };
  return hints[cli] ?? "";
}
