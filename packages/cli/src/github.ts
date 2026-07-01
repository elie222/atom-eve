import path from "node:path";
import { toPosixPath } from "./paths.js";
import type { AtomEveConfig } from "./types.js";

interface GitHubContentEntry {
  path: string;
  type: "file" | "dir" | string;
}

interface GitHubRequest {
  source: "contents" | "raw";
  accept: string;
  timeoutMs: number;
  allowNotFound?: boolean;
}

export async function remoteFileExists(config: AtomEveConfig, repoFilePath: string): Promise<boolean> {
  const response = await requestGitHub(config, repoFilePath, {
    source: "contents",
    accept: "application/vnd.github+json",
    timeoutMs: 5000,
    allowNotFound: true
  });
  if (!response) return false;
  const data = (await response.json()) as GitHubContentEntry | GitHubContentEntry[];
  return !Array.isArray(data) && data.type === "file";
}

export async function discoverRemoteFiles(config: AtomEveConfig, repoPath: string, sourceDir: string): Promise<string[]> {
  const root = `${repoPath}/${sourceDir}`;
  const response = await requestGitHub(config, root, {
    source: "contents",
    accept: "application/vnd.github+json",
    timeoutMs: 5000,
    allowNotFound: true
  });
  if (!response) return [];

  const data = (await response.json()) as GitHubContentEntry | GitHubContentEntry[];
  if (!Array.isArray(data)) return data.type === "file" ? [toPosixPath(path.posix.relative(repoPath, data.path))] : [];

  const files: string[] = [];
  for (const entry of data) {
    if (entry.type === "file") {
      files.push(toPosixPath(path.posix.relative(repoPath, entry.path)));
    } else if (entry.type === "dir") {
      files.push(...(await discoverRemoteFiles(config, repoPath, path.posix.relative(repoPath, entry.path))));
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

export async function fetchGitHubJson(config: AtomEveConfig, repoFilePath: string): Promise<unknown> {
  const response = await requestGitHub(config, repoFilePath, {
    source: "raw",
    accept: "application/json",
    timeoutMs: 10000
  });
  return response.json();
}

export async function fetchGitHubRaw(config: AtomEveConfig, repoFilePath: string): Promise<string> {
  const response = await requestGitHub(config, repoFilePath, {
    source: "raw",
    accept: "text/plain",
    timeoutMs: 10000
  });
  return response.text();
}

async function requestGitHub(
  config: AtomEveConfig,
  repoFilePath: string,
  request: GitHubRequest & { allowNotFound: true }
): Promise<Response | undefined>;
async function requestGitHub(config: AtomEveConfig, repoFilePath: string, request: GitHubRequest): Promise<Response>;
async function requestGitHub(
  config: AtomEveConfig,
  repoFilePath: string,
  request: GitHubRequest
): Promise<Response | undefined> {
  const response = await fetch(gitHubUrl(config, repoFilePath, request.source), {
    headers: { accept: request.accept },
    signal: AbortSignal.timeout(request.timeoutMs)
  });
  if (request.allowNotFound && response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Could not fetch ${repoFilePath} from ${config.registry}: HTTP ${response.status}`);
  return response;
}

function gitHubUrl(config: AtomEveConfig, repoFilePath: string, source: GitHubRequest["source"]): string {
  return source === "contents" ? gitHubContentsUrl(config, repoFilePath) : rawGitHubUrl(config, repoFilePath);
}

function gitHubContentsUrl(config: AtomEveConfig, repoFilePath: string): string {
  assertGitHubRegistry(config.registry);
  return `https://api.github.com/repos/${config.registry}/contents/${encodeGitHubPath(repoFilePath)}`;
}

function rawGitHubUrl(config: AtomEveConfig, repoFilePath: string): string {
  assertGitHubRegistry(config.registry);
  return `https://raw.githubusercontent.com/${config.registry}/HEAD/${encodeGitHubPath(repoFilePath)}`;
}

function assertGitHubRegistry(registry: string) {
  if (!/^[^/\s]+\/[^/\s]+$/.test(registry)) {
    throw new Error(`Remote installs require a GitHub registry in owner/repo form. Got: ${registry}`);
  }
}

function encodeGitHubPath(repoFilePath: string): string {
  return repoFilePath.split("/").map(encodeURIComponent).join("/");
}
