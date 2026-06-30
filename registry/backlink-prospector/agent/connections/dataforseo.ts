import { defineMcpClientConnection } from "eve/connections";

// DataForSEO ships a hosted MCP server, so the agent talks to it through a
// connection instead of a hand-rolled HTTP client. Basic auth is read from the
// sandbox env and brokered by eve, so the model never sees the credentials.
export default defineMcpClientConnection({
  url: "https://mcp.dataforseo.com/mcp",
  description:
    "DataForSEO backlinks data: referring domains, backlinks, and domain intersection (domains that link to one set of sites but not another).",
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${process.env.DATAFORSEO_LOGIN ?? ""}:${process.env.DATAFORSEO_PASSWORD ?? ""}`,
    ).toString("base64")}`,
  },
});
