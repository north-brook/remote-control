"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = "terminal" | "screen" | "cursor";

type Tab = {
  id: TabId;
  label: string;
  icon: string;
  color: string;
  colorClass: string;
  phases: Phase[];
};

type Phase = {
  name: string;
  duration: number;
};

// ── Demo data ────────────────────────────────────────────────────────────────

const MACHINES = [
  { name: "gpu-server", os: "linux" },
  { name: "staging-01", os: "linux" },
  { name: "dev-macbook", os: "macos" },
  { name: "prod-api", os: "linux" },
];

const RECENT_DIRS = [
  "~/projects/api-server",
  "~/projects/ml-pipeline",
  "~/dotfiles",
];

const TABS: Tab[] = [
  {
    id: "terminal",
    label: "~ terminal",
    icon: "~",
    color: "#22d3ee",
    colorClass: "text-cyan-400",
    phases: [
      { name: "typing", duration: 800 },
      { name: "picker", duration: 400 },
      { name: "navigating", duration: 800 },
      { name: "selecting", duration: 300 },
      { name: "transition", duration: 1200 },
      { name: "result", duration: 2500 },
    ],
  },
  {
    id: "screen",
    label: "▶ screen",
    icon: "▶",
    color: "#e879f9",
    colorClass: "text-fuchsia-400",
    phases: [
      { name: "typing", duration: 800 },
      { name: "picker", duration: 400 },
      { name: "navigating", duration: 1200 },
      { name: "selecting", duration: 300 },
      { name: "transition", duration: 1800 },
    ],
  },
  {
    id: "cursor",
    label: "▣ cursor",
    icon: "▣",
    color: "#facc15",
    colorClass: "text-yellow-400",
    phases: [
      { name: "typing", duration: 800 },
      { name: "picker", duration: 400 },
      { name: "selecting", duration: 300 },
      { name: "directory", duration: 600 },
      { name: "dirSelect", duration: 1200 },
      { name: "transition", duration: 1800 },
    ],
  },
];

