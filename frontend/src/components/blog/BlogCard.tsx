"use client";

type BlogCardProps = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  categoryLabel?: string;
  authorName: string;
  publishedAt: string;
  onClick?: (id: string) => void;
};

export default function BlogCard({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  categoryLabel,
  authorName,
  onClick,
}: BlogCardProps) {
  const handleClick = () => {
    onClick?.(id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") {
      handleClick();
    }
  };

  return (
    <article
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Abrir blog: ${title}` : undefined}
      className={`
        overflow-hidden
        rounded-[28px]
        border
        border-stone-200
        bg-white
        shadow-[0_16px_60px_-40px_rgba(41,37,36,0.45)]
        transition-all
        duration-300
        ${
          onClick
            ? "cursor-pointer hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_20px_70px_-38px_rgba(41,37,36,0.5)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            : ""
        }
      `}
    >
      <div className="overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          <span className="text-amber-700">{categoryLabel ?? category}</span>
        </div>

        <h2 className="font-heading line-clamp-2 text-xl font-bold leading-snug text-stone-900">
          {title}
        </h2>

        <p className="line-clamp-3 text-sm leading-6 text-stone-600">
          {excerpt}
        </p>

        <p className="pt-1 text-sm font-semibold uppercase tracking-[0.16em] text-stone-700">
          {authorName}
        </p>
      </div>
    </article>
  );
}
