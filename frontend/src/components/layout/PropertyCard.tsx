type PropsTarjeta = {
  imagen?: string;
  estado: string;
  precio: string;
  descripcion: string;
  camas: number;
  banos: number;
  metros: number;
};

export default function PropertyCard({ imagen, estado, precio, descripcion, camas, banos, metros }: PropsTarjeta) {
  return (
    // Este es el contenedor padre que envuelve toda la tarjeta
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-sm">
      
      {/* 1. Imagen y Etiqueta */}
      <div className="relative">
        <img
          src={imagen}
          alt={descripcion}
          className="w-full h-48 object-cover bg-gray-200"
        />
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">
          {estado}
        </span>
      </div>

      {/* 2. Contenido de la Tarjeta */}
      <div className="p-4">
        {/* Precio */}
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{precio}</h2>

        {/* Descripción */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2 font-medium">
          {descripcion}
        </p>

        {/* 3. Detalles */}
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-4">
          <span className="flex items-center gap-1 text-orange-500">🛏️ {camas}</span>
          <span className="flex items-center gap-1 text-orange-500">🛁 {banos}</span>
          <span className="flex items-center gap-1 text-gray-400">📐 {metros} m²</span>
        </div>

        {/* 4. Botón verde */}
        <button className="w-full bg-[#1db954] hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
          <span>💬</span> Contactar
        </button>
      </div>

    </div>
  );
}