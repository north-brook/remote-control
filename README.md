# rc

`rc` is a tiny Tailscale helper that lets you quickly open SSH or Screen Sharing to machines on your tailnet.

It reads `tailscale status --json`, presents a rich interactive picker, and launches the action you choose for the selected host.

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
- `--mode vnc|ssh|ping` skip mode switching

## UI Tips

- Press `Tab` to switch between terminal (ssh) and screen (vnc).
- Type to filter the list in real time.
- Use arrow keys to move the selection.
- Press `Enter` to open, `Esc` to quit.

## Notes

- On macOS, `rc` opens the built-in Screen Sharing app via `vnc://`.
- On Linux, it uses `xdg-open` if available.
- SSH credentials are stored locally in `.rc/settings.json` (gitignored, plaintext).

## Troubleshooting

- If you see "tailscale not found", install Tailscale and login once.
- If no peers appear, run `tailscale status` to verify connectivity.
- If the UI doesn't render, run in a TTY (not in a non-interactive shell).
