import { Box, Text, useStdin } from "ink";
import { useEffect, useRef, useState } from "react";
import { reduceDirectoryInput } from "./directory-controller.js";
import { Header } from "./header.js";
import { TextInput } from "./input.js";
import type { Peer } from "./machines.js";

type DirectoryProps = {
  version: string;
  peer: Peer;
  recentDirs: string[];
  initialDirectory: string;
  onSubmit: (directory: string) => void;
  onDeleteRecent: (directory: string) => void;
  onBack: () => void;
  onCancel: () => void;
};

export function Directory({
  version,
  peer,
  recentDirs,
  initialDirectory,
  onSubmit,
  onDeleteRecent,
  onBack,
  onCancel,
}: DirectoryProps): JSX.Element {
  const [directory, setDirectory] = useState(initialDirectory);
  const [active, setActive] = useState<0 | 1>(0); // 0: input, 1: recents
  const [selectedRecent, setSelectedRecent] = useState(0);

  // Keep refs to avoid stale closure issues
  const directoryRef = useRef(directory);
  const activeRef = useRef(active);
  const selectedRecentRef = useRef(selectedRecent);
  directoryRef.current = directory;
  activeRef.current = active;
  selectedRecentRef.current = selectedRecent;

  useEffect(() => {
    if (selectedRecent > recentDirs.length - 1) {
      setSelectedRecent(Math.max(0, recentDirs.length - 1));
    }
  }, [recentDirs.length, selectedRecent]);

  const { stdin, setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);

    const handleData = (data: Buffer) => {
      const input = data.toString();
      const result = reduceDirectoryInput(
        {
          directory: directoryRef.current,
          active: activeRef.current,
          selectedRecent: selectedRecentRef.current,
          recentDirs,
        },
        input,
      );

      if (result.state.directory !== directoryRef.current) setDirectory(result.state.directory);
      if (result.state.active !== activeRef.current) setActive(result.state.active);
      if (result.state.selectedRecent !== selectedRecentRef.current) setSelectedRecent(result.state.selectedRecent);

      if (!result.effect) return;
      if (result.effect.type === "cancel") onCancel();
      else if (result.effect.type === "back") onBack();
      else if (result.effect.type === "deleteRecent") onDeleteRecent(result.effect.directory);
      else onSubmit(result.effect.directory);
    };

    stdin?.on("data", handleData);
    return () => {
      stdin?.off("data", handleData);
    };
  }, [stdin, setRawMode, onBack, onCancel, onDeleteRecent, onSubmit, recentDirs]);

  return (
    <Box flexDirection="column" paddingY={1}>
      <Header version={version}>
        <Text>
          <Text dimColor>choose cursor directory for </Text>
          <Text>{peer.shortName}</Text>
        </Text>
      </Header>

      <Box flexDirection="column" paddingLeft={2} paddingTop={1} paddingBottom={1} paddingRight={2}>
        <TextInput value={directory} placeholder="directory (enter for ~)" focused={active === 0} />
        <Box flexDirection="column" paddingTop={1}>
          <Text dimColor>recent paths</Text>
          {recentDirs.length === 0 ? (
            <Text dimColor>  none</Text>
          ) : (
            recentDirs.map((recentDir, idx) => {
              const isSelected = active === 1 && idx === selectedRecent;
              return (
                <Text key={recentDir} dimColor={!isSelected}>
                  <Text>{isSelected ? "> " : "  "}</Text>
                  <Text>{recentDir}</Text>
                </Text>
              );
            })
          )}
        </Box>
      </Box>

      <Box paddingLeft={2} paddingRight={2}>
        <Box borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} borderDimColor>
          <Text dimColor>esc to go back · tab to cycle entries · delete to remove recent · enter to continue</Text>
        </Box>
      </Box>
    </Box>
  );
}
