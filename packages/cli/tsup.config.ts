import { defineConfig } from "tsup";

// Bundle the CLI into a single self-contained ESM file so the published npm
// package has zero runtime dependencies — the internal @atom-eve/* workspace
// packages are inlined rather than shipped as separate published packages.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  platform: "node",
  noExternal: [/^@atom-eve\//],
  // src/index.ts already starts with a shebang, which esbuild preserves — no banner needed.
  clean: true,
  dts: false,
});
