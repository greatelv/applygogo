import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: number; // Changed from string to number (Unix timestamp)
  thumbnail: string;
  author: string;
  tags: string[];
  categories: string[];
  relatedServices?: string[];
  targetLink?: string;
  buttonText?: string;
  isSponsored?: boolean;
  slug?: string;
}

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
}

const postsDirectory = path.join(process.cwd(), "content/posts");

// Get all post slugs
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => fileName.replace(/\.(md|mdx)$/, ""));
}

// Get post data by slug
export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      frontmatter: {
        ...data,
        date: typeof data.date === "string" ? Number(data.date) : data.date,
        slug,
      } as PostFrontmatter,
      content,
    };
  } catch (error) {
    return null;
  }
}

// Get all posts sorted by date
export function getAllPosts(): Post[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      // Sort by date (newest first)
      const dateA = a.frontmatter.date;
      const dateB = b.frontmatter.date;
      const dateDiff = dateB - dateA;

      // If dates are the same, sort by slug (filename) in descending order
      if (dateDiff === 0) {
        return (b.frontmatter.slug || "").localeCompare(
          a.frontmatter.slug || ""
        );
      }

      return dateDiff;
    });

  return posts;
}

// Get all unique categories
export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set<string>();

  posts.forEach((post) => {
    if (post.frontmatter.categories) {
      post.frontmatter.categories.forEach((cat) => categories.add(cat));
    } else if ((post.frontmatter as any).category) {
      // Fallback for migration period if needed, though we will update all files
      categories.add((post.frontmatter as any).category);
    }
  });

  return Array.from(categories).sort();
}

// Get posts by category
export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => {
    if (post.frontmatter.categories) {
      return post.frontmatter.categories.includes(category);
    }
    // Fallback
    return (post.frontmatter as any).category === category;
  });
}
