"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, Trash2, Archive } from "lucide-react";

import Logo from "../navbar/Logo";
import NavLinks from "../navbar/NavLinks";
import UserMenu from "../navbar/UserMenu";
import LogoutModal from "../navbar/LogoutModal";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationFilter } from "@/types/notification";

export type User = {
  name: string;
  email: string;
};

const USER_STORAGE_KEY = "propbol_user";
const SESSION_EXPIRES_KEY = "propbol_session_expires";
const SESSION_DURATION_MS = 60 * 60 * 1000;

const filters: NotificationFilter[] = ["todas", "leida", "no leida", "archivada"];

export default function Navbar() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    open,
    filter,
    visibleNotifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    notificationRef,
    toggleNotifications,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    loadMoreNotifications,
    hasMore,
    refreshNotifications,
    isLoggedIn,
    setIsLoggedIn,
  } = useNotifications();

  const clearSession = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
    localStorage.removeItem("token");
    setUser(null);
    setIsPanelOpen(false);
    setShowLogoutModal(false);
    window.dispatchEvent(new Event("propbol:session-changed"));
  };

  const isSessionExpired = () => {
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);
    if (!expiresAt) return true;
    return Date.now() > Number(expiresAt);
  };

  const restoreSession = () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);

    if (!savedUser || !expiresAt) {
      clearSession();
      return;
    }

    if (Date.now() > Number(expiresAt)) {
      clearSession();
      return;
    }
    try {
      setUser(JSON.parse(savedUser));
    } catch {
      clearSession();
    }
  };

  useEffect(() => {
    restoreSession();

    const handleSessionChange = () => restoreSession();

    window.addEventListener("propbol:login", handleSessionChange);
    window.addEventListener("propbol:session-changed", handleSessionChange);

    return () => {
      window.removeEventListener("propbol:login", handleSessionChange);
      window.removeEventListener("propbol:session-changed", handleSessionChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && isSessionExpired()) {
        clearSession();
        router.push("/");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, router]);

  const togglePanel = () => {
    if (user && isSessionExpired()) {
      clearSession();
      router.push("/");
      return;
    }
    setIsPanelOpen((prev) => !prev);
  };

  const handleLoginRedirect = () => {
    router.push("/sign-in");
  };

  const handleLoginMock = () => {
    const mockUser: User = {
      name: "Juan Perez",
      email: "juan.perez@gmail.com",
    };
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    setUser(mockUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
    setIsLoggedIn(true);
  };

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    if (isLoggingOut) return;
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/logout`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch {
        // si falla la red igual limpiamos la sesión local
      }
    }

    clearSession();
    setIsLoggingOut(false);
    router.push("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b-2 border-[#D97706] bg-[#f5f5f4] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Logo />
              <NavLinks />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="relative rounded-full p-2 transition hover:bg-[#D97706]/10"
                  aria-label="Abrir notificaciones"
                >
                  <Bell className="h-6 w-6 text-[#78716c]" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#D97706] px-1 text-xs font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {open ? (
                  <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-[#f5f5f4] bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#f5f5f4] px-4 py-3">
                      <h3 className="text-sm font-semibold text-[#292524]">
                        Notificaciones
                      </h3>
                      {isLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => void markAllAsRead()}
                          className="inline-flex items-center gap-1 text-xs text-[#D97706] transition hover:text-[#b45309]"
                        >
                          <CheckCheck className="h-4 w-4" />
                          Marcar todas
                        </button>
                      ) : null}
                    </div>

                    {!isLoggedIn ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-[#78716c]">
                          Inicia sesión para recibir notificaciones
                        </p>
                        <div className="mt-3 flex justify-center">
                          <button
                            type="button"
                            onClick={handleLoginMock}
                            className="rounded-full bg-[#D97706] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#b45309]"
                          >
                            Iniciar sesión
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2 border-b border-[#f5f5f4] px-4 py-3">
                          {filters.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setFilter(item)}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                filter === item
                                  ? "bg-[#D97706] text-white"
                                  : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#D97706]/10 hover:text-[#292524]"
                              }`}
                            >
                              {item === "todas"
                                ? "Todas"
                                : item === "leida"
                                  ? "Leídas"
                                  : item === "no leida"
                                    ? "No leídas"
                                    : "Archivadas"}
                            </button>
                          ))}
                        </div>

                        <div
                          className="max-h-80 overflow-y-auto"
                          onScroll={(e) => {
                            const target = e.currentTarget;
                            const reachedBottom =
                              target.scrollTop + target.clientHeight >=
                              target.scrollHeight - 10;
                            if (reachedBottom && hasMore && !isLoadingMore) {
                              void loadMoreNotifications();
                            }
                          }}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[#78716c]">
                              <Loader2 className="h-4 w-4 animate-spin text-[#D97706]" />
                              Cargando notificaciones...
                            </div>
                          ) : error ? (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm text-red-500">{error}</p>
                              <button
                                type="button"
                                onClick={() => void refreshNotifications(filter)}
                                className="mt-3 rounded border border-[#f5f5f4] px-3 py-1 text-sm text-[#78716c] transition hover:bg-[#f5f5f4]"
                              >
                                Reintentar
                              </button>
                            </div>
                          ) : visibleNotifications.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-[#78716c]">
                              No hay notificaciones
                            </p>
                          ) : (
                            <>
                              {visibleNotifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`border-b border-[#f5f5f4] px-4 py-3 transition hover:bg-[#f5f5f4] ${
                                    notification.status === "no leida"
                                      ? "bg-[#D97706]/5"
                                      : "bg-white"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-[#292524]">
                                        {notification.title?.trim() || "(Sin título)"}
                                      </p>
                                      <p className="mt-1 text-sm text-[#78716c]">
                                        {notification.description?.trim() ||
                                          "(Sin descripción disponible)"}
                                      </p>
                                      <span className="mt-2 inline-block text-[10px] uppercase text-[#78716c]">
                                        {notification.status}
                                      </span>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                      {notification.status === "no leida" ? (
                                        <button
                                          type="button"
                                          onClick={() => void markAsRead(notification.id)}
                                          className="text-xs text-[#D97706] transition hover:text-[#b45309]"
                                        >
                                          Leer
                                        </button>
                                      ) : null}

                                      {!notification.archived ? (
                                        <button
                                          type="button"
                                          onClick={() => void archiveNotification(notification.id)}
                                          className="text-xs text-[#78716c] transition hover:text-[#D97706]"
                                          aria-label="Archivar notificación"
                                        >
                                          <Archive className="h-4 w-4" />
                                        </button>
                                      ) : null}

                                      <button
                                        type="button"
                                        onClick={() => void deleteNotification(notification.id)}
                                        className="text-xs text-red-500 transition hover:text-red-600"
                                        aria-label="Eliminar notificación"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {isLoadingMore ? (
                                <p className="px-4 py-3 text-center text-xs text-[#78716c]">
                                  Cargando más notificaciones...
                                </p>
                              ) : null}
                            </>
                          )}
                        </div>

                        <div className="border-t border-[#f5f5f4] px-4 py-3 text-center">
                          <Link
                            href="/notificaciones"
                            className="text-sm font-medium text-[#D97706] transition hover:text-[#b45309]"
                          >
                            Ver todas las notificaciones
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={panelRef}>
                <UserMenu
                  user={user}
                  isPanelOpen={isPanelOpen}
                  onTogglePanel={togglePanel}
                  onClosePanel={() => setIsPanelOpen(false)}
                  onLogin={handleLoginRedirect}
                  onOpenLogoutModal={handleOpenLogoutModal}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LogoutModal
        show={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}