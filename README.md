# rc

Instant terminal and screen sharing access to remote machines.

Built for monitoring servers running autonomous agents—when you need to check on what an agent is doing, `rc` gets you there in seconds.

![preview](preview.png)

## How it works

`rc` connects to your [Tailscale](https://tailscale.com) network, shows all your machines in an interactive picker, and launches a connected terminal (SSH) or a virtual screen (VNC) with a single keypress. In terminal mode, `rc` asks for an optional starting directory before connecting. Credentials are cached so subsequent connections are instant.

## Requirements

- [Tailscale](https://tailscale.com) installed and logged in on all machines

## Remote Machine Setup

Enable these on each machine you want to connect to:

**macOS:**
1. **Remote Login (SSH):** System Settings → General → Sharing → Remote Login → Enable
2. **Screen Sharing (VNC):** System Settings → General → Sharing → Screen Sharing → Enable

**Linux:**
1. **SSH:** Usually enabled by default. If not: `sudo systemctl enable --now sshd`
2. **VNC:** Install a VNC server like `x11vnc` or `tigervnc`

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/brycedbjork/rc/main/install.sh | bash
```

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

Directory screen (terminal mode):
- **Type a path** - start SSH in that directory (for example `~/project`)
- **Arrow keys** - choose a recent directory
- **Tab** - switch between path input and recents list
- **Enter** - connect (blank input defaults to `~`)
- **Esc** - go back to machine picker

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
