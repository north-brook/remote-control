# rc

Instant terminal and screen sharing access to remote machines.

Built for monitoring servers running autonomous agents—when you need to check on what an agent is doing, `rc` gets you there in seconds.

![preview](preview.png)

## How it works

`rc` connects to your [Tailscale](https://tailscale.com) network, shows all your machines in an interactive picker, and launches a connected terminal (SSH), virtual screen (VNC), or Cursor Remote SSH session with a single keypress. In Cursor mode, `rc` asks for an optional starting directory before connecting. Terminal mode opens directly in `~`. Credentials are cached so subsequent connections are instant.

## Requirements

- [Tailscale](https://tailscale.com) installed and logged in on all machines
- [Cursor](https://cursor.com/) installed locally if you want to use Cursor mode
- Cursor Remote SSH extension installed in Cursor (search for `Anysphere Remote SSH`)

## Remote Machine Setup

Enable these on each machine you want to connect to:

**macOS:**
1. **Remote Login (SSH):** System Settings → General → Sharing → Remote Login → Enable
2. **Screen Sharing (VNC):** System Settings → General → Sharing → Screen Sharing → Enable

**Linux:**
1. **SSH:** Usually enabled by default. If not: `sudo systemctl enable --now sshd`

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
- **Tab** - switch between available modes (terminal, screen, cursor)
- **/** - open search, then type to filter machines
- **Esc** - close search (if open) or quit

Directory screen (cursor mode):
- **Type a path** - start Cursor in that directory (for example `~/project`)
- **Arrow keys** - choose a recent directory
- **Tab** - switch between path input and recents list
- **Delete/Backspace** - remove the selected recent directory
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
- Cursor mode launches your local Cursor app using Remote SSH (`cursor --remote ...`).
- Cursor mode is only shown when the `cursor` CLI command is installed.
- Screen mode is only shown when both machines are macOS (your local machine and the selected target machine).
- Machines are sorted by most recently used connection.

## Troubleshooting

- If you see "tailscale not found", install Tailscale and login once.
- If no peers appear, run `tailscale status` to verify connectivity.
- If the UI doesn't render, run in a TTY (not in a non-interactive shell).
