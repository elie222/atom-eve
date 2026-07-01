import type { APIRoute } from "astro";
import { getItems } from "../lib/data";

// Serves the machine-readable catalog at https://www.atomeve.dev/index.json.
// Same data the site is built from (see src/lib/data.ts), exposed as a static
// JSON endpoint so humans and AI agents can discover installable agents and
// external examples, their targets, and their requiredEnv without scraping the HTML.
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify({ items: getItems() }, null, 2)}\n`, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
