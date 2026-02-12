import { describe, expect, test } from "bun:test";
import type { Peer } from "./machines.js";
import type { PickerState } from "./picker-controller.js";
import { reducePickerInput } from "./picker-controller.js";

const onlinePeer: Peer = {
  idx: 1,
  id: "a",
  name: "alpha.tailnet.ts.net",
  shortName: "alpha",
  ip: "100.0.0.1",
  user: "ops",
  os: "linux",
  online: true,
  selfPeer: false,
  reachable: true,
};

const offlinePeer: Peer = {
  ...onlinePeer,
  id: "b",
  shortName: "beta",
  online: false,
  reachable: false,
};

function baseState(overrides: Partial<PickerState> = {}): PickerState {
  return {
    list: [onlinePeer, offlinePeer],
    selected: 0,
    mode: "ssh",
    showSearch: false,
    filter: "",
    ...overrides,
  };
}

describe("reducePickerInput", () => {
  test("handles cancel with ctrl+c and escape", () => {
    const state = baseState();
    expect(reducePickerInput(state, "\x03")).toEqual({ state, effect: { type: "cancel" } });
    expect(reducePickerInput(state, "\x1b")).toEqual({ state, effect: { type: "cancel" } });
  });

  test("escape closes search and resets filter + selection", () => {
    const state = baseState({ showSearch: true, filter: "a", selected: 1 });
    const result = reducePickerInput(state, "\x1b");
    expect(result.effect).toBeNull();
    expect(result.state.showSearch).toBe(false);
    expect(result.state.filter).toBe("");
    expect(result.state.selected).toBe(0);
  });

  test("opens search with slash and updates filter in search mode", () => {
    const opened = reducePickerInput(baseState(), "/");
    expect(opened.state.showSearch).toBe(true);

    const typed = reducePickerInput({ ...opened.state, showSearch: true }, "ab");
    expect(typed.state.filter).toBe("ab");
    expect(typed.state.selected).toBe(0);
  });

  test("backspace only applies in search mode", () => {
    const notSearching = reducePickerInput(baseState({ filter: "abc", showSearch: false }), "\x7f");
    expect(notSearching.state.filter).toBe("abc");

    const searching = reducePickerInput(baseState({ filter: "abc", showSearch: true }), "\x7f");
    expect(searching.state.filter).toBe("ab");
    expect(searching.state.selected).toBe(0);
  });

  test("moves selection with arrow/page/home/end keys", () => {
    expect(reducePickerInput(baseState({ selected: 0 }), "\x1b[B").state.selected).toBe(1);
    expect(reducePickerInput(baseState({ selected: 1 }), "\x1b[A").state.selected).toBe(0);
    expect(reducePickerInput(baseState({ selected: 1 }), "\x1b[5~").state.selected).toBe(0);
    expect(reducePickerInput(baseState({ selected: 0 }), "\x1b[6~").state.selected).toBe(1);
    expect(reducePickerInput(baseState({ selected: 1 }), "\x1b[H").state.selected).toBe(0);
    expect(reducePickerInput(baseState({ selected: 0 }), "\x1b[F").state.selected).toBe(1);
  });

  test("tab moves machine selection and wraps around", () => {
    expect(reducePickerInput(baseState({ selected: 0 }), "\t").state.selected).toBe(1);
    expect(reducePickerInput(baseState({ selected: 1 }), "\t").state.selected).toBe(0);
  });

  test("shift+tab cycles between ssh, vnc, and cursor", () => {
    expect(reducePickerInput(baseState({ mode: "ssh" }), "\x1b[Z").state.mode).toBe("vnc");
    expect(reducePickerInput(baseState({ mode: "vnc" }), "\x1b[Z").state.mode).toBe("cursor");
    expect(reducePickerInput(baseState({ mode: "cursor" }), "\x1b[Z").state.mode).toBe("ssh");
  });

  test("shift+tab skips cursor when cursor mode is unavailable", () => {
    expect(reducePickerInput(baseState({ mode: "ssh", modes: ["ssh", "vnc"] }), "\x1b[Z").state.mode).toBe("vnc");
    expect(reducePickerInput(baseState({ mode: "vnc", modes: ["ssh", "vnc"] }), "\x1b[Z").state.mode).toBe("ssh");
  });

  test("shift+tab is stable when only one mode is available", () => {
    expect(reducePickerInput(baseState({ mode: "ssh", modes: ["ssh"] }), "\x1b[Z").state.mode).toBe("ssh");
  });

  test("enter beeps for disabled peer", () => {
    const state = baseState({ selected: 1 });
    expect(reducePickerInput(state, "\n").effect).toEqual({ type: "beep" });
  });

  test("enter selects peer for enabled row", () => {
    const state = baseState({ selected: 0, mode: "vnc" });
    expect(reducePickerInput(state, "\r").effect).toEqual({
      type: "select",
      peer: onlinePeer,
      mode: "vnc",
    });
  });

  test("enter with empty list has no effect", () => {
    const state = baseState({ list: [], selected: 0 });
    expect(reducePickerInput(state, "\n")).toEqual({ state, effect: null });
  });
});
