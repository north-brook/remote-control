#!/usr/bin/env bun

/*
  rc: Tailnet Remote Control
  - Interactive TUI to open SSH or Screen Sharing (VNC) to tailnet machines
*/

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "ink";
import { useEffect, useRef, useState } from "react";
import { Authenticate } from "./authenticate.js";
import { Directory } from "./directory.js";
import type { Mode, Peer } from "./machines.js";
import { Picker } from "./machines.js";
import {
  addRecentDirectory,
  defaultMachineSettings,
  normalizeSettings,
  nowIso,
  SETTINGS_VERSION,
  type RcSettings,
} from "./settings.js";
import { buildSshDirectoryCommand, remoteDirectoryArg } from "./ssh.js";

// Load version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const VERSION = pkg.version || "0.0.0";

type TailscalePeer = {
  ID?: string;
  NodeID?: string;
  DNSName?: string;
  HostName?: string;
  OS?: string;
  UserID?: string | number;
  User?: string;
  Online?: boolean;
  TailscaleIPs?: string[];
};

type TailscaleUser = {
  LoginName?: string;
  DisplayName?: string;
  ProfilePicURL?: string;
};

type StatusJson = Record<string, unknown> & {
  Peer?: Record<string, TailscalePeer>;
  User?: Record<string, TailscaleUser>;
  Self?: TailscalePeer;
};

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
};

const HOME_DIR = process.env.HOME || process.env.USERPROFILE || "";
const SETTINGS_DIR = join(HOME_DIR, ".rc");
const SETTINGS_PATH = join(SETTINGS_DIR, "settings.json");

function eprint(msg: string): void {
  process.stderr.write(`${msg}\n`);
}

function loadSettings(): RcSettings {
  if (!existsSync(SETTINGS_PATH)) {
    return { version: SETTINGS_VERSION, machines: {}, createdAt: nowIso(), updatedAt: nowIso() };
  }
  try {
    const raw = JSON.parse(readFileSync(SETTINGS_PATH, "utf8")) as unknown;
    return normalizeSettings(raw);
  } catch {
    return { version: SETTINGS_VERSION, machines: {}, createdAt: nowIso(), updatedAt: nowIso() };
  }
}

