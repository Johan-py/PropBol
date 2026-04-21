'use client'

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const categorias = ["Casas", "Departamentos", "Cuartos", "Terrenos", "Espacios de cementerios"];

const confirmarSalidaDesdeCambioContrasena = () => {
  if (typeof window === "undefined") return true;

  const estoyEnCambiarContrasena =
    window.location.pathname === "/profile/security/cambiar-contrasena";

  const hayCambiosSinGuardar =
    sessionStorage.getItem("security_password_dirty") === "true";

  if (!estoyEnCambiarContrasena || !hayCambiosSinGuardar) {
    return true;
  }

  return window.confirm(
    "Tienes cambios sin guardar. ¿Seguro que deseas salir?"
  );
};

export default function NavLinks() {
  const [open, setOpen] = useState(false);

  const linkStyle = "hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition";

  return (
    <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700">
      <Link
        href="/"
        onClick={(e) => {
          if (!confirmarSalidaDesdeCambioContrasena()) {
            e.preventDefault();
          }
        }}
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Inicio
      </Link>

      <Link
        href="/propiedades"
        onClick={(e) => {
          if (!confirmarSalidaDesdeCambioContrasena()) {
            e.preventDefault();
          }
        }}
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Link>

      <Link
        href="/blogs"
        onClick={(e) => {
          if (!confirmarSalidaDesdeCambioContrasena()) {
            e.preventDefault();
          }
        }}
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Blogs
      </Link>

      <Link
        href="/cobros-suscripciones"
        onClick={(e) => {
          if (!confirmarSalidaDesdeCambioContrasena()) {
            e.preventDefault();
          }
        }}
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Planes de membresia
      </Link>

      <Link
        href="/ayuda"
        onClick={(e) => {
          if (!confirmarSalidaDesdeCambioContrasena()) {
            e.preventDefault();
          }
        }}
        className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition"
      >
        Ayuda
      </Link>
    </div>
  );
}