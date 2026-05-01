"use client";

import { useEffect, useState } from "react";
import { Star, Heart } from "lucide-react";

// --- Tipos de Datos ---
type Inmueble = {
  id: number;
  titulo: string;
  precio: number;
  descripcion?: string;
  nroCuartos?: number;
  nroBanos?: number;
  ubicacion?: {
    ciudad?: string;
    direccion?: string;
    zona?: string;
  };
  imagen_principal?: string;
};

type FavoritoItem = {
  id: number;
  agregadoEn: string;
  inmueble: Inmueble;
};

type FavoritesResponse = {
  total: number;
  page: number;
  per_page: number;
  totalPages: number;
  data: FavoritoItem[];
};

export default function MisFavoritos() {
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // --- Cargar Favoritos ---
  const fetchFavoritos = async (pageNum: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favorites?page=${pageNum}&per_page=9`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data: FavoritesResponse = await response.json();
      setFavoritos(data.data || []);
      setTotal(data.total);
      setTotalPages(data.totalPages || Math.ceil(data.total / 9));
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ELIMINAR FAVORITO CON CONFIRMACIÓN (Solución al Bug Report) ---
  const removeFavorite = async (inmuebleId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Paso 1: Mostrar mensaje de confirmación (Exigido por Criterio de Aceptación)
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta propiedad de tus favoritos?"
    );

    if (!confirmar) return;

    setRemovingId(inmuebleId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${inmuebleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Paso 2: Actualización optimista de la interfaz
        setFavoritos((prev) => prev.filter((fav) => fav.inmueble.id !== inmuebleId));
        setTotal((prev) => prev - 1);
        alert("Eliminado correctamente.");
      } else {
        alert("No se pudo eliminar el favorito.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setRemovingId(null);
    }
  };

  // --- Auxiliares ---
  const getImagenUrl = (inmueble: Inmueble) => {
    if (inmueble.imagen_principal) {
      return inmueble.imagen_principal.startsWith("/") 
        ? `${process.env.NEXT_PUBLIC_API_URL}${inmueble.imagen_principal}` 
        : inmueble.imagen_principal;
    }
    return "https://via.placeholder.com/400x300?text=Sin+imagen";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  useEffect(() => {
    fetchFavoritos(page);
  }, [page]);

  if (loading) return <div className="p-20 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* TÍTULO CORREGIDO (Bug Report Item 1) */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestión de Favoritos
          </h1>
          <p className="text-gray-500 text-sm">
            {total === 0 ? "Aún no tienes favoritos" : `${total} propiedades guardadas`}
          </p>
        </div>

        {favoritos.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">No tienes favoritos aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritos.map((fav) => (
              <div key={fav.id} className="bg-white rounded-xl shadow-sm border overflow-hidden relative">
                <img src={getImagenUrl(fav.inmueble)} className="h-48 w-full object-cover" />
                
                {/* FECHA DE AGREGADO */}
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-white text-[10px] flex items-center gap-1">
                  <Star size={10} fill="#E87B00" stroke="none" />
                  {formatDate(fav.agregadoEn)}
                </div>

                <div className="p-4">
                  <p className="text-[#E87B00] font-bold text-xl">${fav.inmueble.precio.toLocaleString()} USD</p>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{fav.inmueble.titulo}</h3>
                  <p className="text-gray-500 text-xs mt-1">📍 {fav.inmueble.ubicacion?.ciudad || "Bolivia"}</p>

                  <div className="mt-4 flex gap-2">
                    {/* BOTÓN ELIMINAR CON ESTRELLA (Mecanismo de eliminación) */}
                    <button
                      onClick={() => removeFavorite(fav.inmueble.id)}
                      disabled={removingId === fav.inmueble.id}
                      className="bg-[#E87B00] p-2.5 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      title="Quitar de favoritos"
                    >
                      <Star size={20} fill="white" stroke="none" />
                    </button>
                    <button 
                      onClick={() => window.location.href = `/propiedad/${fav.inmueble.id}`}
                      className="flex-1 bg-[#E87B00] text-white rounded-lg text-sm font-bold hover:bg-orange-600"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}