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
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-9 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm0-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6-6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 24a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm18 .5a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm9-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-3 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM3 5.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
              </svg>
              Tailscale
            </span>
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"/>
              </svg>
              Cursor
            </span>
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
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
