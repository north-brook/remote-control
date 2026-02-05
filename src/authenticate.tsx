import { Box, Text, useStdin } from "ink";
import { useEffect, useRef, useState } from "react";
import { Header } from "./header.js";
import { TextInput } from "./input.js";
import type { Peer } from "./machines.js";

function stripPrintable(input: string): string {
  if (!input) return "";
  return input
    .split("")
    .filter((c) => c >= " " && c <= "~")
    .join("");
}

type AuthenticateProps = {
  version: string;
  peer: Peer;
  existingUser: string;
  onSubmit: (user: string, password: string) => void;
  onBack: () => void;
  onCancel: () => void;
};

export function Authenticate({
  version,
  peer,
  existingUser,
  onSubmit,
  onBack,
  onCancel,
}: AuthenticateProps): JSX.Element {
  const [user, setUser] = useState(existingUser || "");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(0);

  // Keep refs to avoid stale closure issues
  const activeRef = useRef(active);
  const userRef = useRef(user);
  const passwordRef = useRef(password);
  activeRef.current = active;
  userRef.current = user;
  passwordRef.current = password;

  const { stdin, setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);

    const handleData = (data: Buffer) => {
      const input = data.toString();
      const currentActive = activeRef.current;
      const currentUser = userRef.current;
      const currentPassword = passwordRef.current;

      // Ctrl+C
      if (input === "\x03") {
        onCancel();
        return;
      }

      // Escape
      if (input === "\x1b") {
        onBack();
        return;
      }

      // Tab or Arrow keys to switch fields
      if (input === "\t" || input === "\x1b[A" || input === "\x1b[B") {
        setActive((a) => (a + 1) % 2);
        return;
      }

      // Enter
      if (input === "\r" || input === "\n") {
        if (currentActive === 0) {
          setActive(1);
        } else {
          if (!currentUser.trim() || !currentPassword) {
            process.stdout.write("\x07");
            return;
          }
          onSubmit(currentUser.trim(), currentPassword);
        }
        return;
      }

      // Backspace
      if (input === "\x7f" || input === "\b") {
        if (currentActive === 0) setUser((v) => v.slice(0, -1));
        else setPassword((v) => v.slice(0, -1));
        return;
      }

      // Printable characters (support paste)
      const printable = stripPrintable(input);
      if (!printable) return;
      if (currentActive === 0) setUser((v) => v + printable);
      else setPassword((v) => v + printable);
    };

    stdin?.on("data", handleData);
    return () => {
      stdin?.off("data", handleData);
    };
  }, [stdin, setRawMode, onCancel, onBack, onSubmit]);

  return (
    <Box flexDirection="column" paddingY={1}>
      <Header version={version}>
        <Text>
          <Text dimColor>enter credentials for </Text>
          <Text>{peer.shortName}</Text>
        </Text>
      </Header>

      <Box flexDirection="column" paddingLeft={2} paddingTop={1} paddingBottom={1} paddingRight={2}>
        <TextInput value={user} placeholder="user" focused={active === 0} />
        <TextInput value={password} placeholder="password" focused={active === 1} mask={true} />
      </Box>

      <Box paddingLeft={2} paddingRight={2}>
        <Box
          borderStyle="single"
          borderTop
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          borderDimColor
        >
          <Text dimColor>esc to go back · enter to submit</Text>
        </Box>
      </Box>
    </Box>
  );
}
