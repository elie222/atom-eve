import fsSync from "node:fs";
import { promises as fs } from "node:fs";

export function parseJson(text: string, filePath: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

export async function readJsonFile(filePath: string): Promise<unknown> {
  return parseJson(await fs.readFile(filePath, "utf8"), filePath);
}

export function readJsonFileSync(filePath: string): unknown {
  return parseJson(fsSync.readFileSync(filePath, "utf8"), filePath);
}
