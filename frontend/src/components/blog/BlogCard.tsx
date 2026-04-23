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
  publishedAt,
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
        group
        flex
        flex-col
        overflow-hidden
        rounded-[32px]
        bg-white
        transition-all
        duration-500
        ${onClick
          ? "cursor-pointer hover:shadow-[0_24px_80px_-15px_rgba(41,37,36,0.15)] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
          : "shadow-[0_16px_60px_-40px_rgba(41,37,36,0.1)]"
        }
      `}
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imageUrl || "/placeholder-blog.jpg"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-stone-900/5 transition-opacity duration-500 group-hover:opacity-0" />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {/* Categoría Pill */}
        <div className="mb-4">
          <span className="inline-block rounded-full border border-[#D97706]/20 bg-[#D97706]/5 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#D97706]">
            {categoryLabel ?? category}
          </span>
        </div>

        {/* Título */}
        <h2 className="font-['Montserrat'] mb-3 line-clamp-2 text-xl font-bold leading-tight text-stone-900 transition-colors group-hover:text-[#D97706] sm:text-2xl">
          {title}
        </h2>

        {/* Resumen */}
        <p className="font-['Inter'] mb-6 line-clamp-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          {excerpt}
        </p>

        {/* Botón y Metadata */}
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="rounded-full bg-[#D97706] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#D97706]/90 hover:shadow-lg hover:shadow-[#D97706]/20"
          >
            Leer Más
          </button>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {authorName}
            </p>
            <p className="text-[9px] text-stone-400">
              {new Date(publishedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
