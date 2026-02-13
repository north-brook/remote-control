"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

function CopyButton() {
  const [copied, setCopied] = useState(false);
  const command = "curl -fsSL https://remotecontrol.sh/install | bash";

  return (
    <div className="relative group w-full max-w-2xl">
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-5 py-4 font-mono text-sm sm:text-base">
        <span className="text-zinc-500 select-none">$</span>
        <code className="flex-1 text-zinc-200 overflow-x-auto whitespace-nowrap">
          {command}
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

function GitHubLink() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/north-brook/remote-control")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.stargazers_count === "number") setStars(d.stargazers_count);
      })
      .catch(() => {});
  }, []);

  return (
    <a
      href="https://github.com/north-brook/remote-control"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all backdrop-blur-sm"
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
      {stars !== null && (
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-yellow-500">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
          </svg>
          <span className="font-mono text-xs">{stars}</span>
        </span>
      )}
    </a>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <GitHubLink />
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
            rc
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-zinc-400 leading-relaxed">
            Check on your machines in seconds.
          </p>
          <p className="mt-3 text-sm sm:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
            One command to SSH, screen share, or open Cursor on any machine in your Tailscale network.
          </p>
        </div>

        <div className="mt-10 w-full flex justify-center animate-fade-in-delay">
          <CopyButton />
        </div>
      </section>

      {/* Preview */}
      <section className="flex justify-center px-6 pb-24 animate-fade-in-delay-2">
        <div className="w-full max-w-3xl rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
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
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed">
          You&apos;ve got agents running on servers, builds happening on remote machines, services spread across your network. When something needs your attention, you shouldn&apos;t have to remember hostnames, find SSH keys, or configure VNC.
        </p>
        <p className="mt-4 text-lg sm:text-xl text-zinc-300 font-medium">
          Just type <code className="font-mono">rc</code>.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
          Three ways to connect
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              badge: ">_",
              title: "Terminal",
              desc: "SSH into any machine. Keys are generated and distributed automatically — just pick a machine and you're in.",
            },
            {
              badge: "🖥",
              title: "Screen",
              desc: "See and control remote desktops via macOS Screen Sharing. One keypress to connect, passwords saved locally.",
            },
            {
              badge: "{ }",
              title: "Cursor",
              desc: "Launch Cursor with Remote SSH. Pick a starting directory or recent project and start coding immediately.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors"
            >
              <span className="inline-block mb-3 font-mono text-xs text-zinc-500 bg-white/10 rounded-md px-2 py-1">{f.badge}</span>
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
      <section className="max-w-3xl mx-auto px-6 pb-24">
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
      <section className="max-w-3xl mx-auto px-6 pb-24">
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
      <footer className="border-t border-white/10 py-8 text-center space-x-6">
        <a
          href="https://github.com/north-brook/remote-control"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          GitHub →
        </a>
        <a
          href="https://northbrook.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          North Brook →
        </a>
      </footer>
    </main>
  );
}
