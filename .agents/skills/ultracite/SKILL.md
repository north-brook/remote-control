---
name: ultracite
description: Configure Biome linting/formatting and Husky pre-commit hooks via Ultracite.
---

# Ultracite

Ultracite sets up Biome (linter + formatter) and Husky (git hooks) in one command.

## Setup

```bash
cd ~/Projects/<name>
bun x ultracite@latest init
```

When prompted, select:
- **Linter/Formatter:** Biome
- **Framework:** React + Next.js
- **Editor:** VSCode/Cursor
- **Git hooks:** Husky

This creates/updates: `biome.json`, `.husky/pre-commit`, and adds scripts to `package.json`.

## Pre-commit Hook

Update `.husky/pre-commit` to run all checks:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx biome check --write .
bun run tsc --noEmit
bun test
```

## biome.json Basics

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": { "quoteStyle": "single" }
  }
}
```

Override rules as needed under `linter.rules`.

## Manual Commands

```bash
bun run lint          # biome check (lint + format check)
bun run format        # biome format --write .
bunx biome check --write .   # Fix all auto-fixable issues
bunx biome ci .              # CI mode (no writes, exit 1 on issues)
```

## package.json Scripts

Ensure these exist:

```json
{
  "scripts": {
    "lint": "biome check .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit"
  }
}
```
