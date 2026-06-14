import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

const sourceRoot = join(process.cwd(), "src");
const legacyRoots = ["components", "hooks", "lib", "store", "types"];
const legacyImportPattern = /@\/(?:components|hooks|lib|store|types)\//;

function walkFiles(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    return stats.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

test("frontend source uses feature/shared package structure", () => {
  const existingLegacySourceFiles = legacyRoots.flatMap((root) => {
    const rootPath = join(sourceRoot, root);
    try {
      return walkFiles(rootPath).filter((file) => /\.(ts|tsx)$/.test(file));
    } catch {
      return [];
    }
  });

  assert.deepEqual(
    existingLegacySourceFiles.map((file) => relative(process.cwd(), file)),
    [],
    "move frontend source from src/components, src/hooks, src/lib, src/store, and src/types into src/features or src/shared",
  );
});

test("frontend imports do not use legacy root aliases", () => {
  const sourceFiles = walkFiles(sourceRoot).filter((file) => /\.(ts|tsx)$/.test(file));
  const offenders = sourceFiles
    .filter((file) => legacyImportPattern.test(readFileSync(file, "utf8")))
    .map((file) => relative(process.cwd(), file));

  assert.deepEqual(
    offenders,
    [],
    "replace @/components, @/hooks, @/lib, @/store, and @/types imports with @/features or @/shared imports",
  );
});
