"use client";

import { useState } from "react";
import { Terminal, Monitor, Code, Sparkle, Copy, Check } from "lucide-react";
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-white/10 bg-white/5 hover:border-emerald-400/50 hover:text-emerald-400 transition-colors cursor-pointer text-zinc-400"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

function InstallWidget() {
  const [tab, setTab] = useState<"curl" | "git">("curl");
  const commands = {
    curl: "curl -fsSL https://remotecontrol.sh/install | bash",
    git: "git clone https://github.com/north-brook/remote-control \\\n  && cd remote-control \\\n  && bun install && bun link",
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex gap-0 border border-white/10 rounded-t-lg overflow-hidden bg-white/5">
        {(["curl", "git"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-mono cursor-pointer transition-colors ${
              tab === t
                ? "bg-white/10 text-emerald-400 border-b-2 border-emerald-400"
                : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"
            }`}
          >
            {t === "curl" ? "One-liner" : "Manual"}
          </button>
        ))}
      </div>
      <div className="flex items-center bg-white/5 border border-t-0 border-white/10 rounded-b-lg px-5 py-4 font-mono text-sm sm:text-base min-w-0 w-full gap-4">
        <span className="text-zinc-500 shrink-0 leading-relaxed">$</span>
        <pre className="select-all whitespace-pre leading-relaxed text-zinc-200 text-left flex-1 min-w-0">{commands[tab]}</pre>
        <CopyButton text={commands[tab]} />
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-md bg-white/10 border border-white/10 font-mono text-xs text-zinc-300">
      {children}
    </kbd>
  );
}

export default function Home() {
  return (
    <>
      <main className="max-w-4xl mx-auto">
        {/* Hero */}
        <section className="px-6 pt-24 pb-16 text-center">
          {/* Pill badge */}
          <a
            href="https://github.com/north-brook/remote-control"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-500 mb-8 hover:border-emerald-400/50 hover:text-zinc-300 transition-colors"
          >
            <span className="text-emerald-400">●</span>
            Open source ↗
          </a>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Check on your machines<br /><span className="text-emerald-gradient">in seconds.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
            SSH, screen share, or open Cursor on any machine in your Tailscale
            network — one command, zero config.
          </p>

          {/* Install */}
          <div className="flex justify-center">
            <InstallWidget />
          </div>

        </section>


        {/* Why */}
        <section className="px-6 pb-24">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4">
            Why Remote Control?
          </h2>
          <p className="text-sm text-zinc-500 text-center mb-12">You shouldn&apos;t have to fight your tools to check on a machine.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { pain: "Remembering hostnames", fix: "Pick from a list" },
              { pain: "Hunting for SSH keys", fix: "Keys auto-generated" },
              { pain: "Configuring VNC clients", fix: "One keypress to connect" },
              { pain: "Setting up Cursor SSH", fix: "Choose a directory and go" },
            ].map((item) => (
              <div
                key={item.pain}
                className="rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4"
              >
                <p className="text-zinc-500 line-through decoration-zinc-600 text-sm mb-1.5">{item.pain}</p>
                <p className="text-zinc-200 text-sm font-medium">{item.fix}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-2xl sm:text-3xl font-bold">
              Just type <code className="font-mono text-emerald-gradient px-1">rc</code>.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-24">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
            Three ways to connect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Terminal className="w-8 h-8" />,
                title: "Terminal",
                desc: "SSH into any machine. Keys are generated and distributed automatically — just pick a machine and you're in.",
              },
              {
                icon: <Monitor className="w-8 h-8" />,
                title: "Screen",
                desc: "See and control remote desktops via macOS Screen Sharing. One keypress to connect, passwords saved locally.",
              },
              {
                icon: <Code className="w-8 h-8" />,
                title: "Cursor",
                desc: "Launch Cursor with Remote SSH. Pick a starting directory or recent project and start coding immediately.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 hover:bg-white/[0.04] hover:border-emerald-400/20 transition-all"
              >
                <div className="inline-flex items-center justify-center mb-5 text-emerald-400 bg-emerald-400/10 rounded-lg p-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-zinc-500">
            {["Auto-updating", "Credential caching", "Tailscale-powered discovery", "Zero config networking"].map((label) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2">
                <Sparkle className="w-3.5 h-3.5 text-emerald-400/60" /> {label}
              </span>
            ))}
          </div>
        </section>

        {/* Works With */}
        <section className="px-6 pb-24">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-zinc-500">
            <span className="text-zinc-600 text-xs uppercase tracking-wider font-medium">Works with</span>
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 2.69 3 6H9c0-3.31 1.34-6 3-6zm-7 7h4.02c.02.33.02.66.02 1s0 .67-.02 1H5.07A7.02 7.02 0 015 12zm2.93 5h2.54A9.07 9.07 0 0112 19c-.54 0-1.07-.31-1.56-.85A12.45 12.45 0 017.93 17zM12 19c-1.66 0-3-2.69-3-6h6c0 3.31-1.34 6-3 6zm7-7h-4.02c.02-.33.02-.66.02-1s0-.67-.02-1H19a7.02 7.02 0 01-.07 2z" fill="currentColor"/>
              </svg>
              Tailscale
            </span>
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.74 4.2L12 6l-1.74-1.8A5.68 5.68 0 006 2.5 5.5 5.5 0 00.5 8c0 5.04 5.28 8.86 11 14.08L12 22.5l.5-.42C18.22 16.86 23.5 13.04 23.5 8A5.5 5.5 0 0018 2.5a5.68 5.68 0 00-4.26 1.7z" fill="currentColor"/>
              </svg>
              Cursor
            </span>
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.83 9.28 4.8C10.56 4.78 11.78 5.68 12.57 5.68C13.36 5.68 14.85 4.58 16.4 4.74C17.07 4.77 18.89 5.02 20.06 6.7C19.95 6.77 17.62 8.12 17.65 10.97C17.68 14.36 20.56 15.53 20.59 15.54C20.56 15.63 20.12 17.17 18.71 19.5zM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5z" fill="currentColor"/>
              </svg>
              macOS Screen Sharing
            </span>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="max-w-2xl mx-auto px-6 pb-24">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-2">
            Keyboard-first
          </h2>
          <p className="text-sm text-zinc-500 text-center mb-12">Every action is a keypress away.</p>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden divide-y divide-white/5">
            {[
              { keys: "↑ ↓", action: "Navigate machines" },
              { keys: "Enter", action: "Connect" },
              { keys: "Tab", action: "Cycle through machines" },
              { keys: "⇧Tab", action: "Switch mode (terminal / screen / cursor)" },
              { keys: "/", action: "Search" },
              { keys: "Esc", action: "Close search or quit" },
            ].map((s) => (
              <div
                key={s.keys}
                className="flex items-center justify-between px-4 sm:px-6 py-4"
              >
                <span className="text-sm text-zinc-400">{s.action}</span>
                <Kbd>{s.keys}</Kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="max-w-2xl mx-auto px-6 pb-24">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
            Requirements
          </h2>
          <div className="space-y-4">
            {[
              {
                name: "Tailscale",
                note: "Installed and logged in on all machines",
                required: true,
              },
              {
                name: "Remote Login (SSH)",
                note: "Enabled on target machines",
                required: true,
              },
              {
                name: "Screen Sharing (VNC)",
                note: "macOS only — enable in System Settings → Sharing",
                required: false,
              },
              {
                name: "Cursor",
                note: "Optional — needed for Cursor Remote SSH mode",
                required: false,
              },
            ].map((r) => (
              <div
                key={r.name}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4"
              >
                <span
                  className={`mt-0.5 text-xs font-mono px-2 py-0.5 rounded-full ${
                    r.required
                      ? "bg-white/10 text-zinc-300"
                      : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {r.required ? "required" : "optional"}
                </span>
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>Built by North Brook</span>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/north-brook/remote-control"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="/blog"
              className="hover:text-emerald-400 transition-colors"
            >
              Blog
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
