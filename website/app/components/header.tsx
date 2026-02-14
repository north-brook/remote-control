"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitHubLink } from "./github-link";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <Link
          href="/"
          className="font-semibold text-white hover:text-zinc-300 transition-colors tracking-tight"
        >
          Remote Control
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className={`text-sm transition-colors ${
              pathname.startsWith("/blog")
                ? "text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Blog
          </Link>
          <GitHubLink />
        </div>
      </div>
    </header>
  );
}