function saveSettings(settings: RcSettings): void {
  mkdirSync(SETTINGS_DIR, { recursive: true });
  const payload = { ...settings, updatedAt: nowIso() };
  writeFileSync(SETTINGS_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(): { includeOffline: boolean } {
  const argv = process.argv.slice(2);
  const includeOffline = argv.includes("--all");
  return { includeOffline };
}

function runTailscaleStatus(): StatusJson {
  const proc = Bun.spawnSync(["tailscale", "status", "--json"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (proc.exitCode !== 0) {
    const err = new TextDecoder().decode(proc.stderr);
    if (proc.exitCode === 127 || /not found/i.test(err)) {
      eprint("tailscale not found. Install it from https://tailscale.com and login first.");
    } else {
      eprint("tailscale status failed. Are you logged in?");
      if (err.trim()) eprint(err.trim());
    }
    process.exit(1);
  }
  const out = new TextDecoder().decode(proc.stdout);
  try {
    return JSON.parse(out) as StatusJson;
  } catch {
    eprint("Failed to parse tailscale status JSON.");
    process.exit(1);
  }
}

function resolveUsers(status: StatusJson): Record<string, TailscaleUser> {
  const users = status.User ?? {};
  const out: Record<string, TailscaleUser> = {};
  for (const [k, v] of Object.entries(users)) out[String(k)] = v;
  return out;
}

function displayUser(peer: TailscalePeer, users: Record<string, TailscaleUser>): string {
  const userId = peer.UserID;
  if (userId !== undefined && userId !== null) {
    const info = users[String(userId)] ?? {};
    return info.LoginName || info.DisplayName || info.ProfilePicURL || "";
  }
  return peer.User ?? "";
}

function extractPeers(status: StatusJson, includeOffline: boolean): Peer[] {
  const peersRaw = status.Peer ?? {};
  const users = resolveUsers(status);
  const selfId = status.Self?.ID;
  const selfHost = status.Self?.HostName;

  const peers: Peer[] = [];
  for (const peer of Object.values(peersRaw)) {
    const online = Boolean(peer?.Online);
    if (!includeOffline && !online) continue;
    const name = peer?.DNSName || peer?.HostName || "(unknown)";
    const shortName = String(name).split(".")[0];
    const ips: string[] = peer?.TailscaleIPs || [];
    const ip = ips[0] || "";
    const user = displayUser(peer, users);
    const os = peer?.OS || "";
    const id = String(peer?.ID || peer?.NodeID || name);
    let selfPeer = false;
    if (selfId && peer?.ID === selfId) selfPeer = true;
    else if (selfHost && peer?.HostName === selfHost) selfPeer = true;

    peers.push({
      idx: 0,
      id,
      name: String(name),
      shortName,
      ip,
      user: String(user || ""),
      os: String(os || ""),
      online,
      selfPeer,
      reachable: online ? null : false,
    });
  }

  return peers;
}

function preferredHost(peer: Peer): string {
  if (peer.name && peer.name !== "(unknown)") return peer.name;
  if (peer.shortName && peer.shortName !== "(unknown)") return peer.shortName;
  return peer.ip;
}

function machineKey(peer: Peer): string {
  return peer.id || peer.name || peer.shortName || peer.ip;
}

function parseIsoMs(value: string | undefined): number {
  if (!value) return 0;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

function sortPeersByRecency(peers: Peer[], settings: RcSettings): Peer[] {
  const out = [...peers];
  out.sort((a, b) => {
    const aRecent = parseIsoMs(settings.machines[machineKey(a)]?.updatedAt);
    const bRecent = parseIsoMs(settings.machines[machineKey(b)]?.updatedAt);
    if (aRecent !== bRecent) return bRecent - aRecent;
    return a.shortName.localeCompare(b.shortName);
  });
  for (let i = 0; i < out.length; i++) out[i].idx = i + 1;
  return out;
}

function markMachineUsed(peer: Peer, mode: Mode, user?: string, password?: string, directory?: string): void {
  if (mode === "ping") return;
  const settings = loadSettings();
  const key = machineKey(peer);
  const existing = settings.machines[key] ?? defaultMachineSettings();
  const trimmedDirectory = directory?.trim() || "";
  settings.machines[key] = {
    ...existing,
    sshUser: user || existing.sshUser,
    sshPassword: password || existing.sshPassword,
    recentDirs: trimmedDirectory ? addRecentDirectory(existing.recentDirs, trimmedDirectory) : existing.recentDirs,
    updatedAt: nowIso(),
  };
  saveSettings(settings);
}

function isDisabled(peer: Peer): boolean {
  return !peer.online || peer.reachable === false;
}

function pingArgs(host: string): string[] {
  if (process.platform === "win32") return ["-n", "1", "-w", "1000", host];
  if (process.platform === "darwin") return ["-c", "1", "-W", "1000", host];
  return ["-c", "1", "-W", "1", host];
}

async function pingHost(host: string): Promise<boolean | null> {
  try {
    const proc = Bun.spawn(["ping", ...pingArgs(host)], {
      stdout: "ignore",
      stderr: "ignore",
    });
    const timeoutMs = process.platform === "darwin" ? 1400 : 1200;
    const timeout = sleep(timeoutMs).then(() => {
      try {
        proc.kill();
      } catch {
        // ignore
      }
      return 1;
    });
    const exitCode = await Promise.race([proc.exited, timeout]);
    return exitCode === 0;
  } catch {
    return null;
  }
}

async function startAvailabilityChecks(peers: Peer[], onUpdate: () => void): Promise<void> {
  const queue = peers.filter((peer) => peer.online).slice();
  const concurrency = Math.min(6, Math.max(1, queue.length));
  let pingSupported = true;

  const worker = async () => {
    while (queue.length > 0) {
      const peer = queue.shift();
      if (!peer) return;
      const target = peer.ip || preferredHost(peer);
      if (!target) {
        peer.reachable = false;
        onUpdate();
        continue;
      }
      if (!pingSupported) {
        peer.reachable = true;
        onUpdate();
        continue;
      }
      const result = await pingHost(target);
      if (result === null) {
        pingSupported = false;
        peer.reachable = true;
      } else {
        peer.reachable = result;
      }
      onUpdate();
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
}

const SSH_KEY_PATH = join(HOME_DIR, ".ssh", "id_ed25519");
const SSH_KEY_PUB_PATH = join(HOME_DIR, ".ssh", "id_ed25519.pub");

function ensureSshKey(): boolean {
  if (existsSync(SSH_KEY_PUB_PATH)) return true;
  const sshDir = join(HOME_DIR, ".ssh");
  mkdirSync(sshDir, { recursive: true });
  const proc = Bun.spawnSync(["ssh-keygen", "-t", "ed25519", "-f", SSH_KEY_PATH, "-N", ""], {
    stdout: "ignore",
    stderr: "ignore",
  });
  return proc.exitCode === 0;
}

function testSshKeyAuth(host: string, user: string): boolean {
  const target = `${user}@${host}`;
  const proc = Bun.spawnSync(
    ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5", "-o", "StrictHostKeyChecking=no", target, "echo", "ok"],
    {
      stdout: "pipe",
      stderr: "ignore",
    },
  );
  return proc.exitCode === 0;
}

function hasCommand(cmd: string): boolean {
  const tool = process.platform === "win32" ? "where" : "which";
  const proc = Bun.spawnSync([tool, cmd], { stdout: "ignore", stderr: "ignore" });
  return proc.exitCode === 0;
}

function copySshKey(host: string, user: string, password: string): boolean {
  if (!hasCommand("sshpass")) {
    eprint("sshpass is required to copy SSH key. Install it with: brew install hudochenkov/sshpass/sshpass");
    return false;
  }
  const target = `${user}@${host}`;
  const proc = Bun.spawnSync(
    ["sshpass", "-p", password, "ssh-copy-id", "-o", "StrictHostKeyChecking=no", "-i", SSH_KEY_PUB_PATH, target],
    {
      stdout: "ignore",
      stderr: "ignore",
    },
  );
  return proc.exitCode === 0;
}

function openScreenSharing(host: string, user?: string, password?: string): void {
  if (!host) {
    eprint("No host found for that device.");
    process.exit(1);
  }
  if (process.platform !== "darwin") {
    eprint("Screen mode is only supported on macOS.");
    process.exit(1);
  }
  let url: string;
  if (user && password) {
    url = `vnc://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}?quality=high`;
  } else {
    url = `vnc://${host}?quality=high`;
  }
  Bun.spawn(["open", url]);
}

function openSsh(host: string, user?: string, directory?: string): void {
  if (!host) {
    eprint("No host found for that device.");
    process.exit(1);
  }
  const target = user ? `${user}@${host}` : host;
  const command = buildSshDirectoryCommand(directory);
  if (!command) {
    Bun.spawnSync(["ssh", "-t", target], {
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    return;
  }
  Bun.spawnSync(["ssh", "-t", target, command], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
}

function resolveRemoteDirectory(host: string, user: string | undefined, directory: string | undefined): string {
  const requested = directory?.trim() || "~";
  const target = user ? `${user}@${host}` : host;
  const command = `cd -- ${remoteDirectoryArg(requested)} 2>/dev/null || cd ~; pwd -P`;
  const proc = Bun.spawnSync(
    ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=8", "-o", "StrictHostKeyChecking=no", target, command],
    {
      stdout: "pipe",
      stderr: "ignore",
    },
  );
  if (proc.exitCode !== 0) return requested;
  const resolved = new TextDecoder().decode(proc.stdout).trim();
  return resolved || requested;
}

function encodeRemoteUriPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized
    .split("/")
    .map((segment, index) => (index === 0 ? "" : encodeURIComponent(segment)))
    .join("/");
}

function buildCursorFolderUri(target: string, remoteDirectory: string): string {
  const authority = `ssh-remote+${encodeURIComponent(target)}`;
  return `vscode-remote://${authority}${encodeRemoteUriPath(remoteDirectory)}`;
}

function openCursor(host: string, user: string | undefined, directory: string | undefined): void {
  if (!host) {
    eprint("No host found for that device.");
    process.exit(1);
  }
  if (!hasCommand("cursor")) {
    eprint("Cursor CLI not found. Install Cursor and run 'Install \"cursor\" command' from Cursor command palette.");
    process.exit(1);
  }
  const target = user ? `${user}@${host}` : host;
  const requested = directory?.trim() || "~";
  const remoteDirectory = resolveRemoteDirectory(host, user, directory);
  if (remoteDirectory.startsWith("/")) {
    const folderUri = buildCursorFolderUri(target, remoteDirectory);
    Bun.spawn(["cursor", "--folder-uri", folderUri, "--new-window"], {
      stdout: "ignore",
      stderr: "ignore",
    });
    return;
  }
  Bun.spawn(["cursor", "--remote", `ssh-remote+${target}`, requested, "--new-window"], {
    stdout: "ignore",
    stderr: "ignore",
  });
}

function ping(host: string): void {
  if (!host) {
    eprint("No host found for that device.");
    process.exit(1);
  }
  Bun.spawn(["ping", "-c", "5", host]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App Component - Single render, state-driven pages
// ─────────────────────────────────────────────────────────────────────────────

type DirectoryMode = Extract<Mode, "ssh" | "cursor">;
type Page =
  | { type: "picker" }
  | { type: "auth"; peer: Peer; mode: Mode }
  | { type: "directory"; peer: Peer; user: string; mode: DirectoryMode };

type ExitResult =
  | { type: "cancel" }
  | { type: "action"; peer: Peer; mode: Mode; user?: string; password?: string; directory?: string };

type AppProps = {
  peers: Peer[];
  cursorAvailable: boolean;
  screenAvailable: boolean;
  onExit: (result: ExitResult) => void;
};

function App({ peers, cursorAvailable, screenAvailable, onExit }: AppProps): JSX.Element | null {
  const [page, setPage] = useState<Page>({ type: "picker" });
  const [peersList, setPeersList] = useState(peers);
  const mountedRef = useRef(true);

  // Start availability checks
  useEffect(() => {
    mountedRef.current = true;
    void startAvailabilityChecks(peers, () => {
      if (!mountedRef.current) return;
      setPeersList((current) => [...current]);
    });
    return () => {
      mountedRef.current = false;
    };
  }, [peers]);

  const handleSelect = (peer: Peer, mode: Mode) => {
    // Ping doesn't need auth
    if (mode === "ping") {
      onExit({ type: "action", peer, mode });
      return;
    }
    if (mode === "vnc" && (!screenAvailable || osName(peer.os || "") !== "macos")) {
      process.stdout.write("\x07");
      return;
    }

    const settings = loadSettings();
    const key = machineKey(peer);
    const entry = settings.machines[key];

    // For SSH/Cursor, check if key auth already works
    if (mode === "ssh" || mode === "cursor") {
      if (!ensureSshKey()) {
        eprint("Failed to generate SSH key");
        onExit({ type: "cancel" });
        return;
      }

      if (entry?.sshUser && testSshKeyAuth(peer.shortName, entry.sshUser)) {
        setPage({ type: "directory", peer, user: entry.sshUser, mode });
        return;
      }
    }

    // For VNC, check if we have stored credentials
    if (mode === "vnc" && entry?.sshUser && entry?.sshPassword) {
      onExit({ type: "action", peer, mode, user: entry.sshUser, password: entry.sshPassword });
      return;
    }

    // Need auth for SSH/Cursor (to copy key) and VNC (to connect)
    setPage({ type: "auth", peer, mode });
  };

  const handleAuthSubmit = (user: string, password: string) => {
    if (page.type !== "auth") return;
    const { peer, mode } = page;

    // For SSH/Cursor, copy the key
    if (mode === "ssh" || mode === "cursor") {
      process.stdout.write(`${ANSI.dim}Copying SSH key to ${peer.shortName}...${ANSI.reset}\n`);
      if (!copySshKey(peer.shortName, user, password)) {
        eprint("Failed to copy SSH key. Check your password and try again.");
        onExit({ type: "cancel" });
        return;
      }
    }

    // Store credentials (password stored for VNC use)
    const settings = loadSettings();
    const key = machineKey(peer);
    const existing = settings.machines[key] ?? defaultMachineSettings();
    settings.machines[key] = {
      ...existing,
      sshUser: user,
      sshPassword: password,
      updatedAt: nowIso(),
    };
    saveSettings(settings);

    if (mode === "ssh" || mode === "cursor") {
      setPage({ type: "directory", peer, user, mode });
      return;
    }

    onExit({ type: "action", peer, mode, user, password });
  };

  const handleAuthBack = () => {
    setPage({ type: "picker" });
  };

  const handleDirectorySubmit = (directory: string) => {
    if (page.type !== "directory") return;
    const { peer, user, mode } = page;
    const trimmed = directory.trim();

    if (trimmed) {
      const settings = loadSettings();
      const key = machineKey(peer);
      const existing = settings.machines[key] ?? defaultMachineSettings();
      settings.machines[key] = {
        ...existing,
        sshUser: user || existing.sshUser,
        recentDirs: addRecentDirectory(existing.recentDirs, trimmed),
        updatedAt: nowIso(),
      };
      saveSettings(settings);
    }

    onExit({
      type: "action",
      peer,
      mode,
      user,
      directory: trimmed,
    });
  };

  const handleDirectoryBack = () => {
    setPage({ type: "picker" });
  };

  if (page.type === "picker") {
    return (
      <Picker
        version={VERSION}
        peers={peersList}
        cursorAvailable={cursorAvailable}
        screenAvailable={screenAvailable}
        onSelect={handleSelect}
        onCancel={() => onExit({ type: "cancel" })}
        _onTick={() => setPeersList([...peersList])}
      />
    );
  }

  if (page.type === "auth") {
    const settings = loadSettings();
    const key = machineKey(page.peer);
    const existingUser = settings.machines[key]?.sshUser ?? "";

    return (
      <Authenticate
        version={VERSION}
        peer={page.peer}
        existingUser={existingUser}
        onSubmit={handleAuthSubmit}
        onBack={handleAuthBack}
        onCancel={() => onExit({ type: "cancel" })}
      />
    );
  }

  if (page.type === "directory") {
    const settings = loadSettings();
    const key = machineKey(page.peer);
    const recentDirs = settings.machines[key]?.recentDirs ?? [];

    return (
      <Directory
        version={VERSION}
        peer={page.peer}
        mode={page.mode}
        recentDirs={recentDirs}
        onSubmit={handleDirectorySubmit}
        onBack={handleDirectoryBack}
        onCancel={() => onExit({ type: "cancel" })}
      />
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback for non-TTY
// ─────────────────────────────────────────────────────────────────────────────

async function promptLine(question: string): Promise<string> {
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer;
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

async function promptFallback(peers: Peer[]): Promise<Peer | null> {
  process.stdout.write(`\n`);
  peers.forEach((peer) => {
    const os = osName(peer.os || "");
    const suffix = os ? ` ${os}` : "";
    const name = peer.shortName + (peer.selfPeer ? " (self)" : "");
    const disabled = isDisabled(peer) ? " (unavailable)" : "";
    process.stdout.write(`${name}${suffix}${disabled}\n`);
  });

  while (true) {
    const answer = await promptLine("\nSelect a machine by name (blank to quit): ");
    const raw = answer.trim();
    if (!raw) return null;
    const matches = peers.filter(
      (p) => p.shortName.toLowerCase().includes(raw.toLowerCase()) || p.name.toLowerCase().includes(raw.toLowerCase()),
    );
    if (matches.length === 1) {
      if (isDisabled(matches[0])) {
        process.stdout.write("That machine is unavailable.\n");
        continue;
      }
      return matches[0];
    }
    if (matches.length === 0) process.stdout.write("No matches. Try again.\n");
    else {
      process.stdout.write("Multiple matches:\n");
      for (const p of matches) {
        process.stdout.write(`  ${String(p.idx).padStart(2, " ")} ${p.shortName}\n`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<number> {
  const { includeOffline } = parseArgs();
  const status = runTailscaleStatus();
  const settings = loadSettings();
  const peers = sortPeersByRecency(extractPeers(status, includeOffline), settings);
  const cursorAvailable = hasCommand("cursor");
  const screenAvailable = process.platform === "darwin";
  if (peers.length === 0) {
    process.stdout.write("No peers found.\n");
    return 1;
  }

  // Non-TTY fallback
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    const peer = await promptFallback(peers);
    if (!peer) return 0;

    if (isDisabled(peer)) {
      process.stdout.write(`${ANSI.dim}Selected device is unavailable.${ANSI.reset}\n`);
      return 1;
    }

    const host = peer.shortName;
    openSsh(host);
    return 0;
  }

  // TTY - run Ink app
  const result = await new Promise<ExitResult>((resolve) => {
    const app = render(
      <App
        peers={peers}
        cursorAvailable={cursorAvailable}
        screenAvailable={screenAvailable}
        onExit={(result) => {
          app.unmount();
          resolve(result);
        }}
      />,
      { exitOnCtrlC: false },
    );
  });

  // Handle result after Ink is fully unmounted (terminal restored)
  if (result.type === "cancel") {
    return 0;
  }

  const { peer, mode, user, password, directory } = result;
  markMachineUsed(peer, mode, user, password, directory);
  const host = mode === "ssh" || mode === "cursor" ? peer.shortName : preferredHost(peer) || peer.ip;

  if (mode === "vnc") {
    openScreenSharing(host, user, password);
  } else if (mode === "ssh") {
    openSsh(host, user, directory);
  } else if (mode === "cursor") {
    openCursor(host, user, directory);
  } else {
    ping(host);
  }

  return 0;
}

if (import.meta.main) {
  const code = await main();
  process.exit(code);
}
