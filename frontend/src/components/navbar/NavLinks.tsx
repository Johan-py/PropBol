import Link from 'next/link'

export default function NavLinks() {
  return (
    <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700">
      <Link
        href="/"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Inicio
      </Link>

      <Link
        href="/propiedades"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Propiedades
      </Link>

      <Link
        href="/blogs"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Blogs
      </Link>

      <Link
        href="/cobros-suscripciones"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Planes de membresia
      </Link>

      <Link
        href="/ayuda"
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Ayuda
      </Link>
    </div>
  );
}
