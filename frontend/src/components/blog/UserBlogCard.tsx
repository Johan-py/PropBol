"use client";

import { Trash2, Edit3 } from "lucide-react";
import Image from "next/image";

type EstadoBlog = "BORRADOR" | "PENDIENTE" | "PUBLICADO" | "RECHAZADO";

type UserBlog = {
  id: number;
  titulo: string;
  imagen: string | null;
  estado: EstadoBlog;
  fecha_creacion: string | null;
  fecha_publicacion: string | null;
};

interface UserBlogCardProps {
  blog: UserBlog;
  imageSrc: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserBlogCard({
  blog,
  imageSrc,
  onView,
  onEdit,
  onDelete,
}: UserBlogCardProps) {
  const isEditable = blog.estado === "BORRADOR" || blog.estado === "RECHAZADO";

  return (
    <article
      onClick={onView}
      className="group cursor-pointer overflow-hidden rounded-[22px] border border-[#E8DED0] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Imagen */}
      <div className="relative h-56 bg-[#E5E0DA]">
        <Image
          src={imageSrc}
          alt={blog.titulo}
          fill
          unoptimized
          className="object-cover transition duration-300 group-hover:scale-105"
        />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${getEstadoBadgeClass(
            blog.estado
          )}`}
        >
          {getEstadoLabel(blog.estado)}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A8F84]">
          {getFechaVisible(blog)}
        </p>

        <h3 className="mb-8 line-clamp-2 min-h-[64px] text-2xl font-semibold leading-tight text-[#1F1F1F] transition group-hover:text-[#D97706]">
          {blog.titulo}
        </h3>

        <div className="flex items-center justify-between border-t border-[#EEE6DC] pt-4">
          {isEditable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#3F3F3F] transition hover:text-[#B47A00]"
            >
              <Edit3 size={14} />
              {blog.estado === "BORRADOR" ? "Continuar" : "Editar"}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-gray-300">
              <Edit3 size={14} />
              Editar
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1 text-xs font-bold text-red-400 transition hover:text-red-600"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

function getEstadoLabel(estado: EstadoBlog) {
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

function getEstadoBadgeClass(estado: EstadoBlog) {
  switch (estado) {
    case "PUBLICADO":
      return "bg-[#E8F7EE] text-[#198754] border border-[#BFE8CD]";
    case "PENDIENTE":
      return "bg-[#EAF2FF] text-[#2563EB] border border-[#C7DDFE]";
    case "RECHAZADO":
      return "bg-[#FDECEC] text-[#D94848] border border-[#F3BABA]";
    case "BORRADOR":
      return "bg-[#F1F2F4] text-[#596270] border border-[#D9DEE5]";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}

function getFechaVisible(blog: UserBlog) {
  const fecha =
    blog.estado === "PUBLICADO" && blog.fecha_publicacion
      ? blog.fecha_publicacion
      : blog.fecha_creacion;

  if (!fecha) return "Sin fecha";

  return new Date(fecha)
    .toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(".", "")
    .toUpperCase();
}