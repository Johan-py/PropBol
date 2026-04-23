"use client";

<<<<<<< HEAD
import React from "react";
=======
import React, { useEffect, useState } from "react";
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
import Image from "next/image";
import Link from "next/link";
import { MOCK_USER_BLOGS } from "@/lib/mock/blogs.mock";
import { Blog } from "@/types/blog";

const MAX_VISIBLE = 3;
<<<<<<< HEAD
=======
const USER_STORAGE_KEY = "propbol_user";
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

const STATUS_STYLES: Record<string, string> = {
  aprobado: "bg-green-50 text-green-700 border-green-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  rechazado: "bg-red-50 text-red-600 border-red-200",
  borrador: "bg-stone-50 text-stone-500 border-stone-200",
};

function getStatusClass(estado: string) {
  return (
    STATUS_STYLES[estado.toLowerCase()] ??
    "bg-stone-50 text-stone-500 border-stone-200"
  );
}

interface MyRecentBlogsPanelProps {
  blogs?: Blog[];
}

const MyRecentBlogsPanel: React.FC<MyRecentBlogsPanelProps> = ({
  blogs = MOCK_USER_BLOGS,
}) => {
  const visible = blogs.slice(0, MAX_VISIBLE);
<<<<<<< HEAD
=======
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(localStorage.getItem(USER_STORAGE_KEY)));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("propbol:session-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("propbol:session-changed", syncAuthState);
    };
  }, []);

  if (!isAuthenticated) return null;
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

  return (
    <section
      aria-label="Mis blogs recientes"
<<<<<<< HEAD
      className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-stone-800">
            Mis Blogs Recientes
          </h2>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Panel de Control Editorial
          </p>
        </div>

        <Link
          href="/profile?tab=blogs"
          className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a56400] underline-offset-4 transition-colors hover:text-[#7d4b00] hover:underline"
        >
          Ver todos mis posts
=======
      className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-sm mb-10"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-stone-900 font-bold text-sm uppercase tracking-widest">
            Mis Blogs Recientes
          </h2>
          <p className="text-stone-400 text-xs">
            Panel de control editorial
          </p>
        </div>

        <Link href="/profile?tab=blogs">
          <button className="text-[#A67C00] font-bold text-xs uppercase tracking-tighter transition-colors hover:text-[#7d4b00]">
            Ver todos mis posts
          </button>
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((blog) => (
          <div
            key={blog.id}
            className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 transition-shadow hover:shadow-md"
          >
            {/* Thumbnail */}
            <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-200">
              <Image
                src={blog.imagenUrl || "/placeholder-house.jpg"}
                alt={blog.titulo}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 line-clamp-2 text-xs font-semibold leading-snug text-stone-800">
                {blog.titulo}
              </p>
              <span
                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(blog.estado)}`}
              >
                {blog.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MyRecentBlogsPanel;
