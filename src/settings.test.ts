import { describe, expect, test } from "bun:test";
import {
  addRecentDirectory,
  MAX_RECENT_DIRS,
  normalizeMachineSettings,
  normalizeRecentDirs,
  normalizeSettings,
  SETTINGS_VERSION,
} from "./settings.js";

describe("normalizeRecentDirs", () => {
  test("trims, dedupes, and ignores invalid values", () => {
    expect(normalizeRecentDirs([1, "  ", " ~/project ", "~/project", "/tmp"])).toEqual(["~/project", "/tmp"]);
  });

  test("caps to max recent dirs", () => {
    const input = Array.from({ length: MAX_RECENT_DIRS + 3 }, (_, i) => `~/p${i}`);
    expect(normalizeRecentDirs(input)).toHaveLength(MAX_RECENT_DIRS);
  });
});

describe("normalizeMachineSettings", () => {
  test("falls back to defaults for invalid values", () => {
    const normalized = normalizeMachineSettings({
      sshUser: 1,
      sshPassword: null,
      recentDirs: "bad",
      lastCursorDirectory: 123,
      updatedAt: 123,
    });

    expect(normalized.sshUser).toBe("");
    expect(normalized.sshPassword).toBe("");
    expect(normalized.recentDirs).toEqual([]);
    expect(normalized.lastCursorDirectory).toBe("");
    expect(typeof normalized.updatedAt).toBe("string");
    expect(normalized.updatedAt.length).toBeGreaterThan(0);
  });
});

describe("normalizeSettings", () => {
  test("returns defaults for invalid root payload", () => {
    const normalized = normalizeSettings(null);
    expect(normalized.version).toBe(SETTINGS_VERSION);
    expect(normalized.machines).toEqual({});
    expect(normalized.lastMachineKey).toBe("");
    expect(normalized.lastMode).toBe("ssh");
  });

  test("returns defaults for version mismatch", () => {
    const normalized = normalizeSettings({
      version: SETTINGS_VERSION + 1,
      machines: {},
    });
    expect(normalized.version).toBe(SETTINGS_VERSION);
    expect(normalized.machines).toEqual({});
    expect(normalized.lastMachineKey).toBe("");
    expect(normalized.lastMode).toBe("ssh");
  });

  test("normalizes machine settings map", () => {
    const normalized = normalizeSettings({
      version: SETTINGS_VERSION,
      machines: {
        alpha: {
          sshUser: "user",
          sshPassword: "pass",
          recentDirs: ["~/one", "~/one", "/tmp"],
          lastCursorDirectory: "~/one",
          updatedAt: "2026-02-09T00:00:00.000Z",
        },
      },
      lastMachineKey: "alpha",
      lastMode: "cursor",
      createdAt: "2026-02-08T00:00:00.000Z",
      updatedAt: "2026-02-09T00:00:00.000Z",
    });

    expect(normalized.version).toBe(SETTINGS_VERSION);
    expect(normalized.machines.alpha?.sshUser).toBe("user");
    expect(normalized.machines.alpha?.sshPassword).toBe("pass");
    expect(normalized.machines.alpha?.recentDirs).toEqual(["~/one", "/tmp"]);
    expect(normalized.machines.alpha?.lastCursorDirectory).toBe("~/one");
    expect(normalized.lastMachineKey).toBe("alpha");
    expect(normalized.lastMode).toBe("cursor");
    expect(normalized.createdAt).toBe("2026-02-08T00:00:00.000Z");
  });

  test("falls back to ssh for invalid mode", () => {
    const normalized = normalizeSettings({
      version: SETTINGS_VERSION,
      machines: {},
      lastMachineKey: "alpha",
      lastMode: "bad",
    });
    expect(normalized.lastMachineKey).toBe("alpha");
    expect(normalized.lastMode).toBe("ssh");
  });
});

describe("addRecentDirectory", () => {
  test("adds new directory to the front", () => {
    expect(addRecentDirectory(["/tmp"], "~/project")).toEqual(["~/project", "/tmp"]);
  });

  test("dedupes by moving existing entry to front", () => {
    expect(addRecentDirectory(["~/project", "/tmp"], "/tmp")).toEqual(["/tmp", "~/project"]);
  });

  test("ignores empty directory", () => {
    const existing = ["~/project"];
    expect(addRecentDirectory(existing, "   ")).toBe(existing);
  });

  test("caps list length", () => {
    const existing = Array.from({ length: MAX_RECENT_DIRS }, (_, i) => `~/d${i}`);
    expect(addRecentDirectory(existing, "~/new")).toHaveLength(MAX_RECENT_DIRS);
  });
});
