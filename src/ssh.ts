function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function remoteDirectoryArg(directory: string): string {
  if (directory === "~") return "$HOME";
  if (directory.startsWith("~/")) {
    const rest = directory.slice(2);
    if (!rest) return "$HOME";
    return `$HOME/${shellQuote(rest)}`;
  }
  return shellQuote(directory);
}

export function buildSshDirectoryCommand(directory: string | undefined): string | null {
  const startDirectory = directory?.trim() || "";
  if (!startDirectory) return null;
  return `cd -- ${remoteDirectoryArg(startDirectory)} 2>/dev/null || cd ~; exec \${SHELL:-/bin/bash} -l`;
}

export { remoteDirectoryArg, shellQuote };
