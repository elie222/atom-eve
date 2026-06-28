import { del, get, list, put } from "@vercel/blob";
import { createVercelBlobClient } from "./memory.js";
import { createSeoAuditMemoryStore } from "./seo-memory.js";

export function createVercelSeoAuditMemoryStore(siteUrl: string) {
  return createSeoAuditMemoryStore({
    client: createVercelBlobClient({
      async getText(pathname) {
        const result = await get(pathname, { access: "private" });
        if (!result || result.statusCode === 304 || !result.stream) return null;
        return new Response(result.stream).text();
      },
      put,
      list,
      del
    }),
    siteUrl
  });
}
