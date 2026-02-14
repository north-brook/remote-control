import Link from "next/link";

function NorthBrookLogo() {
  return (
    <svg
      width="16"
      height="19"
      viewBox="0 0 608 729"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
    >
      <path
        d="M272.233 0L380.334 0.263884L608 698.047L505.351 728.442L505.116 728.719L504.934 728.565L503.656 728.95L502.932 726.841L251.13 510.664L286.698 419.566L442.541 550.633L320.343 194.075L112.224 729L0 691.634L272.233 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <a
          href="https://northbrook.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <NorthBrookLogo />
          North Brook
        </a>

        <div className="flex items-center gap-5 text-sm text-zinc-500">
          <Link
            href="/blog"
            className="hover:text-zinc-300 transition-colors"
          >
            Blog
          </Link>
          <a
            href="https://github.com/north-brook/remote-control"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
