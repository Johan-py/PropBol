"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import type { User } from "../layout/Navbar";
import {
  User as UserIcon,
  Eye,
  FileText,
  Map,
  Star,
  Shield,
} from "lucide-react";

type UserMenuProps = {
  user: User | null;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onClosePanel: () => void;
  onLogin: () => void;
  onOpenLogoutModal: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MenuLink = ({
  label,
  href,
  onClick,
  icon: Icon,
}: {
  label: string;
  href: string;
  onClick: () => void;
  icon: any;
}) => {
  const pathname = usePathname();

  const confirmarSalidaSinGuardar = () => {
    const estoyEnCambiarContrasena =
      pathname === "/profile/security/cambiar-contrasena";

    const hayCambiosSinGuardar =
      sessionStorage.getItem("security_password_dirty") === "true";

    if (!estoyEnCambiarContrasena || !hayCambiosSinGuardar) {
      return true;
    }

    return window.confirm(
      "Tienes cambios sin guardar. ¿Seguro que deseas salir?"
    );
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!confirmarSalidaSinGuardar()) {
      e.preventDefault();
      return;
    }

    onClick();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="flex items-center gap-3 rounded px-2 py-2 text-sm text-gray-500 transition-colors hover:bg-black/5 hover:text-[#E68B25]"
    >
      <Icon size={18} strokeWidth={1.5} />
      {label}
    </Link>
  );
};

export default function UserMenu({
  user,
  isPanelOpen,
  onTogglePanel,
  onClosePanel,
  onLogin,
  onOpenLogoutModal,
}: UserMenuProps) {
  return (
    <>
      <button
        onClick={onTogglePanel}
        className="rounded-full p-2 text-gray-700 transition hover:bg-black/5 focus:outline-none"
        aria-label="Abrir menú de usuario"
      >
        {user?.avatar ? (
          <img
            src={
              user.avatar.startsWith("http")
                ? user.avatar
                : `${API_URL}${user.avatar}`
            }
            alt={user.name}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </button>

      <div
        className={`absolute right-0 z-50 mt-3 w-72 rounded-xl border border-gray-200 bg-[#F9F6EE] p-5 shadow-lg transition-all duration-200 ${
          isPanelOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-2">
          <span className="text-sm font-bold text-gray-900">
            Bienvenido a PropBol
          </span>
          <button
            onClick={onClosePanel}
            className="text-gray-500 hover:text-black"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {user ? (
          <>
            <div className="mb-4 flex items-center gap-3 px-1">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-600 font-bold text-white">
                {user.avatar ? (
                  <img
                    src={
                      user.avatar.startsWith("http")
                        ? user.avatar
                        : `${API_URL}${user.avatar}`
                    }
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold leading-tight text-gray-800">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="mb-4 flex flex-col">
              <MenuLink
                label="Mi cuenta"
                href="/profile"
                icon={UserIcon}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis propiedades vistas"
                href="/vistas"
                icon={Eye}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis favoritos"
                href="/mis-favoritos"
                icon={Star}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis publicaciones"
                href="/mis-publicaciones"
                icon={FileText}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis zonas"
                href="/profile/mis-zonas"
                icon={Map}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis comparaciones"
                href="/mis-comparaciones"
                icon={FileText}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Seguridad"
                href="/profile/security"
                icon={Shield}
                onClick={onClosePanel}
              />
            </div>

            <button
              onClick={onOpenLogoutModal}
              className="w-full rounded-lg bg-[#E68B25] py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#cf7b1f]"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-2 text-center">
            <p className="mb-5 text-sm text-gray-600">
              Encuentra tu hogar ideal hoy mismo.
            </p>
            <button
              onClick={onLogin}
              className="w-full rounded-xl bg-[#E68B25] py-2.5 text-sm font-bold text-white shadow-md"
            >
              Ingresar / Registrarse
            </button>
          </div>
        )}
      </div>
    </>
  );
}