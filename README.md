# rc

Instant terminal and screen sharing access to remote machines.

Built for monitoring servers running autonomous agents—when you need to check on what an agent is doing, `rc` gets you there in seconds.

![preview](preview.png)

## How it works

`rc` connects to your [Tailscale](https://tailscale.com) network, shows all your machines in an interactive picker, and launches SSH or VNC with a single keypress. Credentials are cached so subsequent connections are instant.

## Requirements

- `tailscale` installed and logged in
- `bun`

## Install

One-liner:

```bash
git clone https://github.com/brycedbjork/rc && cd rc && ./install.sh
```

The installer uses `bun link`. If `rc` isn't on your PATH after install, add your bun bin directory (usually `~/.bun/bin`).

## Usage

```bash
rc
```

Options:

- `--all` include offline machines

## Keyboard Shortcuts

- **Arrow keys** - navigate the machine list
- **Enter** - connect to selected machine
- **Tab** - switch between terminal (SSH) and screen (VNC) modes
- **/** - open search, then type to filter machines
- **Esc** - close search (if open) or quit

## Credentials

When connecting via SSH or VNC for the first time, `rc` will prompt for your username and password.

For SSH connections, `rc` automatically:
1. Generates an SSH key (`~/.ssh/id_ed25519`) if one doesn't exist
2. Copies your public key to the remote machine using `ssh-copy-id`
3. Stores your username for future connections

For VNC connections, credentials are stored for automatic login.

All credentials are saved locally in `~/.rc/settings.json` (plaintext, not synced).

## Notes

- On macOS, `rc` opens the built-in Screen Sharing app via `vnc://`.
- On Linux, it uses `xdg-open` if available.

## Troubleshooting

- If you see "tailscale not found", install Tailscale and login once.
- If no peers appear, run `tailscale status` to verify connectivity.
- If the UI doesn't render, run in a TTY (not in a non-interactive shell).
- SSH key copying requires `sshpass`. Install with: `brew install hudochenkov/sshpass/sshpass`