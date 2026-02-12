import { describe, expect, test } from "bun:test";
import type { DirectoryState } from "./directory-controller.js";
import { reduceDirectoryInput } from "./directory-controller.js";

function baseState(overrides: Partial<DirectoryState> = {}): DirectoryState {
  return {
    directory: "",
    active: 0,
    selectedRecent: 0,
    recentDirs: [],
    ...overrides,
  };
}

describe("reduceDirectoryInput", () => {
  test("handles cancel and back effects", () => {
    const state = baseState({ directory: "~/project" });
    expect(reduceDirectoryInput(state, "\x03")).toEqual({ state, effect: { type: "cancel" } });
    expect(reduceDirectoryInput(state, "\x1b")).toEqual({ state, effect: { type: "back" } });
  });

  test("tab stays on input when no recents exist", () => {
    const noRecents = baseState({ active: 0, recentDirs: [] });
    expect(reduceDirectoryInput(noRecents, "\t").state.active).toBe(0);
  });

  test("tab cycles input and each recent entry", () => {
    const state = baseState({ active: 0, selectedRecent: 0, recentDirs: ["~/a", "~/b"] });
    const first = reduceDirectoryInput(state, "\t");
    expect(first.state.active).toBe(1);
    expect(first.state.selectedRecent).toBe(0);

    const second = reduceDirectoryInput(first.state, "\t");
    expect(second.state.active).toBe(1);
    expect(second.state.selectedRecent).toBe(1);

    const third = reduceDirectoryInput(second.state, "\t");
    expect(third.state.active).toBe(0);
  });

  test("arrow keys select recent and clamp bounds", () => {
    const state = baseState({ active: 0, selectedRecent: 0, recentDirs: ["~/a", "~/b"] });
    const down = reduceDirectoryInput(state, "\x1b[B");
    expect(down.state.active).toBe(1);
    expect(down.state.selectedRecent).toBe(1);

    const stillBottom = reduceDirectoryInput(down.state, "\x1b[B");
    expect(stillBottom.state.selectedRecent).toBe(1);

    const up = reduceDirectoryInput(stillBottom.state, "\x1b[A");
    expect(up.state.selectedRecent).toBe(0);
  });

  test("enter submits selected recent when recents focus is active", () => {
    const state = baseState({ active: 1, selectedRecent: 1, recentDirs: ["~/a", "~/b"] });
    expect(reduceDirectoryInput(state, "\r").effect).toEqual({ type: "submit", directory: "~/b" });
  });

  test("enter submits trimmed input when input focus is active", () => {
    const state = baseState({ active: 0, directory: "  ~/project  " });
    expect(reduceDirectoryInput(state, "\n").effect).toEqual({ type: "submit", directory: "~/project" });
  });

  test("backspace edits input in input mode", () => {
    const inputState = baseState({ active: 0, directory: "~/abc" });
    expect(reduceDirectoryInput(inputState, "\x7f").state.directory).toBe("~/ab");
    expect(reduceDirectoryInput(inputState, "\b").state.directory).toBe("~/ab");
  });

  test("delete removes selected recent when recents focus is active", () => {
    const recentsState = baseState({ active: 1, directory: "~/abc", recentDirs: ["~/a"] });
    expect(reduceDirectoryInput(recentsState, "\x7f").effect).toEqual({ type: "deleteRecent", directory: "~/a" });

    const multipleRecents = baseState({ active: 1, selectedRecent: 1, recentDirs: ["~/a", "~/b", "~/c"] });
    const result = reduceDirectoryInput(multipleRecents, "\x1b[3~");
    expect(result.effect).toEqual({ type: "deleteRecent", directory: "~/b" });
    expect(result.state.active).toBe(1);
    expect(result.state.selectedRecent).toBe(1);
  });

  test("delete on recents no-ops when list is empty", () => {
    const state = baseState({ active: 1, recentDirs: [] });
    expect(reduceDirectoryInput(state, "\x7f")).toEqual({ state, effect: null });
  });

  test("printable input appends and moves focus to input", () => {
    const state = baseState({ active: 1, directory: "~", recentDirs: ["~/a"] });
    const result = reduceDirectoryInput(state, "/project");
    expect(result.state.active).toBe(0);
    expect(result.state.directory).toBe("~/project");
  });

  test("non-printable data is ignored", () => {
    const state = baseState({ directory: "~/a" });
    const result = reduceDirectoryInput(state, "\u0000");
    expect(result).toEqual({ state, effect: null });
  });
});
