import type { APIRoute, GetStaticPaths } from "astro";
import { getRegistryPayloads } from "../../lib/data";

// Serves the content-resolved shadcn payloads at https://www.atomeve.dev/r/<name>.json
// (e.g. /r/eve/website-qa.json). This is what a hosted shadcn namespace resolves
// against, so the registry can be added to the shadcn directory as @atom-eve and
// installed with `npx shadcn add @atom-eve/eve/website-qa`.
export const prerender = true;

export const getStaticPaths: GetStaticPaths = () =>
  getRegistryPayloads().map((payload) => ({
    params: { item: payload.name },
    props: { json: payload.json },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(props.json as string, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
