import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;

  try {
    const post = getPostBySlug(slug);

    return (
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3 border-b border-zinc-800 pb-6">
          <p className="text-xs text-zinc-500">{post.date}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
            {post.title}
          </h1>
          <p className="text-sm text-zinc-400">{post.excerpt}</p>
        </header>

        <div className="space-y-6 text-zinc-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-semibold text-zinc-100">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold text-zinc-100">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-zinc-100">{children}</h3>,
              p: ({ children }) => <p className="leading-7 text-zinc-300">{children}</p>,
              ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 text-zinc-300">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6 text-zinc-300">{children}</ol>,
              a: ({ href, children }) => (
                <a href={href} className="text-zinc-200 underline-offset-2 hover:underline">
                  {children}
                </a>
              ),
              code: ({ className, children }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return <code className={className}>{children}</code>;
                }
                return (
                  <code className="rounded bg-zinc-900 px-1 py-0.5 text-sm text-zinc-200">{children}</code>
                );
              },
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-none border border-zinc-800 bg-zinc-950 p-4">
                  {children}
                </pre>
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    );
  } catch {
    notFound();
  }
}
