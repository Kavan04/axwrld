// @vitest-environment node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { mongoDataDir } from "../scripts/mongoDataDir.js";

describe("mongoDataDir", () => {
  it("resolves to .mongo-data in the repository root when the path contains a space", () => {
    const root = path.resolve("/tmp/My Projects/axwrld");
    const moduleUrl = pathToFileURL(path.join(root, "scripts", "dev-db.js")).href;

    expect(moduleUrl).toContain("%20");
    expect(path.resolve(mongoDataDir(moduleUrl))).toBe(path.join(root, ".mongo-data"));
  });
});
