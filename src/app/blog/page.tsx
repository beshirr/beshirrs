import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">$ ls posts</p>
        <h1 className="text-2xl font-semibold text-zinc-100 md:text-3xl">Blog</h1>
      </div>

      <div className="space-y-5">
        {posts.map((post) => (
          <article key={post.slug} className="border border-zinc-800 p-6">
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">{post.date}</p>
              <h2 className="text-lg text-zinc-100">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition-colors hover:text-zinc-200 hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
