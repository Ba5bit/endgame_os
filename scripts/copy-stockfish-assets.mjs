import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const sourceRoot = join(projectRoot, "node_modules", "stockfish", "src");
const targetRoot = join(projectRoot, "public", "stockfish");

mkdirSync(targetRoot, { recursive: true });

for (const file of [
  "stockfish-nnue-16-single.js",
  "stockfish-nnue-16-single.wasm",
]) {
  copyFileSync(join(sourceRoot, file), join(targetRoot, file));
}
