import { describe, expect, test } from "bun:test";
import type { AuthState } from "./auth-controller.js";
import { reduceAuthInput } from "./auth-controller.js";

function baseState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    active: 0,
    user: "",
    password: "",
    ...overrides,
  };
}

describe("reduceAuthInput", () => {
  test("handles cancel and back", () => {
    const state = baseState();
    expect(reduceAuthInput(state, "\x03")).toEqual({ state, effect: { type: "cancel" } });
    expect(reduceAuthInput(state, "\x1b")).toEqual({ state, effect: { type: "back" } });
  });

  test("tab and arrows toggle active field", () => {
    const state = baseState({ active: 0 });
    expect(reduceAuthInput(state, "\t").state.active).toBe(1);
    expect(reduceAuthInput(state, "\x1b[A").state.active).toBe(1);
    expect(reduceAuthInput(baseState({ active: 1 }), "\x1b[B").state.active).toBe(0);
  });

  test("enter advances from user to password", () => {
    const state = baseState({ active: 0, user: "alice" });
    expect(reduceAuthInput(state, "\n").state.active).toBe(1);
  });

  test("enter beeps when submit fields are incomplete", () => {
    const state = baseState({ active: 1, user: "alice", password: "" });
    expect(reduceAuthInput(state, "\r").effect).toEqual({ type: "beep" });
  });

  test("enter submits trimmed user with password", () => {
    const state = baseState({ active: 1, user: " alice ", password: "secret" });
    expect(reduceAuthInput(state, "\n").effect).toEqual({
      type: "submit",
      user: "alice",
      password: "secret",
    });
  });

  test("backspace deletes in active field", () => {
    expect(reduceAuthInput(baseState({ active: 0, user: "ab" }), "\x7f").state.user).toBe("a");
    expect(reduceAuthInput(baseState({ active: 1, password: "xy" }), "\x7f").state.password).toBe("x");
  });

  test("printable input appends to active field", () => {
    expect(reduceAuthInput(baseState({ active: 0, user: "a" }), "bc").state.user).toBe("abc");
    expect(reduceAuthInput(baseState({ active: 1, password: "x" }), "yz").state.password).toBe("xyz");
  });

  test("non-printable input is ignored", () => {
    const state = baseState({ user: "alice" });
    expect(reduceAuthInput(state, "\u0000")).toEqual({ state, effect: null });
  });
});
