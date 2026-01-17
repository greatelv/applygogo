import Link from "next/link";
import Image from "next/image";
import { prefixPath } from "@/lib/base-path";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Calendar } from "lucide-react";
import type { PostFrontmatter } from "@/lib/markdown";

interface PostCardProps {
  post: PostFrontmatter;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border hover:border-border bg-card group-hover:translate-y-[-2px]">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
          <Image
            src={prefixPath(post.thumbnail || "/placeholder.svg")}
            alt={post.title || "Blog post thumbnail"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {post.categories && post.categories.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <Badge
                  key={category}
                  className="bg-background/80 backdrop-blur-sm border-border/40 text-foreground hover:bg-background/90"
                >
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={new Date(post.date).toISOString()}>
                {new Date(post.date).toLocaleDateString("ko-KR")}
              </time>
            </div>
            {post.author && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>{post.author}</span>
              </div>
            )}
          </div>
          <CardTitle className="line-clamp-2 text-balance text-lg leading-relaxed group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-pretty">
            {post.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(post.tags || []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
