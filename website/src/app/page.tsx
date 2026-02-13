"use client";

import { useState } from "react";
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

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
            rc
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Instant terminal, screen sharing, and Cursor Remote SSH access to
            your Tailscale machines.
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

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Terminal (SSH)",
              desc: "Open an SSH session to any machine. Keys are generated and copied automatically.",
            },
            {
              title: "Screen Sharing (VNC)",
              desc: "View and control remote screens via macOS Screen Sharing — one keypress away.",
            },
            {
              title: "Cursor Remote SSH",
              desc: "Launch Cursor with Remote SSH into any machine. Pick a starting directory or recent project.",
            },
            {
              title: "Credential Caching",
              desc: "Enter your credentials once. SSH keys are set up automatically, VNC passwords are saved locally.",
            },
            {
              title: "Auto Updates",
              desc: "rc updates itself. Always on the latest version without manual intervention.",
            },
            {
              title: "Tailscale Powered",
              desc: "Uses your Tailscale network to discover and connect to machines. Zero config networking.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
          Keyboard driven
        </h2>
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
      <footer className="border-t border-white/10 py-8 text-center">
        <a
          href="https://github.com/north-brook/remote-control"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          GitHub →
        </a>
      </footer>
    </main>
  );
}
