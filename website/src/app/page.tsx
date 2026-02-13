"use client";

import { useState } from "react";
import Image from "next/image";

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-sm tracking-tight">Remote Control</span>
        <a
          href="https://github.com/north-brook/remote-control"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
      </div>
    </header>
  );
}

function CopyButton() {
  const [copied, setCopied] = useState(false);
  const command = "curl -fsSL https://remotecontrol.sh/install | bash";
  const displayCommand = "curl -fsSL remotecontrol.sh/install | bash";

  return (
    <div className="inline-flex w-full max-w-2xl">
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-5 py-4 font-mono text-sm sm:text-base w-full">
        <span className="text-zinc-500 select-none">$</span>
        <code className="flex-1 text-zinc-200 overflow-x-auto whitespace-nowrap">
          {displayCommand}
        </code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer bg-white/10 hover:bg-white/20 text-zinc-300"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
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
      <Header />
      <main className="max-w-4xl mx-auto">
        {/* Hero */}
        <section className="px-6 pt-24 pb-16 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-500 mb-8">
            <span className="text-emerald-400">●</span>
            Open source · Tailscale-powered · macOS &amp; Linux
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Check on your machines<br />in seconds.
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
            SSH, screen share, or open Cursor on any machine in your Tailscale
            network — one command, zero config.
          </p>

          {/* Install */}
          <div className="flex justify-center">
            <CopyButton />
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
            <span>Go</span>
          </div>
        </section>

        {/* Preview */}
        <section className="px-6 pb-20">
          <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
            <Image
              src="/preview.png"
              alt="rc terminal UI showing machine picker"
              width={1200}
              height={700}
              className="w-full h-auto"
              priority
            />
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
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                ),
                title: "Terminal",
                desc: "SSH into any machine. Keys are generated and distributed automatically — just pick a machine and you're in.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                ),
                title: "Screen",
                desc: "See and control remote desktops via macOS Screen Sharing. One keypress to connect, passwords saved locally.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                ),
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
            <span>✦ Auto-updating</span>
            <span>✦ Credential caching</span>
            <span>✦ Tailscale-powered discovery</span>
            <span>✦ Zero config networking</span>
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

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
            <a
              href="https://github.com/north-brook/remote-control"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
            <span>·</span>
            <a
              href="https://northbrook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              North Brook
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
