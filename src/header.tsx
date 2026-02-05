import { Box, Text } from "ink";
import type React from "react";

type HeaderProps = {
  version: string;
  children: React.ReactNode;
};

export function Header({ version, children }: HeaderProps): JSX.Element {
  return (
    <Box borderStyle="round" paddingX={1}>
      <Box flexDirection="column">
        <Text>
          <Text>remote control </Text>
          <Text dimColor>v{version}</Text>
        </Text>
        <Text>{children}</Text>
      </Box>
    </Box>
  );
}
