"use client";

type BlogCardProps = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  author: string;
  date: string;
  onClick?: (id: string) => void;
};

export default function BlogCard({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  author,
  date,
  onClick,
}: BlogCardProps) {
  const handleClick = () => {
    onClick?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") handleClick();
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
        bg-white
        rounded-2xl
        border border-gray-200
        shadow-sm
        overflow-hidden
        transition-all duration-300
        ${
          onClick
            ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            : ""
        }
      `}
    >
      {/* Imagen */}
      <div className="overflow-hidden">
        <img
          src={imageUrl || "/placeholder.png"}
          alt={title}
          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        {/* Categoría */}
        <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
          {category}
        </span>

        {/* Título */}
        <h2 className="text-base font-bold mt-1 line-clamp-2">
          {title}
        </h2>

        {/* Resumen */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>{author}</span>
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  );
}