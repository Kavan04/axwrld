import { fileURLToPath } from "node:url";

/** Filesystem path of the repository's .mongo-data/ directory, given a module URL inside scripts/. */
export function mongoDataDir(moduleUrl) {
  return fileURLToPath(new URL("../.mongo-data/", moduleUrl));
}
