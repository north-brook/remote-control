import type { Mode, Peer } from "./machines.js";

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

export function matchPeer(peer: Peer, needle: string): boolean {
  if (!needle) return true;
  const n = needle.toLowerCase();
  return (
    peer.shortName.toLowerCase().includes(n) ||
    peer.name.toLowerCase().includes(n) ||
    peer.ip.toLowerCase().includes(n) ||
    peer.user.toLowerCase().includes(n) ||
    peer.os.toLowerCase().includes(n)
  );
}

export function isDisabled(peer: Peer): boolean {
  return !peer.online || peer.reachable === false;
}

export function osName(os: string): string {
  const value = os.toLowerCase();
  if (value.includes("darwin") || value.includes("mac") || value.includes("osx")) return "macos";
  if (value.includes("windows")) return "windows";
  if (value.includes("linux")) return "linux";
  if (value.includes("android")) return "android";
  if (value.includes("ios") || value.includes("ipad")) return "ios";
  if (value.includes("freebsd") || value.includes("openbsd") || value.includes("netbsd")) return "bsd";
  return "";
}

export type PickerState = {
  list: Peer[];
  selected: number;
  mode: Mode;
  showSearch: boolean;
  filter: string;
};

export type PickerEffect =
  | { type: "cancel" }
  | { type: "beep" }
  | { type: "select"; peer: Peer; mode: Mode };

export type PickerReducerResult = {
  state: PickerState;
  effect: PickerEffect | null;
};

export function reducePickerInput(state: PickerState, input: string): PickerReducerResult {
  // Ctrl+C always cancels
  if (input === "\x03") return { state, effect: { type: "cancel" } };

  // Escape: close search if open, otherwise cancel
  if (input === "\x1b") {
    if (state.showSearch) {
      return {
        state: { ...state, showSearch: false, filter: "", selected: 0 },
        effect: null,
      };
    }
    return { state, effect: { type: "cancel" } };
  }

  // "/" opens search mode
  if (input === "/" && !state.showSearch) {
    return { state: { ...state, showSearch: true }, effect: null };
  }

  // Arrow keys
  if (input === "\x1b[A") {
    return { state: { ...state, selected: clamp(state.selected - 1, 0, state.list.length - 1) }, effect: null };
  }
  if (input === "\x1b[B") {
    return { state: { ...state, selected: clamp(state.selected + 1, 0, state.list.length - 1) }, effect: null };
  }
  if (input === "\x1b[5~") {
    return { state: { ...state, selected: clamp(state.selected - 5, 0, state.list.length - 1) }, effect: null };
  }
  if (input === "\x1b[6~") {
    return { state: { ...state, selected: clamp(state.selected + 5, 0, state.list.length - 1) }, effect: null };
  }
  if (input === "\x1b[H") {
    return { state: { ...state, selected: 0 }, effect: null };
  }
  if (input === "\x1b[F") {
    return { state: { ...state, selected: Math.max(0, state.list.length - 1) }, effect: null };
  }

  // Tab
  if (input === "\t") {
    return { state: { ...state, mode: state.mode === "ssh" ? "vnc" : "ssh" }, effect: null };
  }

  // Backspace (only in search mode)
  if (input === "\x7f" || input === "\b") {
    if (!state.showSearch) return { state, effect: null };
    return {
      state: { ...state, filter: state.filter.slice(0, -1), selected: 0 },
      effect: null,
    };
  }

  // Enter
  if (input === "\r" || input === "\n") {
    const peer = state.list[state.selected];
    if (!peer) return { state, effect: null };
    if (isDisabled(peer)) return { state, effect: { type: "beep" } };
    return { state, effect: { type: "select", peer, mode: state.mode } };
  }

  // Printable characters (only in search mode)
  if (state.showSearch) {
    const printable = stripPrintable(input);
    if (!printable) return { state, effect: null };
    return {
      state: { ...state, filter: state.filter + printable, selected: 0 },
      effect: null,
    };
  }

  return { state, effect: null };
}
