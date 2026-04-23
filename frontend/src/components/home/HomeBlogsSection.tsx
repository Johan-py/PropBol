import { getPublishedBlogs } from "@/services/blogs.service";
import BlogCard from "@/components/blog/BlogCard";
import Link from "next/link";

export default async function HomeBlogsSection() {
  const sortedBlogs = await getPublishedBlogs(5);

  const topBlogs = sortedBlogs.slice(0, 3);
  const bottomBlogs = sortedBlogs.slice(3, 5);

  if (sortedBlogs.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="text-stone-500 font-['Inter']">Aún no hay blogs disponibles.</p>
      </section>
    );
  }

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-24">
      {/* TOP SECTION: BLOGS HEADER */}
      <div className="space-y-12">
        <div className="flex items-end justify-between border-b border-stone-200 pb-8">
          <h2 className="font-['Montserrat'] text-6xl font-black uppercase tracking-tighter text-stone-900 sm:text-8xl">
            Blogs
          </h2>

          <Link
            href="/blogs"
            className="hidden sm:block rounded-full bg-[#D97706] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-stone-900 hover:shadow-xl"
          >
            Explorar Blogs
          </Link>
        </div>

        {/* TOP GRID */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {topBlogs.map((blog) => (
            <BlogCard key={blog.id} {...blog} href={`/blog/${blog.id}`} />
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: APRENDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* LEFT COLUMN: APRENDE TEXT */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D97706]">
              Blogs
            </p>
            <h3 className="font-['Montserrat'] text-6xl font-black uppercase tracking-tighter text-stone-900 sm:text-7xl">
              Aprende
            </h3>
          </div>

          <p className="font-['Inter'] text-lg leading-relaxed text-stone-600 max-w-sm">
            Exploramos la intersección entre la arquitectura de vanguardia, el mercado de capitales y el estilo de vida contemporáneo.
          </p>

          <Link
            href="/blogs"
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-stone-900"
          >
            <span className="border-b-2 border-[#D97706] pb-1 transition-all group-hover:border-stone-900">
              Explorar todos los blogs
            </span>
          </Link>
        </div>

        {/* RIGHT COLUMN: FEATURED BLOGS */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {bottomBlogs.map((blog, idx) => (
            <div key={blog.id} className={idx === 0 ? "md:mt-12" : ""}>
              <BlogCard {...blog} href={`/blog/${blog.id}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
