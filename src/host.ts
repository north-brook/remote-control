export function sanitizeHostName(value: string | undefined): string {
  return (value ?? "").trim().replace(/\.+$/, "");
}
