<<<<<<< HEAD
'use client'

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
=======
import Link from "next/link";
>>>>>>> 189eb9fe (feat: agregar enlaces de navegación en el navbar)

export default function NavLinks() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkStyle = "hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition";

  return (
    <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700">

      {/* HU-05: Inicio */}
      <Link id="tour-inicio" href="/" className={linkStyle}>
        Inicio
      </Link>

<<<<<<< HEAD
      {/* HU-05: Propiedades con dropdown */}
      <div id="tour-propiedades" className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${open ? 'text-[#E68B25] bg-[#E68B25]/10' : 'hover:text-[#E68B25] hover:bg-[#E68B25]/10'}`}
        >
          Propiedades
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-2">
            {["Casas", "Departamentos", "Cuartos", "Terrenos", "Espacios de cementerios"].map((item) => (
              <Link
                key={item}
                href="/propiedades"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E68B25]"
              >
                {item}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* HU-05: Blogs */}
      <Link id="tour-blogs" href="/blogs" className={linkStyle}>
        Blogs
      </Link>

      {/* HU-05: Planes de membresía */}
      <Link id="tour-planes" href="/cobros-suscripciones" className={linkStyle}>
        Planes de membresía
      </Link>

      {/* HU-05: Contáctanos */}
      <Link id="tour-contacto" href="#contacto" className={linkStyle}>
        Contáctanos
      </Link>

      {/* HU-05: Sobre Nosotros */}
      <Link id="tour-nosotros" href="#nosotros" className={linkStyle}>
        Sobre Nosotros
=======
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
>>>>>>> 189eb9fe (feat: agregar enlaces de navegación en el navbar)
      </Link>

      {/* HU-05: Botón de ayuda que reactiva el tour guiado */}
      <button
        id="tour-ayuda"
        onClick={() => window.dispatchEvent(new Event("propbol:iniciar-tour"))}
        className={linkStyle}
      >
        Ayuda
      </button>

    </div>
  );
}