"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Blog = {
  id: number;
  titulo: string;
  imagen: string | null;
  estado: "BORRADOR" | "PENDIENTE" | "PUBLICADO" | "RECHAZADO";
};

const estados = [
  "TODOS",
  "BORRADOR",
  "PENDIENTE",
  "PUBLICADO",
  "RECHAZADO",
] as const;

export default function MisBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<(typeof estados)[number]>("TODOS");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetch("http://localhost:5000/api/blogs/mis-blogs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBlogs(data))
      .finally(() => setLoading(false));
  }, []);

  const filtrados =
    filtro === "TODOS" ? blogs : blogs.filter((b) => b.estado === filtro);

  const count = (estado: string) =>
    blogs.filter((b) => b.estado === estado).length;

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Blogs</h1>
          <p className="text-gray-500 text-sm">
            Aquí puedes ver todos tus blogs y su estado
          </p>
        </div>

        <button
          onClick={() => router.push("/blog/create")}
          className="bg-[#A67C00] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#7d4b00]"
        >
          + Crear Blog
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {estados.map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filtro === estado
                ? "bg-[#A67C00] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {estado === "TODOS" ? "Todos" : getEstadoLabel(estado)}

            {estado !== "TODOS" && (
              <span className="ml-2 text-xs">{count(estado)}</span>
            )}
          </button>
        ))}
      </div>

      {/* EMPTY */}
      {filtrados.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded-xl">
          No hay blogs en este estado
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((blog) => (
            <div
              key={blog.id}
              onClick={() => router.push(`/blog/${blog.id}`)}
              className="cursor-pointer bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img
                src={blog.imagen || "/placeholder.jpg"}
                className="w-full h-40 object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
              />

              <div className="p-4">
                <h2 className="font-semibold text-sm mb-3 line-clamp-2">
                  {blog.titulo}
                </h2>

                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${getEstadoColor(blog.estado)}`}
                  >
                    {getEstadoLabel(blog.estado)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case "PUBLICADO":
      return "Aprobado";
    case "PENDIENTE":
      return "Pendiente";
    case "RECHAZADO":
      return "Rechazado";
    case "BORRADOR":
      return "Borrador";
    default:
      return estado;
  }
}

function getEstadoColor(estado: string) {
  switch (estado) {
    case "PUBLICADO":
      return "bg-green-100 text-green-700";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-700";
    case "RECHAZADO":
      return "bg-red-100 text-red-700";
    case "BORRADOR":
      return "bg-gray-200 text-gray-700";
  }
}
