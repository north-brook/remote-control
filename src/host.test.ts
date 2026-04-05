import { describe, expect, test } from "bun:test";
import { sanitizeHostName } from "./host.js";

describe("sanitizeHostName", () => {
  test("trims trailing dots from hostnames", () => {
    expect(sanitizeHostName("echo-server.tail023d74.ts.net.")).toBe("echo-server.tail023d74.ts.net");
  });

  test("trims surrounding whitespace", () => {
    expect(sanitizeHostName("  echo-server  ")).toBe("echo-server");
  });

  test("returns empty string for missing values", () => {
    expect(sanitizeHostName(undefined)).toBe("");
  });
});
