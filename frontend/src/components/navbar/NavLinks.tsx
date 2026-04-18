'use client'

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const categorias = ["Casas", "Departamentos", "Cuartos", "Terrenos", "Espacios de cementerios"];

export default function NavLinks() {
  const [open, setOpen] = useState(false);

  const linkStyle = "hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition";

  return (
    <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700">
      <Link href="/" className={linkStyle}>Inicio</Link>

      {/* Dropdown Propiedades */}
      <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <button className={`flex items-center gap-1 ${linkStyle}`}>
          Propiedades
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 w-52 pt-2">
            <div className="bg-white border border-gray-100 rounded-lg shadow-xl py-2">
              {categorias.map((cat) => (
                <Link
                  key={cat}
                  href={`/propiedades/${cat.toLowerCase().replace(/ /g, '-')}`}
                  className="block px-4 py-2 text-sm hover:bg-[#E68B25]/10 hover:text-[#E68B25]"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link href="/blogs" className={linkStyle}>Blogs</Link>
      <Link href="/cobros-suscripciones" className={linkStyle}>Planes de membresia</Link>
      <Link href="/ayuda" className={linkStyle}>Ayuda</Link>
    </div>
  );
}