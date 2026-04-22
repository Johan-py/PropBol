"use client";
import { useEffect, useState } from "react";

type Favorito = {
  id: number;
  titulo: string;
  precio: number;
  imagen?: string;
};

export default function MisFavoritos() {

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("FAVORITOS BACKEND:", data);

        setFavoritos(data.inmuebles);

        // calcular total de páginas
        setTotalPages(Math.ceil(data.total / data.per_page));
      })
      .catch(err => console.error(err));
  }, [page]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Gestión de Favoritos
          </h1>
          <p className="text-gray-500 text-sm">
            {favoritos.length} propiedades encontradas
          </p>
        </div>

        {/* CONTENIDO */}
        {favoritos.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            No tienes favoritos aún
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {favoritos.map((prop) => (
              <div key={prop.id} className="bg-white rounded-xl shadow overflow-hidden">

                {/* IMAGEN */}
                <img
                  src={prop.imagen || "https://via.placeholder.com/400x300"}
                  alt={prop.titulo}
                  className="h-44 w-full object-cover"
                />

                <div className="p-4">

                  {/* PRECIO */}
                  <p className="text-[#E87B00] font-bold text-lg">
                    ${prop.precio} USD
                  </p>

                  {/* TITULO */}
                  <h3 className="font-bold text-sm mt-1">
                    {prop.titulo}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Cochabamba, Bolivia
                  </p>

                  <button className="mt-4 w-full bg-[#E87B00] text-black py-2 rounded-lg text-xs font-bold hover:bg-orange-600">
                    Ver Detalles
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}

        {/* PAGINACIÓN REAL */}
        <div className="mt-10 flex justify-center gap-2 pb-10">

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold ${
                page === i + 1
                  ? "bg-[#E87B00] text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}

        </div>

      </div>
    </main>
  );
}