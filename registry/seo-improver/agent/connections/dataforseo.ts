import { defineMcpClientConnection } from "eve/connections";

// DataForSEO ships a hosted MCP server, so the agent talks to it through a
// connection instead of a hand-rolled HTTP client.
//
// DataForSEO uses HTTP Basic auth (login:password), not a Bearer token. The
// `auth` field (and Vercel Connect via `@vercel/connect/eve`) only emits
// `Authorization: Bearer <token>`, so it can't express Basic auth. Instead we
// build the `Authorization: Basic ...` header ourselves and read the static
// credentials from env. This header callback runs at the connection layer at
// runtime on every target (eve and flue), and eve proxies the MCP calls with
// it injected, so the model never sees the credentials. Env is the real source
// for these static secrets here, not a flue-only fallback; `requiredEnv` in
// atom.json just declares them so the installer prompts for them.
export default defineMcpClientConnection({
  url: "https://mcp.dataforseo.com/mcp",
  description:
    "DataForSEO rankings data: live SERP results by keyword/location, the domain's ranked keywords with position and search volume, and week-over-week position tracking for striking-distance and lost-position analysis.",
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${process.env.DATAFORSEO_LOGIN ?? ""}:${process.env.DATAFORSEO_PASSWORD ?? ""}`,
    ).toString("base64")}`,
  },
});
