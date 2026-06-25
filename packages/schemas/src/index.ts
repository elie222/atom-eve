import { z } from "zod";

export const targetSchema = z.enum(["eve", "flue"]);
export type Target = z.infer<typeof targetSchema>;

export const runtimeSchema = z.enum(["vercel", "node", "cloudflare"]);
export type Runtime = z.infer<typeof runtimeSchema>;

export const connectionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["mcp", "openapi", "custom-tool", "platform"]),
  auth: z.enum(["none", "env", "vercel-connect", "oauth", "platform"])
});
export type AtomConnection = z.infer<typeof connectionSchema>;

export const scheduleSchema = z.object({
  label: z.string().min(1),
  cron: z.string().min(1),
  timezone: z.string().min(1).default("UTC"),
  intent: z.enum(["recurring-job", "continuing-agent"]).default("recurring-job")
});
export type AtomSchedule = z.infer<typeof scheduleSchema>;

export const atomSchema = z.object({
  $schema: z.string().url().optional(),
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  taskSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  descriptor: z.string().min(1),
  category: z.string().min(1),
  family: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    handle: z.string().optional(),
    url: z.string().url().optional()
  }),
  version: z.string().min(1),
  targets: z.array(targetSchema).min(1),
  runtimes: z.record(z.array(runtimeSchema)).optional(),
  integrations: z.array(z.string()).default([]),
  connections: z.array(connectionSchema).default([]),
  requiredEnv: z.array(z.string().regex(/^[A-Z][A-Z0-9_]*$/)).default([]),
  schedule: scheduleSchema.nullable().default(null),
  shared: z.object({
    instructions: z.string().optional(),
    skills: z.array(z.string()).default([]),
    lib: z.array(z.string()).default([])
  }),
  entrypoints: z.object({
    eve: z.string().optional(),
    flue: z.string().optional()
  }),
  repoPath: z.string().min(1)
});
export type AtomManifest = z.infer<typeof atomSchema>;

export const atomEveConfigSchema = z.object({
  $schema: z.string().url().optional(),
  target: targetSchema,
  runtime: runtimeSchema.optional(),
  sourceRoot: z.string().default("src"),
  registry: z.string().default("atomeve/agents")
});
export type AtomEveConfig = z.infer<typeof atomEveConfigSchema>;

export const taxonomySchema = z.object({
  families: z.array(z.string()).min(1),
  categories: z.array(
    z.object({
      id: z.string().min(1),
      family: z.string().min(1),
      label: z.string().min(1)
    })
  )
});
export type Taxonomy = z.infer<typeof taxonomySchema>;
