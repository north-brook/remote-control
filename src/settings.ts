export type MachineSettings = {
  sshUser: string;
  sshPassword: string;
  recentDirs: string[];
  lastCursorDirectory: string;
  updatedAt: string;
};

export type RcSettings = {
  version: number;
  machines: Record<string, MachineSettings>;
  lastMachineKey: string;
  lastMode: "ssh" | "vnc" | "cursor" | "ping";
  createdAt: string;
  updatedAt: string;
};

export const SETTINGS_VERSION = 1;
export const MAX_RECENT_DIRS = 10;

export function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeRecentDirs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    out.push(trimmed);
    seen.add(trimmed);
    if (out.length >= MAX_RECENT_DIRS) break;
  }
  return out;
}

export function defaultMachineSettings(): MachineSettings {
  return {
    sshUser: "",
    sshPassword: "",
    recentDirs: [],
    lastCursorDirectory: "",
    updatedAt: nowIso(),
  };
}

export function normalizeMachineSettings(value: unknown): MachineSettings {
  const entry = typeof value === "object" && value ? (value as Record<string, unknown>) : {};
  const defaults = defaultMachineSettings();
  return {
    sshUser: typeof entry.sshUser === "string" ? entry.sshUser : defaults.sshUser,
    sshPassword: typeof entry.sshPassword === "string" ? entry.sshPassword : defaults.sshPassword,
    recentDirs: normalizeRecentDirs(entry.recentDirs),
    lastCursorDirectory: typeof entry.lastCursorDirectory === "string" ? entry.lastCursorDirectory : defaults.lastCursorDirectory,
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : defaults.updatedAt,
  };
}

export function normalizeSettings(raw: unknown): RcSettings {
  const defaults = {
    version: SETTINGS_VERSION,
    machines: {},
    lastMachineKey: "",
    lastMode: "ssh" as const,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  if (!raw || typeof raw !== "object") return defaults;

  const obj = raw as Record<string, unknown>;
  if (obj.version !== SETTINGS_VERSION) return defaults;

  const rawMachines = typeof obj.machines === "object" && obj.machines ? obj.machines : {};
  const machines: Record<string, MachineSettings> = {};
  for (const [key, entry] of Object.entries(rawMachines)) {
    machines[key] = normalizeMachineSettings(entry);
  }

  return {
    version: SETTINGS_VERSION,
    machines,
    lastMachineKey: typeof obj.lastMachineKey === "string" ? obj.lastMachineKey : defaults.lastMachineKey,
    lastMode: obj.lastMode === "vnc" || obj.lastMode === "cursor" || obj.lastMode === "ping" ? obj.lastMode : "ssh",
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : nowIso(),
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : nowIso(),
  };
}

export function addRecentDirectory(existing: string[], directory: string): string[] {
  const trimmed = directory.trim();
  if (!trimmed) return existing;
  const deduped = existing.filter((item) => item !== trimmed);
  return [trimmed, ...deduped].slice(0, MAX_RECENT_DIRS);
}
