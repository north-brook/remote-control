import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Remote Control",
  description: "Updates and guides about Remote Control.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-[var(--muted)] mb-10">
        Updates and guides about Remote Control.
      </p>

      {posts.length === 0 ? (
        <p className="text-[var(--muted)]">No posts yet. Check back soon.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2 className="text-xl font-semibold group-hover:text-[var(--accent)] transition-colors mb-1">
                  {post.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-[var(--muted)] mb-2">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <p className="text-[var(--muted)] leading-relaxed">
                  {post.description}
                </p>
              </Link>
              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
