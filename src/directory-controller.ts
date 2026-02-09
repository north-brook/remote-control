function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function stripPrintable(input: string): string {
  if (!input) return "";
  return input
    .split("")
    .filter((c) => c >= " " && c <= "~")
    .join("");
}

export type DirectoryState = {
  directory: string;
  active: 0 | 1; // 0: input, 1: recents
  selectedRecent: number;
  recentDirs: string[];
};

export type DirectoryEffect =
  | { type: "cancel" }
  | { type: "back" }
  | { type: "submit"; directory: string };

export type DirectoryReducerResult = {
  state: DirectoryState;
  effect: DirectoryEffect | null;
};

export function reduceDirectoryInput(state: DirectoryState, input: string): DirectoryReducerResult {
  // Ctrl+C
  if (input === "\x03") {
    return { state, effect: { type: "cancel" } };
  }

  // Escape
  if (input === "\x1b") {
    return { state, effect: { type: "back" } };
  }

  // Tab
  if (input === "\t") {
    if (state.recentDirs.length === 0) return { state, effect: null };
    return {
      state: { ...state, active: state.active === 0 ? 1 : 0 },
      effect: null,
    };
  }

  // Arrow keys for recents
  if (input === "\x1b[A" || input === "\x1b[B") {
    if (state.recentDirs.length === 0) return { state, effect: null };
    const delta = input === "\x1b[A" ? -1 : 1;
    return {
      state: {
        ...state,
        active: 1,
        selectedRecent: clamp(state.selectedRecent + delta, 0, state.recentDirs.length - 1),
      },
      effect: null,
    };
  }

  // Enter
  if (input === "\r" || input === "\n") {
    if (state.active === 1 && state.recentDirs[state.selectedRecent]) {
      return {
        state,
        effect: { type: "submit", directory: state.recentDirs[state.selectedRecent] },
      };
    }
    return {
      state,
      effect: { type: "submit", directory: state.directory.trim() },
    };
  }

  // Backspace (input only)
  if (input === "\x7f" || input === "\b") {
    if (state.active === 0) {
      return {
        state: { ...state, directory: state.directory.slice(0, -1) },
        effect: null,
      };
    }
    return { state, effect: null };
  }

  // Printable characters (support paste)
  const printable = stripPrintable(input);
  if (!printable) return { state, effect: null };

  return {
    state: {
      ...state,
      active: 0,
      directory: state.directory + printable,
    },
    effect: null,
  };
}

export { stripPrintable };
