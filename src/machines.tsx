import { Box, Text, useStdin } from "ink";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./header.js";
import { TextInput } from "./input.js";
import { isDisabled, matchPeer, osName, reducePickerInput } from "./picker-controller.js";

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

type PickerProps = {
  version: string;
  peers: Peer[];
  onSelect: (peer: Peer, mode: Mode) => void;
  onCancel: () => void;
  _onTick: () => void;
};

export function Picker({ version, peers, onSelect, onCancel, _onTick }: PickerProps): JSX.Element {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState<Mode>("ssh");
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
  const filterRef = useRef(filter);
  listRef.current = list;
  selectedRef.current = selected;
  modeRef.current = mode;
  showSearchRef.current = showSearch;
  filterRef.current = filter;

  useEffect(() => {
    if (selected > list.length - 1) setSelected(Math.max(0, list.length - 1));
  }, [list.length, selected]);

  const { stdin, setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);

    const handleData = (data: Buffer) => {
      const input = data.toString();
      const result = reducePickerInput(
        {
          list: listRef.current,
          selected: selectedRef.current,
          mode: modeRef.current,
          showSearch: showSearchRef.current,
          filter: filterRef.current,
        },
        input,
      );

      if (result.state.selected !== selectedRef.current) setSelected(result.state.selected);
      if (result.state.mode !== modeRef.current) setMode(result.state.mode);
      if (result.state.showSearch !== showSearchRef.current) setShowSearch(result.state.showSearch);
      if (result.state.filter !== filterRef.current) setFilter(result.state.filter);

      if (!result.effect) return;
      if (result.effect.type === "cancel") onCancel();
      else if (result.effect.type === "beep") process.stdout.write("\x07");
      else onSelect(result.effect.peer, result.effect.mode);
    };

    stdin?.on("data", handleData);
    return () => {
      stdin?.off("data", handleData);
    };
  }, [stdin, setRawMode, onCancel, onSelect]);

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
                <Text dimColor> (tab to cycle)</Text>
              </>
            ) : mode === "vnc" ? (
              <>
                <Text color="magenta">▶ screen</Text>
                <Text dimColor> (tab to cycle)</Text>
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
