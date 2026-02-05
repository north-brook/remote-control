import { Box, Text, useStdin } from "ink";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./header.js";
import { TextInput } from "./input.js";

type Mode = "vnc" | "ssh" | "ping";

type Peer = {
  idx: number;
  id: string;
  name: string;
  shortName: string;
  ip: string;
  user: string;
  os: string;
  online: boolean;
  selfPeer: boolean;
  reachable: boolean | null;
};

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

function matchPeer(peer: Peer, needle: string): boolean {
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

function isDisabled(peer: Peer): boolean {
  return !peer.online || peer.reachable === false;
}

function osName(os: string): string {
  const value = os.toLowerCase();
  if (value.includes("darwin") || value.includes("mac") || value.includes("osx")) return "macos";
  if (value.includes("windows")) return "windows";
  if (value.includes("linux")) return "linux";
  if (value.includes("android")) return "android";
  if (value.includes("ios") || value.includes("ipad")) return "ios";
  if (value.includes("freebsd") || value.includes("openbsd") || value.includes("netbsd")) return "bsd";
  return "";
}

type PickerProps = {
  version: string;
  peers: Peer[];
  initialMode: Mode;
  modeLocked: boolean;
  onSelect: (peer: Peer, mode: Mode) => void;
  onCancel: () => void;
  _onTick: () => void;
};

export function Picker({
  version,
  peers,
  initialMode,
  modeLocked,
  onSelect,
  onCancel,
  _onTick,
}: PickerProps): JSX.Element {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showSearch, setShowSearch] = useState(false);

  const list = useMemo(() => {
    const needle = filter.trim();
    return peers.filter((p) => matchPeer(p, needle));
  }, [filter, peers]);

  // Keep refs to avoid stale closure issues
  const listRef = useRef(list);
  const selectedRef = useRef(selected);
  const modeRef = useRef(mode);
  const showSearchRef = useRef(showSearch);
  listRef.current = list;
  selectedRef.current = selected;
  modeRef.current = mode;
  showSearchRef.current = showSearch;

  useEffect(() => {
    if (selected > list.length - 1) setSelected(Math.max(0, list.length - 1));
  }, [list.length, selected]);

  const { stdin, setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);

    const handleData = (data: Buffer) => {
      const input = data.toString();
      const currentList = listRef.current;
      const currentSelected = selectedRef.current;
      const currentMode = modeRef.current;
      const currentShowSearch = showSearchRef.current;

      // Ctrl+C always cancels
      if (input === "\x03") {
        onCancel();
        return;
      }

      // Escape: close search if open, otherwise cancel
      if (input === "\x1b") {
        if (currentShowSearch) {
          setShowSearch(false);
          setFilter("");
          setSelected(0);
        } else {
          onCancel();
        }
        return;
      }

      // "/" opens search mode
      if (input === "/" && !currentShowSearch) {
        setShowSearch(true);
        return;
      }

      // Arrow keys
      if (input === "\x1b[A") {
        setSelected((s) => clamp(s - 1, 0, currentList.length - 1));
        return;
      }
      if (input === "\x1b[B") {
        setSelected((s) => clamp(s + 1, 0, currentList.length - 1));
        return;
      }
      if (input === "\x1b[5~") {
        setSelected((s) => clamp(s - 5, 0, currentList.length - 1));
        return;
      }
      if (input === "\x1b[6~") {
        setSelected((s) => clamp(s + 5, 0, currentList.length - 1));
        return;
      }
      if (input === "\x1b[H") {
        setSelected(0);
        return;
      }
      if (input === "\x1b[F") {
        setSelected(Math.max(0, currentList.length - 1));
        return;
      }

      // Tab
      if (input === "\t") {
        if (!modeLocked) {
          setMode((m) => (m === "ssh" ? "vnc" : "ssh"));
        }
        return;
      }

      // Backspace (only in search mode)
      if (input === "\x7f" || input === "\b") {
        if (currentShowSearch) {
          setFilter((f) => f.slice(0, -1));
          setSelected(0);
        }
        return;
      }

      // Enter
      if (input === "\r" || input === "\n") {
        const peer = currentList[currentSelected];
        if (!peer) return;
        if (isDisabled(peer)) {
          process.stdout.write("\x07");
          return;
        }
        onSelect(peer, currentMode);
        return;
      }

      // Printable characters (only in search mode)
      if (currentShowSearch) {
        const printable = stripPrintable(input);
        if (printable) {
          setFilter((f) => f + printable);
          setSelected(0);
        }
      }
    };

    stdin?.on("data", handleData);
    return () => {
      stdin?.off("data", handleData);
    };
  }, [stdin, setRawMode, onCancel, onSelect, modeLocked]);

  const maxVisible = 10;
  let displayList = list;
  let offset = 0;
  if (list.length > maxVisible) {
    const start = clamp(selected - Math.floor(maxVisible / 2), 0, list.length - maxVisible);
    displayList = list.slice(start, start + maxVisible);
    offset = start;
  }

  return (
    <Box flexDirection="column" paddingY={1}>
      <Header version={version}>
        <Text dimColor>quickly access remote machines</Text>
      </Header>

      {showSearch ? (
        <Box paddingLeft={2} paddingTop={1} paddingRight={2}>
          <TextInput value={filter} placeholder="search" focused={true} />
        </Box>
      ) : null}

      <Box flexDirection="column" paddingLeft={2} paddingTop={showSearch ? 0 : 1} paddingBottom={1} paddingRight={2}>
        {list.length === 0 ? (
          <Text dimColor>no matches</Text>
        ) : (
          displayList.map((peer, idx) => {
            const actualIndex = offset + idx;
            const isSelected = actualIndex === selected;
            const disabled = isDisabled(peer);
            const name = peer.shortName + (peer.selfPeer ? " (self)" : "");
            const os = osName(peer.os || "");

            return (
              <Text key={peer.id} dimColor={!isSelected}>
                <Text>{isSelected ? "> " : "  "}</Text>
                <Text strikethrough={disabled}>{name}</Text>
                {os ? <Text dimColor> {os}</Text> : null}
              </Text>
            );
          })
        )}
      </Box>
      <Box paddingLeft={2} paddingRight={2}>
        <Box
          borderStyle="single"
          borderTop
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          borderDimColor
          justifyContent="space-between"
          width="100%"
        >
          <Text>
            {mode === "ssh" ? (
              <>
                <Text color="cyan">~ terminal</Text>
                {modeLocked ? null : <Text dimColor> (tab to cycle)</Text>}
              </>
            ) : mode === "vnc" ? (
              <>
                <Text color="magenta">▶ screen</Text>
                {modeLocked ? null : <Text dimColor> (tab to cycle)</Text>}
              </>
            ) : (
              <Text color="green">• ping</Text>
            )}
          </Text>
          {!showSearch ? <Text dimColor>/ to search</Text> : null}
        </Box>
      </Box>
    </Box>
  );
}

export type { Peer, Mode };
