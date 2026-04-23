"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";

const MAX_VISIBLE = 3;
const USER_STORAGE_KEY = "propbol_user";

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
  blogs = [],
}) => {
  const visible = blogs.slice(0, MAX_VISIBLE);
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

  if (blogs.length === 0) {
    return (
      <section className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-sm mb-10">
        <p className="text-sm text-gray-400">No publicaste ningún blog aún</p>
      </section>
    );
  }

  return (
    <section
      aria-label="Mis blogs recientes"
      className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-sm mb-10"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-stone-900 font-bold text-sm uppercase tracking-widest">
            Mis Blogs Recientes
          </h2>
          <p className="text-stone-400 text-xs">Panel de control editorial</p>
        </div>

        <Link href="/mis-blogs">
          <button className="text-[#A67C00] font-bold text-xs uppercase tracking-tighter transition-colors hover:text-[#7d4b00]">
            Ver todos mis posts
          </button>
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
