#!/usr/bin/env bash
set -euo pipefail

REPO="https://github.com/brycedbjork/rc.git"
INSTALL_DIR="${HOME}/.rc-app"

# Colors
DIM='\033[2m'
CYAN='\033[36m'
GREEN='\033[32m'
RESET='\033[0m'

step() {
  echo -e "${DIM}▸${RESET} $1"
}

done_step() {
  echo -e "${GREEN}✓${RESET} $1"
}

echo ""
echo -e "${CYAN}rc${RESET} installer"
echo -e "${DIM}Instant terminal and screen sharing access to remote machines.${RESET}"
echo ""

# Install bun if needed
if ! command -v bun >/dev/null 2>&1; then
  step "Installing bun..."
  curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  done_step "Installed bun"
fi

# Install Homebrew on macOS if needed
if [[ "$OSTYPE" == "darwin"* ]] && ! command -v brew >/dev/null 2>&1; then
  step "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" >/dev/null 2>&1
  eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv 2>/dev/null)"
  done_step "Installed Homebrew"
fi

# Install sshpass if needed
if ! command -v sshpass >/dev/null 2>&1; then
  step "Installing sshpass..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install hudochenkov/sshpass/sshpass >/dev/null 2>&1
    done_step "Installed sshpass"
  elif command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update >/dev/null 2>&1 && sudo apt-get install -y sshpass >/dev/null 2>&1
    done_step "Installed sshpass"
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y sshpass >/dev/null 2>&1
    done_step "Installed sshpass"
  else
    echo -e "${DIM}  sshpass skipped. Install manually for SSH key copying.${RESET}"
  fi
fi

# Clone repo if running from curl pipe
if [[ ! -f "$(dirname "$0")/package.json" ]] 2>/dev/null; then
  step "Downloading rc..."
  rm -rf "$INSTALL_DIR"
  git clone --depth 1 -q "$REPO" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  done_step "Downloaded rc"
else
  cd "$(dirname "$0")"
fi

# Install dependencies and link
step "Installing dependencies..."
bun install --silent
bun link --silent 2>/dev/null || bun link >/dev/null 2>&1
done_step "Installed dependencies"

# Check if rc is available
if ! command -v rc >/dev/null 2>&1; then
  BUN_BIN="$(bun pm bin -g 2>/dev/null || echo "$HOME/.bun/bin")"
  export PATH="$BUN_BIN:$PATH"
fi

echo ""
echo -e "${GREEN}✓${RESET} ${CYAN}rc${RESET} installed"
echo ""
echo -e "${DIM}quickstart:${RESET}"
echo ""
echo "  rc              open machine picker"
echo "  rc --all        include offline machines"
echo ""
echo -e "${DIM}shortcuts:${RESET}"
echo ""
echo "  ↑↓              navigate"
echo "  enter           connect"
echo "  tab             toggle ssh/vnc"
echo "  /               search"
echo "  esc             quit"
echo ""
