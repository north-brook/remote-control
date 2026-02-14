import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Remote Control`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

const components = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="text-xl font-bold mt-10 mb-4" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="text-lg font-semibold mt-8 mb-3" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="text-[var(--muted)] leading-relaxed mb-4" {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a
      className="text-[var(--accent)] hover:text-[var(--foreground)] transition-colors underline underline-offset-4"
      {...props}
    />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul
      className="list-disc list-inside text-[var(--muted)] space-y-1 mb-4 ml-2"
      {...props}
    />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol
      className="list-decimal list-inside text-[var(--muted)] space-y-1 mb-4 ml-2"
      {...props}
    />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  code: (props: React.ComponentProps<"code">) => {
    const isInline = !props.className;
    if (isInline) {
      return (
        <code
          className="text-[var(--accent)] bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        />
      );
    }
    return <code className="text-sm" {...props} />;
  },
  pre: (props: React.ComponentProps<"pre">) => (
    <pre
      className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto font-mono text-sm mb-6"
      {...props}
    />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-2 border-[var(--accent)] pl-4 text-[var(--muted)] italic mb-4"
      {...props}
    />
  ),
  table: (props: React.ComponentProps<"table">) => (
    <div className="overflow-x-auto mb-6">
      <table
        className="w-full text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg"
        {...props}
      />
    </div>
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className="text-left px-4 py-2 font-semibold border-b border-[var(--border)]"
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td
      className="px-4 py-2 text-[var(--muted)] border-b border-[var(--border)]"
      {...props}
    />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="text-[var(--foreground)] font-semibold" {...props} />
  ),
  hr: () => <hr className="border-[var(--border)] my-8" />,
};

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/blog"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8 inline-block"
      >
        ← Back to blog
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
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
      </header>

      <div className="prose-custom">
        <MDXRemote source={post.content} components={components} />
      </div>
    </article>
  );
}
