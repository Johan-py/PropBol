'use client'

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";


export default function NavLinks() {
  const router = useRouter();
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

  const categorias = [
    { name: "Casas", href: "/busqueda_mapa?tipo=casa" },
    { name: "Departamentos", href: "/busqueda_mapa?tipo=departamento" },
    { name: "Cuartos", href: "/busqueda_mapa?tipo=cuarto" },
    { name: "Terrenos", href: "/busqueda_mapa?tipo=terreno" },
    { name: "Espacios de cementerios", href: "/busqueda_mapa?tipo=cementerio" },
  ];

  return (
    <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700">

      {/* Propiedades con dropdown */}
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
            {categorias.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E68B25]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link id="tour-blogs" href="/blogs" className={linkStyle}>
        Blogs
      </Link>

      <Link id="tour-planes" href="/cobros-suscripciones" className={linkStyle}>
        Planes de membresía
      </Link>

      <button
        id="tour-ayuda"
        onClick={() => {
          router.push("/"); // ir al inicio

          setTimeout(() => {
            window.dispatchEvent(new Event("propbol:iniciar-tour"));
          }, 300);
        }}
        className={linkStyle}
        >
         Ayuda
      </button>

    </div>
  );
}
