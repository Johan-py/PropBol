"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Favorito = {
  id: number;
  titulo: string;
  precio: number | string;
  imagen?: string;
  ubicacion?: {
    ciudad?: string;
    zona?: string;
    direccion?: string;
  };
  nroCuartos?: number;
  nroBanos?: number;
  superficieM2?: number | string;
  tipoAccion?: string;
  categoria?: string;
  agregadoEn?: string;
};

export default function MisFavoritos() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchFavoritos = async (p: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/favorites?page=${p}&per_page=8`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setFavoritos(data.inmuebles ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(Math.ceil((data.total ?? 0) / (data.per_page ?? 8)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoritos(page);
  }, [page]);

  const handleRemove = async (inmuebleId: number) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/favorites/${inmuebleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoritos((prev) => prev.filter((f) => f.id !== inmuebleId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-bold text-black">
        Cargando favoritos...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Gestión de Favoritos
          </h1>
          <p className="text-gray-500 text-sm">
            {total} propiedades encontradas
          </p>
        </div>

        {/* CONTENIDO */}
        {favoritos.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            No tienes favoritos aún
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritos.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 hover:shadow-md transition-all"
              >
                {/* IMAGEN */}
                <div className="relative h-44 w-full bg-gray-200">
                  <img
                    src={prop.imagen || "https://via.placeholder.com/400x300"}
                    alt={prop.titulo}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="p-4">
                  {/* PRECIO */}
                  <p className="text-[#E87B00] font-bold text-lg">
                    ${Number(prop.precio).toLocaleString("en-US")} USD
                  </p>

                  {/* TITULO */}
                  <h3 className="font-bold text-sm mt-1 truncate">
                    {prop.titulo}
                  </h3>

                  {/* UBICACION */}
                  <p className="text-xs text-gray-500 mt-1">
                    {prop.ubicacion?.ciudad ?? "Cochabamba"},{" "}
                    {prop.ubicacion?.zona ?? "Bolivia"}
                  </p>

                  {/* DETALLES */}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600 font-medium">
                    {prop.nroCuartos && (
                      <>
                        <span>🛏️ {prop.nroCuartos} hab</span>
                        <span>•</span>
                      </>
                    )}
                    {prop.nroBanos && (
                      <>
                        <span>🛁 {prop.nroBanos} baños</span>
                        <span>•</span>
                      </>
                    )}
                    {prop.superficieM2 && (
                      <span>⬜ {prop.superficieM2} m²</span>
                    )}
                  </div>

                  {/* TIPO Y CATEGORIA */}
                  <div className="flex gap-2 mt-2">
                    {prop.tipoAccion && (
                      <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                        {prop.tipoAccion}
                      </span>
                    )}
                    {prop.categoria && (
                      <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                        {prop.categoria}
                      </span>
                    )}
                  </div>

                  {/* BOTONES */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleRemove(prop.id)}
                      className="flex items-center justify-center px-3 py-2.5 bg-[#E87B00] rounded-lg hover:bg-orange-600 transition-colors"
                      title="Quitar de favoritos"
                    >
                      <Star size={16} fill="black" color="black" />
                    </button>
                    <button className="w-full bg-[#E87B00] text-black py-2.5 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors">
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2 pb-10">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold ${
                  page === i + 1
                    ? "bg-[#E87B00] text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}