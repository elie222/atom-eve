import { createSign } from "node:crypto";

import { defineOpenAPIConnection } from "eve/connections";

// Google Search Console is the primary source: real first-party clicks, impressions,
// CTR, and average position for the site's own pages. It ships no hosted MCP and a
// Google Discovery doc rather than OpenAPI, so we pin a minimal OpenAPI 3.0 contract
// for the one read operation the agent needs (plus sites.list) and let eve derive the
// tools from it.
//
// Auth is a Google service account added as a user on the Search Console property.
// getToken signs a JWT with the service account key and exchanges it for a short-lived
// read-only access token; eve sends that as a Bearer token, so the credentials never
// reach model context. Minting the token with node:crypto keeps this dependency-free.
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

async function serviceAccountToken(): Promise<string> {
  const raw = process.env.GSC_CREDENTIALS_JSON;
  if (!raw) throw new Error("GSC_CREDENTIALS_JSON is not set");
  const { client_email, private_key } = JSON.parse(raw) as {
    client_email: string;
    private_key: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({ iss: client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  ).toString("base64url");
  const signingInput = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(private_key, "base64url");
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Search Console token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Search Console token exchange returned no access_token");
  return data.access_token;
}

export default defineOpenAPIConnection({
  baseUrl: "https://searchconsole.googleapis.com",
  description:
    "Google Search Console Search Analytics: the site's own real clicks, impressions, CTR, and average position by query, page, country, device, and date. First-party ground truth for striking-distance, low-CTR, cannibalization, and decay analysis.",
  auth: {
    getToken: async () => ({ token: await serviceAccountToken() }),
  },
  spec: {
    openapi: "3.0.3",
    info: { title: "Search Console API", version: "v3" },
    paths: {
      "/webmasters/v3/sites/{siteUrl}/searchAnalytics/query": {
        post: {
          operationId: "searchAnalyticsQuery",
          summary:
            "Query Search Analytics for the property: clicks, impressions, CTR, and position by the requested dimensions.",
          parameters: [
            {
              name: "siteUrl",
              in: "path",
              required: true,
              description:
                "The property, e.g. `sc-domain:example.com` or `https://www.example.com/`.",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["startDate", "endDate"],
                  properties: {
                    startDate: { type: "string", description: "YYYY-MM-DD (inclusive)." },
                    endDate: { type: "string", description: "YYYY-MM-DD (inclusive)." },
                    dimensions: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: ["query", "page", "country", "device", "date", "searchAppearance"],
                      },
                    },
                    type: {
                      type: "string",
                      enum: ["web", "image", "video", "news", "discover", "googleNews"],
                    },
                    dataState: { type: "string", enum: ["final", "all"] },
                    rowLimit: { type: "integer", description: "Max rows, up to 25000." },
                    startRow: { type: "integer", description: "Zero-based row offset for paging." },
                    dimensionFilterGroups: {
                      type: "array",
                      items: { type: "object", additionalProperties: true },
                    },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Search analytics rows." } },
        },
      },
      "/webmasters/v3/sites": {
        get: {
          operationId: "listSites",
          summary: "List the properties the service account can access.",
          responses: { "200": { description: "Sites list." } },
        },
      },
    },
  },
});
