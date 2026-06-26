import { z } from "zod";

export const targetSchema = z.enum(["eve", "flue"]);
export type Target = z.infer<typeof targetSchema>;

export const runtimeSchema = z.enum(["vercel", "node", "cloudflare"]);
export type Runtime = z.infer<typeof runtimeSchema>;

export const connectionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["mcp", "openapi", "custom-tool", "platform"]),
  auth: z.enum(["none", "env", "vercel-connect", "oauth", "platform"])
}).strict();
export type AtomConnection = z.infer<typeof connectionSchema>;

// A remote skill the agent depends on but does not vendor. Resolved from skills.sh
// at install time and written into the framework's skills dir, so a shared skill
// (e.g. a marketing playbook) lives once at its source and is referenced by many agents.
// `ref` is the skills.sh install id, e.g. "coreyhaines31/marketingskills@copywriting"
// (owner/repo, optionally @skill to pick one skill from a multi-skill repo).
export const remoteSkillSchema = z.object({
  ref: z.string().regex(/^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)+(?:@[a-z0-9][a-z0-9._-]*)?$/i)
}).strict();
export type RemoteSkill = z.infer<typeof remoteSkillSchema>;

export const atomSchema = z.object({
  $schema: z.string().url().optional(),
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  family: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    handle: z.string().optional(),
    url: z.string().url().optional()
  }).strict().optional(),
  version: z.string().min(1).default("0.1.0"),
  targets: z.array(targetSchema).min(1),
  integrations: z.array(z.string()).default([]),
  connections: z.array(connectionSchema).default([]),
  requiredEnv: z.array(z.string().regex(/^[A-Z][A-Z0-9_]*$/)).default([]),
  // Owned skills live as files under shared/skills/ and are copied on install.
  // This array declares remote skills pulled from skills.sh at install time instead.
  skills: z.array(remoteSkillSchema).default([])
}).strict();
export type AtomManifest = z.infer<typeof atomSchema>;

export const atomEveConfigSchema = z.object({
  $schema: z.string().url().optional(),
  target: targetSchema,
  runtime: runtimeSchema.optional(),
  sourceRoot: z.string().default("src"),
  registry: z.string().default("elie222/atom-eve")
}).strict();
export type AtomEveConfig = z.infer<typeof atomEveConfigSchema>;

export const catalogConfigSchema = z.object({
  featured: z.array(z.string()).default([]),
  homepageOrder: z.array(z.string()).default([])
}).strict();
export type CatalogConfig = z.infer<typeof catalogConfigSchema>;

export const taxonomySchema = z.object({
  families: z.array(z.string()).min(1),
  categories: z.array(
    z.object({
      id: z.string().min(1),
      family: z.string().min(1),
      label: z.string().min(1)
    }).strict()
  )
}).strict();
export type Taxonomy = z.infer<typeof taxonomySchema>;
