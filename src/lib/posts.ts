import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostMeta = {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
};

type Frontmatter = {
  title: string;
  date: string;
  excerpt: string;
};

function getPostFilePath(slug: string) {
  return path.join(postsDirectory, `${slug}.md`);
}

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

export function getAllPosts(): PostMeta[] {
  const posts = getPostSlugs().map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const fullPath = getPostFilePath(slug);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContent);
    const frontmatter = data as Frontmatter;

    return {
      title: frontmatter.title,
      date: frontmatter.date,
      slug,
      excerpt: frontmatter.excerpt
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string) {
  const fullPath = getPostFilePath(slug);
  const fileContent = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as Frontmatter;

  return {
    title: frontmatter.title,
    date: frontmatter.date,
    slug,
    excerpt: frontmatter.excerpt,
    content
  };
}
