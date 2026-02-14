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
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-0 border border-white/10 rounded-t-lg overflow-hidden bg-white/5">
        {(["curl", "git"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-mono cursor-pointer transition-colors ${
              tab === t
                ? "bg-white/10 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "curl" ? "One-liner" : "Manual"}
          </button>
        ))}
      </div>
      <div className="relative flex items-start bg-white/5 border border-t-0 border-white/10 rounded-b-lg px-5 py-4 font-mono text-sm sm:text-base min-w-0 w-full">
        <span className="text-zinc-500 shrink-0 mr-3 leading-relaxed">$</span>
        <pre className="select-all whitespace-pre pr-20 leading-relaxed text-zinc-200 text-left">{commands[tab]}</pre>
        <div className="absolute right-3 top-3 sm:top-4">
          <CopyButton text={commands[tab]} />
        </div>
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
            Check on your machines<br />in seconds.
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
            SSH, screen share, or open Cursor on any machine in your Tailscale
            network — one command, zero config.
          </p>

          {/* Install */}
          <div className="flex justify-center">
            <InstallWidget />
          </div>

          {/* Meta line */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500">
            <a
              href="https://github.com/north-brook/remote-control"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              GitHub ↗
            </a>
            <span>·</span>
            <span>macOS &amp; Linux</span>
            <span>·</span>
            <span>TypeScript</span>
          </div>
        </section>

        {/* Preview */}
        <section className="px-6 pb-20">
          <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto"
              poster="/preview.png"
            >
              <source src="/hero-demo.webm" type="video/webm" />
              <source src="/hero-demo.mp4" type="video/mp4" />
            </video>
          </div>
        </section>

        {/* Why */}
        <section className="px-6 pb-24">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
            <h2 className="text-xl font-bold mb-4">Why Remote Control?</h2>
            <p className="text-zinc-400 leading-relaxed">
              You&apos;ve got agents running on servers, builds happening on remote
              machines, services spread across your network. When something needs
              your attention, you shouldn&apos;t have to remember hostnames, find
              SSH keys, or configure VNC.
            </p>
            <p className="mt-4 text-zinc-300 font-medium">
              Just type <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-sm">rc</code>.
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
                icon: <Terminal className="w-5 h-5" />,
                title: "Terminal",
                desc: "SSH into any machine. Keys are generated and distributed automatically — just pick a machine and you're in.",
              },
              {
                icon: <Monitor className="w-5 h-5" />,
                title: "Screen",
                desc: "See and control remote desktops via macOS Screen Sharing. One keypress to connect, passwords saved locally.",
              },
              {
                icon: <Code className="w-5 h-5" />,
                title: "Cursor",
                desc: "Launch Cursor with Remote SSH. Pick a starting directory or recent project and start coding immediately.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors"
              >
                <div className="inline-flex items-center justify-center mb-3 text-zinc-500 bg-white/10 rounded-md p-2">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1.5"><Sparkle className="w-3.5 h-3.5" /> Auto-updating</span>
            <span className="inline-flex items-center gap-1.5"><Sparkle className="w-3.5 h-3.5" /> Credential caching</span>
            <span className="inline-flex items-center gap-1.5"><Sparkle className="w-3.5 h-3.5" /> Tailscale-powered discovery</span>
            <span className="inline-flex items-center gap-1.5"><Sparkle className="w-3.5 h-3.5" /> Zero config networking</span>
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
                className="flex items-center justify-between px-6 py-4"
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
    </>
  );
}
