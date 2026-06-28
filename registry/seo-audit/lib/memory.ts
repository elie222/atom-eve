export type AgentMemoryProvider = "files" | "vercel-blob" | "cloudflare-r2" | "custom-blob";

export interface AgentMemoryObject {
  key: string;
  size?: number;
  updatedAt?: string;
}

export interface AgentMemoryListOptions {
  limit?: number;
  cursor?: string;
}

export interface AgentMemoryListResult {
  objects: AgentMemoryObject[];
  cursor?: string;
  hasMore: boolean;
}

export interface AgentBlobClient {
  readText(key: string): Promise<string | null>;
  writeText(key: string, value: string, options?: { contentType?: string }): Promise<void>;
  list(prefix: string, options?: AgentMemoryListOptions): Promise<AgentMemoryListResult>;
  delete?(key: string): Promise<void>;
}

export interface AgentMemoryStore {
  readText(path: string): Promise<string | null>;
  writeText(path: string, value: string, options?: { contentType?: string }): Promise<void>;
  readJson<T>(path: string): Promise<T | null>;
  writeJson(path: string, value: unknown): Promise<void>;
  list(pathPrefix?: string, options?: AgentMemoryListOptions): Promise<AgentMemoryListResult>;
  delete?(path: string): Promise<void>;
  key(path: string): string;
}

export interface AgentMemoryStoreOptions {
  client: AgentBlobClient;
  basePrefix: string;
}

export function createAgentMemoryStore({ client, basePrefix }: AgentMemoryStoreOptions): AgentMemoryStore {
  const normalizedBasePrefix = normalizePrefix(basePrefix);

  return {
    async readText(path: string) {
      return client.readText(joinMemoryPath(normalizedBasePrefix, path));
    },
    async writeText(path: string, value: string, options?: { contentType?: string }) {
      await client.writeText(joinMemoryPath(normalizedBasePrefix, path), value, options);
    },
    async readJson<T>(path: string) {
      const value = await client.readText(joinMemoryPath(normalizedBasePrefix, path));
      if (value === null) return null;
      return JSON.parse(value) as T;
    },
    async writeJson(path: string, value: unknown) {
      await client.writeText(joinMemoryPath(normalizedBasePrefix, path), `${JSON.stringify(value, null, 2)}\n`, {
        contentType: "application/json"
      });
    },
    async list(pathPrefix = "", options?: AgentMemoryListOptions) {
      return client.list(joinMemoryPath(normalizedBasePrefix, pathPrefix), options);
    },
    async delete(path: string) {
      if (!client.delete) return;
      await client.delete(joinMemoryPath(normalizedBasePrefix, path));
    },
    key(path: string) {
      return joinMemoryPath(normalizedBasePrefix, path);
    }
  };
}

export function normalizeMemorySegment(value: string, fallback = "default"): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return normalized || fallback;
}

export function buildAgentMemoryPrefix(parts: string[]): string {
  return parts.map((part) => normalizeMemorySegment(part)).filter(Boolean).join("/");
}

export function normalizePrefix(prefix: string): string {
  return prefix.replace(/^\/+|\/+$/g, "");
}

export function joinMemoryPath(...parts: string[]): string {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

export interface R2LikeObjectBody {
  text(): Promise<string>;
}

export interface R2LikeListedObject {
  key: string;
  size?: number;
  uploaded?: Date | string;
}

export interface R2LikeBucket {
  get(key: string): Promise<R2LikeObjectBody | null>;
  put(key: string, value: string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    objects: R2LikeListedObject[];
    cursor?: string;
    truncated?: boolean;
  }>;
  delete?(key: string): Promise<unknown>;
}

export function createR2BlobClient(bucket: R2LikeBucket): AgentBlobClient {
  return {
    async readText(key) {
      const object = await bucket.get(key);
      return object ? object.text() : null;
    },
    async writeText(key, value, options) {
      await bucket.put(key, value, { httpMetadata: { contentType: options?.contentType } });
    },
    async list(prefix, options) {
      const result = await bucket.list({ prefix, limit: options?.limit, cursor: options?.cursor });
      return {
        objects: result.objects.map((object) => ({
          key: object.key,
          size: object.size,
          updatedAt: object.uploaded instanceof Date ? object.uploaded.toISOString() : object.uploaded
        })),
        cursor: result.cursor,
        hasMore: result.truncated === true
      };
    },
    async delete(key) {
      if (!bucket.delete) return;
      await bucket.delete(key);
    }
  };
}

export interface VercelBlobLikeClient {
  getText(pathname: string): Promise<string | null>;
  put(
    pathname: string,
    body: string,
    options: { access: "private" | "public"; allowOverwrite: true; contentType?: string }
  ): Promise<unknown>;
  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    blobs: Array<{
      pathname: string;
      size?: number;
      uploadedAt?: Date | string;
    }>;
    cursor?: string;
    hasMore: boolean;
  }>;
  del?(pathname: string): Promise<void>;
}

export function createVercelBlobClient(
  client: VercelBlobLikeClient,
  options: { access?: "private" | "public" } = {}
): AgentBlobClient {
  const access = options.access ?? "private";

  return {
    async readText(key) {
      return client.getText(key);
    },
    async writeText(key, value, writeOptions) {
      await client.put(key, value, {
        access,
        allowOverwrite: true,
        contentType: writeOptions?.contentType
      });
    },
    async list(prefix, listOptions) {
      const result = await client.list({ prefix, limit: listOptions?.limit, cursor: listOptions?.cursor });
      return {
        objects: result.blobs.map((blob) => ({
          key: blob.pathname,
          size: blob.size,
          updatedAt: blob.uploadedAt instanceof Date ? blob.uploadedAt.toISOString() : blob.uploadedAt
        })),
        cursor: result.cursor,
        hasMore: result.hasMore
      };
    },
    async delete(key) {
      if (!client.del) return;
      await client.del(key);
    }
  };
}
