import assert from "node:assert/strict";
import { test } from "node:test";
import { generateFlueAgent, type EveAgentFile } from "./index.js";

const AGENT_TS = `import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
});
`;

test("maps instructions, agent.ts, sandbox and a markdown schedule", () => {
  const files: EveAgentFile[] = [
    { path: "agent.ts", content: AGENT_TS },
    { path: "instructions.md", content: "# Hello\nDo the thing." },
    { path: "sandbox/sandbox.ts", content: "export default {}" },
    {
      path: "sandbox/workspace/setup-posthog-cli.sh",
      content: "#!/usr/bin/env bash\nnpm install -g @posthog/cli\n"
    },
    {
      path: "schedules/weekly.ts",
      content:
        'import { defineSchedule } from "eve/schedules";\nexport default defineSchedule({\n  cron: "0 9 * * 1",\n  markdown: "Write the weekly digest.",\n});\n'
    }
  ];

  const { files: out, flueMd } = generateFlueAgent({ name: "analytics-digest", files });

  assert.equal(out["src/agents/analytics-digest.md"], "# Hello\nDo the thing.");

  const agent = out["src/agents/analytics-digest.ts"]!;
  assert.match(agent, /import instructions from ".\/analytics-digest.md" with \{ type: "markdown" \}/);
  assert.match(agent, /import \{ local \} from "@flue\/runtime\/node"/);
  assert.match(agent, /model: process\.env\.AGENT_MODEL \?\? "anthropic\/claude-sonnet-4\.6"/);
  assert.match(agent, /sandbox: local\(\)/);

  const workflow = out["src/workflows/weekly.ts"]!;
  assert.match(workflow, /defineWorkflow/);
  assert.match(workflow, /Write the weekly digest\./);

  const app = out["src/app.ts"]!;
  assert.match(app, /new Cron\(\s*"0 9 \* \* 1"/);
  assert.match(app, /invoke\(weeklyWorkflow/);

  assert.match(flueMd, /Host CLIs/);
  assert.match(flueMd, /posthog-cli/);
});

test("no-sandbox agent omits local() and emits no CLI section", () => {
  const files: EveAgentFile[] = [
    { path: "agent.ts", content: AGENT_TS },
    { path: "instructions.md", content: "Research." }
  ];
  const { files: out, flueMd } = generateFlueAgent({ name: "research-assistant", files });
  assert.doesNotMatch(out["src/agents/research-assistant.ts"]!, /local\(\)/);
  assert.doesNotMatch(flueMd, /Host CLIs/);
});

test("skill gets name frontmatter and is imported", () => {
  const files: EveAgentFile[] = [
    { path: "agent.ts", content: AGENT_TS },
    { path: "instructions.md", content: "x" },
    {
      path: "skills/revenue-pulse/SKILL.md",
      content: "---\ndescription: pulse\n---\n\n# Pulse"
    }
  ];
  const { files: out } = generateFlueAgent({ name: "stripe-pulse", files });
  const skill = out["src/skills/revenue-pulse/SKILL.md"]!;
  assert.match(skill, /name: revenue-pulse/);
  assert.match(out["src/agents/stripe-pulse.ts"]!, /with \{ type: "skill" \}/);
  assert.match(out["src/agents/stripe-pulse.ts"]!, /skills: \[revenuePulseSkill\]/);
});

test("slack channel and remote skills surface in FLUE.md only", () => {
  const files: EveAgentFile[] = [
    { path: "agent.ts", content: AGENT_TS },
    { path: "instructions.md", content: "x" },
    { path: "channels/slack.ts", content: "export default {}" }
  ];
  const { files: out, flueMd } = generateFlueAgent({
    name: "stripe-pulse",
    files,
    remoteSkills: [{ ref: "vercel-labs/agent-browser@agent-browser" }]
  });
  assert.equal(out["src/channels/slack.ts"], undefined);
  assert.match(flueMd, /Slack \(channels\)/);
  assert.match(flueMd, /post_to_slack/);
  assert.match(flueMd, /npx skills add vercel-labs\/agent-browser@agent-browser/);
});
