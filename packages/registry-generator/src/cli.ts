import { generateRegistry } from "./index.js";

const rootDir = process.cwd();

generateRegistry(rootDir).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
