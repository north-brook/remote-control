import { describe, expect, test } from "bun:test";
import { redactDebugValue } from "./debug.js";

describe("redactDebugValue", () => {
  test("redacts password-like keys", () => {
    expect(
      redactDebugValue({
        nested: {
          password: "secret-value",
        },
      }),
    ).toEqual({
      nested: {
        password: "<redacted>",
      },
    });
  });

  test("redacts token-like keys inside arrays", () => {
    expect(
      redactDebugValue([
        {
          connectionToken: "abc123",
        },
      ]),
    ).toEqual([
      {
        connectionToken: "<redacted>",
      },
    ]);
  });
});
