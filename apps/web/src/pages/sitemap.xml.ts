import type { APIRoute } from "astro";
import { getItems } from "../lib/data";

// Static sitemap at https://atomeve.dev/sitemap.xml — the home page plus one
// entry per agent under /agents/<name>/. Kept dependency-free (no sitemap
// integration) so it stays in lockstep with the registry data the site is
// built from (see src/lib/data.ts).
export const prerender = true;

const SITE = "https://atomeve.dev";

export const GET: APIRoute = () => {
  const urls = [
    { loc: `${SITE}/`, priority: "1.0" },
    ...getItems().map((item) => ({
      loc: `${SITE}/agents/${item.name}/`,
      priority: "0.8",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority }) =>
      `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
