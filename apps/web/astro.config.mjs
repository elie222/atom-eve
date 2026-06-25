import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Static catalog site for the Atom Eve registry.
// Reads registry data at build time (see src/lib/data.ts) and emits a
// static site to ./dist (index + one page per agent under /agents/<name>/).
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
