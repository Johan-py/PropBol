"use client";

import { getPublishedBlogs } from "@/services/blogs.service";
import BlogCard from "@/components/blog/BlogCard";
import { useRouter } from "next/navigation";

export default function HomeBlogsSection() {
  const router = useRouter();

  const blogs = getPublishedBlogs()
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 3); // 🔥 SOLO 3

  if (blogs.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="text-stone-500">Aún no hay blogs disponibles.</p>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">Blogs</h2>

        <button
          onClick={() => router.push("/blogs")}
          className="text-sm font-semibold text-amber-600"
        >
          EXPLORAR MÁS →
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            {...blog}
            onClick={(id) => router.push(`/blog/${id}`)} // 🔥 REDIRECCIÓN
          />
        ))}
      </div>
    </section>
  );
}
