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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") handleClick();
  };

  return (
    <article
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        group
        bg-white
        rounded-xl
        border border-gray-200
        shadow-sm
        overflow-hidden
        transition-all duration-300
        ${onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-gray-300" : ""}
      `}
    >
      {/* Imagen */}
      <div className="overflow-hidden">
        <img
          src={imageUrl || "/placeholder.png"}
          alt={title}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-3">
        {/* Categoría */}
        <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">
          {category}
        </span>

        {/* Título */}
        <h3 className="text-sm font-semibold mt-1 line-clamp-2">
          {title}
        </h3>

        {/* Resumen */}
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3 text-[10px] text-gray-400">
          <span>{author}</span>
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  );
}