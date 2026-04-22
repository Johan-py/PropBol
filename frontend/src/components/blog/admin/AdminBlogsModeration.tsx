"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAdminBlogModeration } from "@/hooks/useAdminBlogModeration";
import type {
  AdminModerationBlog,
  AdminModerationStatus,
} from "@/types/adminModerationBlog";

const FILTERS: Array<{
  label: string;
  value: AdminModerationStatus;
}> = [
  { label: "Pendientes", value: "PENDIENTE" },
  { label: "Aprobados", value: "APROBADO" },
  { label: "Rechazados", value: "RECHAZADO" },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusStyles(status: AdminModerationStatus) {
  if (status === "APROBADO") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "RECHAZADO") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

function EmptyState({ filter }: { filter: AdminModerationStatus }) {
  const copy =
    filter === "PENDIENTE"
      ? "No hay articulos pendientes por revisar."
      : filter === "APROBADO"
        ? "Aun no aprobaste articulos en esta vista."
        : "Todavia no hay articulos rechazados.";

  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-white px-6 py-14 text-center text-stone-500">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
        Sin registros
      </p>
      <p className="mt-3 text-base">{copy}</p>
    </div>
  );
}

function BlogRow({ blog }: { blog: AdminModerationBlog }) {
  const actionLabel = blog.status === "PENDIENTE" ? "Revisar" : "Ver detalle";

  return (
    <article className="grid gap-4 border-t border-stone-200 px-5 py-5 first:border-t-0 md:grid-cols-[minmax(0,2.6fr)_1.1fr_0.9fr_0.9fr_0.8fr] md:items-center md:px-6">
      <div className="grid items-start gap-4 md:grid-cols-[4rem_minmax(0,1fr)]">
        <div className="flex h-16 w-16 shrink-0 items-start justify-start overflow-hidden rounded-2xl shadow-sm">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            width={64}
            height={64}
            className="h-16 w-16 object-cover"
          />
        </div>

        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            {blog.category}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-stone-900">
            {blog.title}
          </h2>
          <p className="mt-2 text-sm text-stone-500">{blog.excerpt}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
          Autor
        </p>
        <p className="mt-2 text-base font-medium text-stone-700">
          {blog.authorName}
        </p>
        <p className="text-sm text-stone-500">{blog.authorRole}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
          Fecha
        </p>
        <p className="mt-2 text-base font-medium text-stone-700">
          {formatDate(blog.submittedAt)}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
          Estado
        </p>
        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusStyles(blog.status)}`}
        >
          {blog.status}
        </span>
      </div>

      <div className="flex items-center md:justify-end">
        <Link
          href={`/admin/blogs/${blog.id}`}
          className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-stone-200 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-stone-700 transition-colors hover:bg-stone-900 hover:text-white"
        >
          {actionLabel}
        </Link>
      </div>

      {blog.status === "RECHAZADO" && blog.rejectionComment && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-5">
          <span className="font-semibold">Comentario de rechazo:</span>{" "}
          {blog.rejectionComment}
        </div>
      )}
    </article>
  );
}

export default function AdminBlogsModeration() {
  const { blogs, isReady } = useAdminBlogModeration();
  const [activeFilter, setActiveFilter] =
    useState<AdminModerationStatus>("PENDIENTE");

  const filteredBlogs = useMemo(
    () => blogs.filter((blog) => blog.status === activeFilter),
    [activeFilter, blogs],
  );

  const counts = useMemo(
    () =>
      blogs.reduce<Record<AdminModerationStatus, number>>(
        (accumulator, blog) => {
          accumulator[blog.status] += 1;
          return accumulator;
        },
        {
          PENDIENTE: 0,
          APROBADO: 0,
          RECHAZADO: 0,
        },
      ),
    [blogs],
  );

  if (!isReady) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-stone-200 bg-white px-6 py-20 text-center text-stone-500 shadow-sm">
          Cargando panel de moderacion...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ed_0%,#ffffff_50%,#fff8f0_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Panel del administrador
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-950 sm:text-5xl">
              Gestion de Blogs
            </h1>
            <p className="mt-5 text-lg leading-8 text-stone-600">
              Revisa, aprueba o rechaza las ultimas publicaciones de la
              comunidad inmobiliaria. El estado queda guardado localmente para
              esta demo mientras no exista integracion con backend.
            </p>
            {/* TODO: validar permisos de acceso desde backend cuando exista autenticacion de roles. */}
          </div>

          <div className="rounded-[28px] border border-stone-200 bg-white p-2 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`inline-flex min-h-[52px] items-center justify-center rounded-full px-5 text-sm font-semibold uppercase tracking-[0.18em] transition-colors ${
                    activeFilter === filter.value
                      ? "bg-[#a56400] text-white"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-[11px]">
                    {counts[filter.value]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {filteredBlogs.length > 0 ? (
          <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_20px_70px_rgba(28,25,23,0.08)]">
            <div className="hidden grid-cols-[minmax(0,2.6fr)_1.1fr_0.9fr_0.9fr_0.8fr] gap-4 bg-stone-100 px-6 py-5 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 md:grid">
              <span>Titulo del post</span>
              <span>Autor</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span className="text-right">Accion</span>
            </div>

            <div>
              {filteredBlogs.map((blog) => (
                <BlogRow key={blog.id} blog={blog} />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState filter={activeFilter} />
        )}

        <div className="flex flex-col gap-3 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold uppercase tracking-[0.18em] text-stone-400">
            Mostrando {filteredBlogs.length} de {blogs.length} registros
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.18em] text-[#a56400]"
          >
            Volver a Blogs
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
