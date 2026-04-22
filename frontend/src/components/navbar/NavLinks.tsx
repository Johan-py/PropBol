'use client'

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

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
      <Link href="/" className={linkStyle}>Inicio</Link>

      <div className="relative" ref={dropdownRef}>
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
              <Link key={item} href="/propiedades" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E68B25]">
                {item}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href="/blogs" className={linkStyle}>Blogs</Link>
      <Link href="/cobros-suscripciones" className={linkStyle}>Planes de membresia</Link>
      <Link href="/ayuda" className={linkStyle}>Ayuda</Link>
    </div>
  );
}