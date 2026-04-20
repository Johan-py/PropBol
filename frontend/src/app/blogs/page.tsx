"use client";

import BlogCard from "@/components/blog/BlogCard";

type Blog = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  author: string;
  date: string;
};

export default function BlogsPage() {
  const blogs: Blog[] = [
    {
      id: "1",
      title: "El Auge del Brutalismo Biofílico",
      excerpt:
        "Descubre cómo el concreto crudo se fusiona con la naturaleza...",
      category: "Arquitectura",
      author: "Admin",
      date: "2026-04-17",
      imageUrl: "/img1.jpg",
    },
    {
      id: "2",
      title: "Ciudades secundarias como nuevo prime",
      excerpt: "Las ciudades intermedias están atrayendo inversión...",
      category: "Tendencias",
      author: "Admin",
      date: "2026-04-16",
      imageUrl: "/img2.jpg",
    },
    {
      id: "3",
      title: "Piscinas minimalistas",
      excerpt: "El lujo ahora se redefine con menos elementos...",
      category: "Diseño",
      author: "Admin",
      date: "2026-04-15",
      imageUrl: "/img3.jpg",
    },
    {
      id: "4",
      title: "Estancias Naturales",
      excerpt: "La conexión con la naturaleza es tendencia...",
      category: "Estilo de vida",
      author: "Admin",
      date: "2026-04-14",
      imageUrl: "/img4.jpg",
    },
  ];

  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <div className="bg-[#f7f5f2] min-h-screen">
      <div className="max-w-7xl mx-auto px-10 py-16">

        {/* 🔥 HEADER */}
        <div className="mb-20">
          <span className="text-xs uppercase tracking-widest text-gray-500">
            Blog
          </span>

          <h1 className="mt-3 text-5xl font-bold leading-tight text-gray-900 max-w-5xl">
            Perspectivas para el Bien Raíz Moderno.
          </h1>
        </div>

        {/* 🔥 FEATURED ESTILO REVISTA */}
        {featured && (
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">

            {/* 🖼️ Imagen dominante */}
            <div className="overflow-hidden rounded-3xl">
              <img
                src={featured.imageUrl || "/placeholder.png"}
                alt={featured.title}
                className="w-full h-[450px] lg:h-[500px] object-cover hover:scale-105 transition duration-500"
              />
            </div>

            {/* 📝 Contenido */}
            <div className="space-y-6 max-w-xl">
              <span className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold">
                {featured.category}
              </span>

              <h2 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">
                {featured.title}
              </h2>

              <p className="text-gray-600 text-base leading-relaxed">
                {featured.excerpt}
              </p>

              <button className="text-sm font-semibold text-orange-500 hover:underline">
                Leer artículo →
              </button>
            </div>
          </div>
        )}

        {/* 🟢 GRID DE CARDS */}
        <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((blog) => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>

      </div>
    </div>
  );
}