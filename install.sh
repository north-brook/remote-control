#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check for bun
if ! command -v bun >/dev/null 2>&1; then
  echo "bun not found. Install it from https://bun.sh" >&2
  exit 1
fi

# Install sshpass (required for SSH key copying)
if ! command -v sshpass >/dev/null 2>&1; then
  echo "Installing sshpass..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew >/dev/null 2>&1; then
      brew install hudochenkov/sshpass/sshpass
    else
      echo "brew not found. Install sshpass manually or install Homebrew first." >&2
      exit 1
    fi
  elif command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update && sudo apt-get install -y sshpass
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y sshpass
  else
    echo "Could not install sshpass. Please install it manually." >&2
    exit 1
  fi
fi

cd "$ROOT_DIR"
bun install
bun link

if command -v rc >/dev/null 2>&1; then
  echo "Installed rc via bun link."
  exit 0
fi

if bun_bin="$(bun bin 2>/dev/null)"; then
  echo "bun link installed rc into: $bun_bin"
  echo "If rc isn't on your PATH, add:"
  echo "  export PATH=\"$bun_bin:\$PATH\""
  exit 0
fi

echo "bun link completed, but rc is not on your PATH."
echo "Ensure your bun bin directory is on PATH."