function totalDuration(tab: Tab): number {
  return tab.phases.reduce((sum, p) => sum + p.duration, 0);
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function HeaderBox({ subtitle }: { subtitle: string }) {
  return (
    <div className="mx-4 border border-zinc-700/50 rounded-lg px-3 py-2">
      <div>
        <span className="text-zinc-200">remote control </span>
        <span className="text-zinc-600">v0.1.0</span>
      </div>
      <div className="text-zinc-600">{subtitle}</div>
    </div>
  );
}

function MachineList({
  selected,
  highlight,
}: {
  selected: number;
  highlight: boolean;
}) {
  return (
    <div className="px-4 py-2 flex flex-col">
      {MACHINES.map((m, i) => {
        const isSel = i === selected;
        const flash = isSel && highlight;
        return (
          <div
            key={m.name}
            className={
              flash
                ? "text-zinc-900 bg-zinc-200 inline-block w-fit"
                : isSel
                  ? "text-zinc-200"
                  : "text-zinc-600"
            }
          >
            <span className="inline-block w-4">{isSel ? ">" : " "}</span>
            <span>{m.name}</span>
            <span className="text-zinc-600"> {m.os}</span>
          </div>
        );
      })}
    </div>
  );
}

function ModeBar({
  tab,
  modeLabel,
}: {
  tab: Tab;
  modeLabel: string;
}) {
  return (
    <div className="mx-4 border-t border-zinc-700/50 px-1 pt-1 flex justify-between items-center">
      <div>
        <span style={{ color: tab.color }}>{modeLabel}</span>
        <span className="text-zinc-600"> (shift+tab to cycle)</span>
      </div>
      <span className="text-zinc-600 hidden sm:inline">
        tab next machine · / to search
      </span>
    </div>
  );
}

function DirectoryPicker({ selectedDir }: { selectedDir: number }) {
  return (
    <div className="px-4 py-2 flex flex-col">
      <div className="text-zinc-600">
        <span className="bg-zinc-600 text-zinc-900">d</span>
        <span>irectory (enter for ~)</span>
      </div>
      <div className="pt-2">
        <div className="text-zinc-600">recent paths</div>
        {RECENT_DIRS.map((dir, i) => {
          const isSel = i === selectedDir;
          return (
            <div
              key={dir}
              className={isSel ? "text-zinc-200" : "text-zinc-600"}
            >
              <span className="inline-block w-4">{isSel ? ">" : " "}</span>
              <span>{dir}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(
  text: string,
  active: boolean,
  signal: AbortSignal,
  onDone: () => void,
) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!active) {
      setTyped("");
      return;
    }

    let i = 0;
    setTyped("");

    function next() {
      if (signal.aborted) return;
      if (i < text.length) {
        i++;
        setTyped(text.slice(0, i));
        const delay = 40 + Math.random() * 80;
        setTimeout(next, delay);
      } else {
        onDone();
      }
    }

    const start = setTimeout(next, 200);
    return () => clearTimeout(start);
  }, [active, text, signal, onDone]);

  return typed;
}

// ── Main component ───────────────────────────────────────────────────────────

export function TerminalDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(-1); // -1 = not started
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);

  const tab = TABS[activeTab];
  const phaseName = phaseIndex >= 0 ? tab.phases[phaseIndex]?.name ?? "done" : "idle";
  const tabTotal = totalDuration(tab);

  // ── Reduced motion check ───────────────────────────────────────────────

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Intersection observer ──────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Phase sequencer ────────────────────────────────────────────────────

  const advancePhase = useCallback(() => {
    setPhaseIndex((prev) => {
      const next = prev + 1;
      if (next >= TABS[activeTab].phases.length) {
        // Auto-advance to next tab
        setTimeout(() => {
          setActiveTab((t) => (t + 1) % TABS.length);
        }, 0);
        return prev;
      }
      return next;
    });
  }, [activeTab]);

  const runAnimation = useCallback(
    (tabIdx: number) => {
      // Cancel previous
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setPhaseIndex(0);
      setProgress(0);
      startTimeRef.current = performance.now();

      // Progress bar RAF
      const tabDur = totalDuration(TABS[tabIdx]);
      function tick() {
        if (ac.signal.aborted) return;
        const elapsed = performance.now() - startTimeRef.current;
        const p = Math.min(elapsed / tabDur, 1);
        setProgress(p);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }
      rafRef.current = requestAnimationFrame(tick);

      // Phase timer
      let phaseIdx = 0;
      function scheduleNext() {
        if (ac.signal.aborted) return;
        const phases = TABS[tabIdx].phases;
        if (phaseIdx >= phases.length) return;

        const dur = phases[phaseIdx].duration;
        setTimeout(() => {
          if (ac.signal.aborted) return;
          phaseIdx++;
          if (phaseIdx < phases.length) {
            setPhaseIndex(phaseIdx);
            scheduleNext();
          } else {
            // Tab done, auto-advance
            setTimeout(() => {
              if (ac.signal.aborted) return;
              const nextTab = (tabIdx + 1) % TABS.length;
              setActiveTab(nextTab);
            }, 300);
          }
        }, dur);
      }
      scheduleNext();

      return () => {
        ac.abort();
        cancelAnimationFrame(rafRef.current);
      };
    },
    [],
  );

  // Trigger animation when tab changes and visible
  useEffect(() => {
    if (!isVisible || reducedMotion) return;
    const cleanup = runAnimation(activeTab);
    return cleanup;
  }, [activeTab, isVisible, reducedMotion, runAnimation]);

  // ── Typewriter for prompt ──────────────────────────────────────────────

  const signal = abortRef.current?.signal ?? new AbortController().signal;
  const isTyping = phaseName === "typing";
  const typedText = useTypewriter("rc", isTyping, signal, advancePhase);

  // ── Compute derived state ──────────────────────────────────────────────

  // Selected machine index based on phase
  let selectedMachine = 0;
  let highlightFlash = false;

  if (tab.id === "terminal") {
    if (phaseName === "navigating" || phaseName === "selecting" || phaseName === "transition" || phaseName === "result") {
      selectedMachine = 1; // staging-01
    }
    if (phaseName === "selecting") highlightFlash = true;
  } else if (tab.id === "screen") {
    if (phaseName === "navigating") selectedMachine = 1; // animating
    if (phaseName === "selecting" || phaseName === "transition") {
      selectedMachine = 2; // dev-macbook
    }
    if (phaseName === "selecting") highlightFlash = true;
  } else if (tab.id === "cursor") {
    if (phaseName === "selecting") highlightFlash = true;
  }

  // Navigating animation for screen tab - move through machines
  const [navIndex, setNavIndex] = useState(0);
  useEffect(() => {
    if (tab.id === "screen" && phaseName === "navigating") {
      setNavIndex(0);
      const t1 = setTimeout(() => setNavIndex(1), 400);
      const t2 = setTimeout(() => setNavIndex(2), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (tab.id === "terminal" && phaseName === "navigating") {
      setNavIndex(0);
      const t1 = setTimeout(() => setNavIndex(1), 400);
      return () => clearTimeout(t1);
    }
  }, [tab.id, phaseName]);

  // Directory selection animation
  const [dirIndex, setDirIndex] = useState(0);
  useEffect(() => {
    if (phaseName === "dirSelect") {
      setDirIndex(0);
      const t1 = setTimeout(() => setDirIndex(1), 400);
      const t2 = setTimeout(() => setDirIndex(2), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [phaseName]);

  // Effective selected for navigating phases
  let effectiveSelected = selectedMachine;
  if (tab.id === "screen" && phaseName === "navigating") effectiveSelected = navIndex;
  if (tab.id === "terminal" && phaseName === "navigating") effectiveSelected = navIndex;

  // ── Render helpers ─────────────────────────────────────────────────────

  function renderContent() {
    // Reduced motion: show static final state
    if (reducedMotion) {
      return renderPickerScreen(tab, 1, false);
    }

    // Idle / typing: show prompt
    if (phaseName === "idle" || phaseName === "typing") {
      return (
        <div className="flex flex-col justify-end h-full px-4 py-4">
          <div className="font-mono">
            <span className="text-zinc-500">$ </span>
            <span className="text-zinc-200">{typedText}</span>
            <span className="blink-cursor text-zinc-200">▋</span>
          </div>
        </div>
      );
    }

    // Transition messages
    if (phaseName === "transition") {
      const messages: Record<TabId, string> = {
        terminal: "Copying SSH key to staging-01...",
        screen: "Opening Screen Sharing to dev-macbook...",
        cursor: "Opening Cursor to gpu-server...",
      };
      return (
        <div className="flex flex-col justify-end h-full px-4 py-4">
          <div className="text-zinc-600">{messages[tab.id]}</div>
        </div>
      );
    }

    // Result (terminal only)
    if (phaseName === "result") {
      return (
        <div className="flex flex-col justify-end h-full px-4 py-4">
          <div className="font-mono">
            <span className="text-emerald-400">user@staging-01</span>
            <span className="text-zinc-500">:</span>
            <span className="text-cyan-400">~</span>
            <span className="text-zinc-500">$ </span>
            <span className="blink-cursor text-zinc-200">▋</span>
          </div>
        </div>
      );
    }

    // Directory phases (cursor tab)
    if (phaseName === "directory" || phaseName === "dirSelect") {
      return renderDirectoryScreen();
    }

    // Picker phases
    return renderPickerScreen(tab, effectiveSelected, highlightFlash);
  }

  function renderPickerScreen(t: Tab, sel: number, flash: boolean) {
    const subtitles: Record<TabId, string> = {
      terminal: "quickly access remote machines",
      screen: "quickly access remote machines",
      cursor: "quickly access remote machines",
    };

    return (
      <div className="flex flex-col py-2">
        <HeaderBox subtitle={subtitles[t.id]} />
        <MachineList selected={sel} highlight={flash} />
        <ModeBar tab={t} modeLabel={t.label} />
      </div>
    );
  }

  function renderDirectoryScreen() {
    return (
      <div className="flex flex-col py-2">
        <HeaderBox subtitle="choose cursor directory for gpu-server" />
        <DirectoryPicker selectedDir={phaseName === "dirSelect" ? dirIndex : 0} />
        <div className="mx-4 border-t border-zinc-700/50 px-1 pt-1">
          <span className="text-zinc-600 text-xs sm:text-sm">
            esc to go back · tab to cycle · enter to continue
          </span>
        </div>
      </div>
    );
  }

  // ── Tab click handler ──────────────────────────────────────────────────

  function handleTabClick(idx: number) {
    setActiveTab(idx);
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <section ref={containerRef} className="px-6 pb-16 pt-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-zinc-700/50 bg-[#0a0a0c] overflow-hidden shadow-2xl shadow-black/50">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
            {/* macOS dots */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1">
              {TABS.map((t, i) => {
                const isActive = i === activeTab;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTabClick(i)}
                    className={`relative px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white/10 text-zinc-200"
                        : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <span style={isActive ? { color: t.color } : undefined}>
                      {t.icon}
                    </span>
                    <span className="ml-1.5">{t.id}</span>

                    {/* Progress bar */}
                    {isActive && !reducedMotion && (
                      <span
                        className="absolute bottom-0 left-0 h-0.5 rounded-full transition-none"
                        style={{
                          width: `${progress * 100}%`,
                          backgroundColor: t.color,
                          opacity: 0.6,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Terminal content */}
          <div
            className="font-mono text-sm leading-relaxed"
            style={{ minHeight: 280 }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </section>
  );
}
