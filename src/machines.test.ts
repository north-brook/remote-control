import { describe, expect, test } from "bun:test";
import type { Peer } from "./machines.js";
import { isDisabled, matchPeer, osName } from "./picker-controller.js";

const peer: Peer = {
  idx: 1,
  id: "p1",
  name: "alpha.tailnet.ts.net",
  shortName: "alpha",
  ip: "100.1.2.3",
  user: "ops@example.com",
  os: "darwin",
  online: true,
  selfPeer: false,
  reachable: true,
};

describe("matchPeer", () => {
  test("matches empty filter", () => {
    expect(matchPeer(peer, "")).toBe(true);
  });

  test("matches against multiple fields case-insensitively", () => {
    expect(matchPeer(peer, "ALPHA")).toBe(true);
    expect(matchPeer(peer, "100.1.2")).toBe(true);
    expect(matchPeer(peer, "ops@")).toBe(true);
    expect(matchPeer(peer, "DARWIN")).toBe(true);
    expect(matchPeer(peer, "missing")).toBe(false);
  });
});

describe("isDisabled", () => {
  test("disables offline machines", () => {
    expect(isDisabled({ ...peer, online: false, reachable: null })).toBe(true);
  });

  test("disables unreachable machines", () => {
    expect(isDisabled({ ...peer, reachable: false })).toBe(true);
  });

  test("keeps reachable online machines enabled", () => {
    expect(isDisabled({ ...peer, online: true, reachable: true })).toBe(false);
    expect(isDisabled({ ...peer, online: true, reachable: null })).toBe(false);
  });
});

describe("osName", () => {
  test("maps known platforms", () => {
    expect(osName("darwin")).toBe("macos");
    expect(osName("windows")).toBe("windows");
    expect(osName("linux")).toBe("linux");
    expect(osName("android")).toBe("android");
    expect(osName("ios")).toBe("ios");
    expect(osName("freebsd")).toBe("bsd");
  });

  test("returns empty string for unknown", () => {
    expect(osName("solaris")).toBe("");
  });
});
