import Link from "next/link";
import { PublicBlogCard } from "@/types/publicBlog";

type FeaturedBlogSpotlightProps = {
  blog: PublicBlogCard;
};

export default function FeaturedBlogSpotlight({
  blog,
}: FeaturedBlogSpotlightProps) {
  return (
    <article className="grid gap-6 overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_24px_80px_-48px_rgba(41,37,36,0.45)] lg:grid-cols-[1.15fr_0.85fr]">
      <Link href={`/blog/${blog.id}`} className="overflow-hidden">
        <img
          src={blog.imageUrl}
          alt={blog.title}
          className="h-full min-h-[280px] w-full object-cover transition-transform duration-500 hover:scale-[1.03] sm:min-h-[320px]"
        />
      </Link>

      <div className="flex flex-col justify-center gap-5 px-5 py-7 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
          {blog.featuredLabel ?? blog.categoryLabel ?? blog.category}
        </p>

        <div className="space-y-4">
          <Link href={`/blog/${blog.id}`} className="block">
            <h2 className="font-heading text-3xl font-bold leading-tight text-stone-900 transition-colors hover:text-[#a56400] sm:text-4xl">
              {blog.title}
            </h2>
          </Link>

          <p className="text-base leading-7 text-stone-600">{blog.excerpt}</p>
        </div>

        {blog.articleCtaLabel && (
          <Link
            href={`/blog/${blog.id}`}
            className="inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-stone-900 transition-colors hover:text-[#a56400]"
          >
            {blog.articleCtaLabel}
          </Link>
        )}

        <p className="pt-1 text-sm font-semibold uppercase tracking-[0.16em] text-stone-700">
          {blog.authorName}
        </p>
      </div>
    </article>
  );
}
