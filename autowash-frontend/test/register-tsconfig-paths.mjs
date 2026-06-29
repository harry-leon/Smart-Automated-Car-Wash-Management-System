import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const projectRoot = path.resolve(currentDir, "..");
const sourceRoot = path.join(projectRoot, "src");
const candidateExtensions = ["", ".ts", ".tsx", ".js", ".mjs"];
const indexCandidates = ["index.ts", "index.tsx", "index.js", "index.mjs"];

function resolveTypeScriptPath(basePath) {
  for (const extension of candidateExtensions) {
    const filePath = `${basePath}${extension}`;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }

  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const indexFile of indexCandidates) {
      const indexPath = path.join(basePath, indexFile);
      if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
        return indexPath;
      }
    }
  }

  return basePath;
}

function resolveAliasPath(specifier) {
  return resolveTypeScriptPath(path.join(sourceRoot, specifier.slice(2)));
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolvedPath = resolveAliasPath(specifier);
      return nextResolve(pathToFileURL(resolvedPath).href, context);
    }

    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file://")) {
      const parentPath = fileURLToPath(context.parentURL);
      if (!fs.existsSync(parentPath) || !fs.statSync(parentPath).isFile()) {
        return nextResolve(specifier, context);
      }

      const resolvedPath = resolveTypeScriptPath(path.resolve(path.dirname(parentPath), specifier));
      if (fs.existsSync(resolvedPath)) {
        return nextResolve(pathToFileURL(resolvedPath).href, context);
      }
    }

    return nextResolve(specifier, context);
  },
});
