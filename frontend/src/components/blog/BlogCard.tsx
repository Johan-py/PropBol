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
    if (e.key === "Enter") {
      handleClick();
    }
  };

  return (
    <div
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-2xl shadow-md overflow-hidden transition bg-white ${
        onClick ? "cursor-pointer hover:shadow-lg" : ""
      }`}
    >
      {/* Imagen */}
      <img
        src={imageUrl || "/placeholder.png"}
        alt={title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        {/* Categoría */}
        <span className="text-xs font-semibold text-blue-600 uppercase">
          {category}
        </span>

        {/* Título */}
        <h2 className="text-lg font-bold mt-1 line-clamp-2">
          {title}
        </h2>

        {/* Resumen */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          <span>{author}</span>
          <span>
            {new Date(date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}