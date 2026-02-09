import { Box, Text, useStdin } from "ink";
import { useEffect, useRef, useState } from "react";
import { reduceAuthInput } from "./auth-controller.js";
import { Header } from "./header.js";
import { TextInput } from "./input.js";
import type { Peer } from "./machines.js";

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
  const [active, setActive] = useState<0 | 1>(0);

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
      const result = reduceAuthInput(
        {
          active: activeRef.current,
          user: userRef.current,
          password: passwordRef.current,
        },
        input,
      );

      if (result.state.active !== activeRef.current) setActive(result.state.active);
      if (result.state.user !== userRef.current) setUser(result.state.user);
      if (result.state.password !== passwordRef.current) setPassword(result.state.password);

      if (!result.effect) return;
      if (result.effect.type === "cancel") onCancel();
      else if (result.effect.type === "back") onBack();
      else if (result.effect.type === "beep") process.stdout.write("\x07");
      else onSubmit(result.effect.user, result.effect.password);
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
        <Box borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} borderDimColor>
          <Text dimColor>esc to go back · enter to submit</Text>
        </Box>
      </Box>
    </Box>
  );
}
