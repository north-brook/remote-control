import { describe, expect, test } from "bun:test";
import { buildSshDirectoryCommand, remoteDirectoryArg, shellQuote } from "./ssh.js";

describe("shellQuote", () => {
  test("quotes plain strings", () => {
    expect(shellQuote("abc")).toBe("'abc'");
  });

  test("escapes single quotes", () => {
    expect(shellQuote("a'b")).toBe("'a'\\''b'");
  });
});

describe("remoteDirectoryArg", () => {
  test("maps home shortcut", () => {
    expect(remoteDirectoryArg("~")).toBe("$HOME");
  });

  test("maps home-relative path", () => {
    expect(remoteDirectoryArg("~/project")).toBe("$HOME/'project'");
  });

  test("quotes absolute path", () => {
    expect(remoteDirectoryArg("/opt/app")).toBe("'/opt/app'");
  });

  test("escapes quotes in home-relative path", () => {
    expect(remoteDirectoryArg("~/a'b")).toBe("$HOME/'a'\\''b'");
  });
});

describe("buildSshDirectoryCommand", () => {
  test("returns null for missing or empty directory", () => {
    expect(buildSshDirectoryCommand(undefined)).toBeNull();
    expect(buildSshDirectoryCommand("  ")).toBeNull();
  });

  test("builds command with fallback and login shell", () => {
    const command = buildSshDirectoryCommand("~/project");
    expect(command).toBe(`cd -- $HOME/'project' 2>/dev/null || cd ~; exec \${SHELL:-/bin/bash} -l`);
  });
});
