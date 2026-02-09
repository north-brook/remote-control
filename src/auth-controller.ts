export type AuthState = {
  active: 0 | 1;
  user: string;
  password: string;
};

export type AuthEffect =
  | { type: "cancel" }
  | { type: "back" }
  | { type: "beep" }
  | { type: "submit"; user: string; password: string };

export type AuthReducerResult = {
  state: AuthState;
  effect: AuthEffect | null;
};

function stripPrintable(input: string): string {
  if (!input) return "";
  return input
    .split("")
    .filter((c) => c >= " " && c <= "~")
    .join("");
}

export function reduceAuthInput(state: AuthState, input: string): AuthReducerResult {
  // Ctrl+C
  if (input === "\x03") return { state, effect: { type: "cancel" } };

  // Escape
  if (input === "\x1b") return { state, effect: { type: "back" } };

  // Tab or Arrow keys to switch fields
  if (input === "\t" || input === "\x1b[A" || input === "\x1b[B") {
    return { state: { ...state, active: state.active === 0 ? 1 : 0 }, effect: null };
  }

  // Enter
  if (input === "\r" || input === "\n") {
    if (state.active === 0) {
      return { state: { ...state, active: 1 }, effect: null };
    }
    if (!state.user.trim() || !state.password) {
      return { state, effect: { type: "beep" } };
    }
    return {
      state,
      effect: {
        type: "submit",
        user: state.user.trim(),
        password: state.password,
      },
    };
  }

  // Backspace
  if (input === "\x7f" || input === "\b") {
    if (state.active === 0) return { state: { ...state, user: state.user.slice(0, -1) }, effect: null };
    return { state: { ...state, password: state.password.slice(0, -1) }, effect: null };
  }

  // Printable characters (support paste)
  const printable = stripPrintable(input);
  if (!printable) return { state, effect: null };
  if (state.active === 0) return { state: { ...state, user: state.user + printable }, effect: null };
  return { state: { ...state, password: state.password + printable }, effect: null };
}
