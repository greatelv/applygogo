interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <article
      className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
        prose-p:leading-relaxed prose-p:text-foreground/90
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-ul:my-6 prose-li:my-2
        prose-ul:my-6 prose-li:my-2
        prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:max-h-[400px] prose-img:w-auto
        [&>h1]:hidden"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
