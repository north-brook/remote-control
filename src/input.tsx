import { Text } from "ink";

type TextInputProps = {
  value: string;
  placeholder: string;
  focused: boolean;
  mask?: boolean;
};

export function TextInput({ value, placeholder, focused, mask }: TextInputProps): JSX.Element {
  const displayValue = mask ? "•".repeat(value.length) : value;

  if (value) {
    // Has value: show value with cursor at end if focused
    return (
      <Text>
        {displayValue}
        {focused ? <Text inverse> </Text> : null}
      </Text>
    );
  }

  // Empty: show placeholder with cursor overlayed on first character if focused
  if (focused) {
    const first = placeholder[0] || " ";
    const rest = placeholder.slice(1);
    return (
      <Text dimColor>
        <Text inverse>{first}</Text>
        {rest}
      </Text>
    );
  }

  return <Text dimColor>{placeholder}</Text>;
}
