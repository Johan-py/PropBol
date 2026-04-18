// frontend/src/components/VisualFilters/PropertyCard.tsx

interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  count?: number;
  onClick?: () => void;
}

export default function PropertyCard({
  image,
  title,
  location,
  count,
  onClick,
}: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        relative min-w-[260px] md:min-w-[300px] w-full rounded-2xl overflow-hidden cursor-pointer
        shadow-md transition-all duration-200
        hover:scale-105 hover:shadow-xl
      "
    >
      {/* Imagen */}
      <img
        src={image}
        alt={title}
        className="w-full h-48 md:h-56 object-cover"
      />

      {/* Badge de disponibilidad */}
      {count !== undefined && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          DISPONIBLE
        </span>
      )}

      {/* Info */}
      <div className="p-2 bg-white">
        <p className="text-xs font-bold text-gray-800 truncate">{title}</p>
        <p className="text-[10px] text-gray-500 truncate">{location}</p>
        {count !== undefined && (
          <p className="text-[10px] text-orange-500 font-semibold mt-0.5">
            {count.toLocaleString()} Propiedades →
          </p>
        )}
      </div>
    </div>
  );
}