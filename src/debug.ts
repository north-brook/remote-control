import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

type DebugValue = null | boolean | number | string | DebugValue[] | { [key: string]: DebugValue };

const REDACTED = "<redacted>";
const REDACT_KEYS = ["auth", "cookie", "password", "secret", "token"];

let enabled = false;
let logPath = "";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDebugEnvEnabled(value: string | undefined): boolean {
  if (!value) return false;
  return !/^(0|false|no|off)$/i.test(value.trim());
}

function sanitizeDebugValue(value: unknown, keyHint = ""): DebugValue {
  const lowerKey = keyHint.toLowerCase();
  if (REDACT_KEYS.some((key) => lowerKey.includes(key))) return REDACTED;
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeDebugValue(item));
  if (isObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeDebugValue(item, key)]));
  }
  return String(value);
}

function formatDebugLine(event: string, data?: Record<string, unknown>): string {
  const payload = data ? ` ${JSON.stringify(sanitizeDebugValue(data))}` : "";
  return `${new Date().toISOString()} ${event}${payload}`;
}

export function initDebugLogging(path: string, requested: boolean, argv: string[]): boolean {
  enabled = requested || isDebugEnvEnabled(process.env.RC_DEBUG);
  logPath = path;
  if (!enabled) return false;
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(
    path,
    `${formatDebugLine("debug.start", {
      argv,
      logPath: path,
      pid: process.pid,
      rcDebugEnv: process.env.RC_DEBUG || "",
    })}\n`,
    "utf8",
  );
  return true;
}

export function debugLog(event: string, data?: Record<string, unknown>): void {
  if (!enabled || !logPath) return;
  const line = formatDebugLine(event, data);
  appendFileSync(logPath, `${line}\n`, "utf8");
  process.stderr.write(`[rc debug] ${line}\n`);
}

export function getDebugLogPath(): string {
  return logPath;
}

export function isDebugEnabled(): boolean {
  return enabled;
}

export function redactDebugValue(value: unknown): DebugValue {
  return sanitizeDebugValue(value);
}
