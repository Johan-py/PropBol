"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Info } from "lucide-react";

export default function TwoFactorSection() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showDisableModal, setShowDisableModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  const handleCancel = () => {
    setShowModal(false);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingStatus(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/security/2fa-status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            cache: "no-store",
          },
        );

        const data = await res.json();

        if (res.ok) {
          setIsTwoFactorEnabled(Boolean(data.two_factor_activo));
          setIsGoogleUser(Boolean(data.isGoogleUser));
        }
      } catch {
        console.error("No se pudo obtener el estado 2FA");
      } finally {
        setLoadingStatus(false);
      }
    };

    fetch2FAStatus();
  }, []);

  const handleConfirm = async () => {
    // Si es usuario normal, validar que haya escrito contraseña
    if (!isGoogleUser && !password.trim()) {
      setError("Este campo es obligatorio");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró una sesión válida");
        return;
      }

      const body = isGoogleUser ? {} : { password };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/security/activate-2fa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        setPassword("");
        setShowPassword(false);
        setError("");
        setIsTwoFactorEnabled(true);
        return;
      }

      setError(
        data.message ?? "No se pudo activar la verificación en dos pasos",
      );
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDisableModal = () => setShowDisableModal(true);
  const handleCloseDisableModal = () => setShowDisableModal(false);

  const handleConfirmDisable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró una sesión válida");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/deactivate-2fa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        setIsTwoFactorEnabled(false);
        setShowDisableModal(false);
        setShowModal(false);
        setPassword("");
        setShowPassword(false);
        setError("");
        return;
      }

      setError(
        data.message ?? "No se pudo desactivar la verificación en dos pasos",
      );
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Verificación en dos pasos
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Protege tu cuenta con un código de verificación enviado a tu correo
            electrónico.
          </p>
        </header>
        <div className="max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm text-neutral-500">
              Cargando estado de verificación en dos pasos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Verificación en dos pasos
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Protege tu cuenta con un código de verificación enviado a tu correo
          electrónico.
        </p>
      </header>

      <div className="max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          {!isTwoFactorEnabled ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white">
                  <Info className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    ¿Cómo funciona?
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                    Cada vez que inicies sesión, recibirás un código de
                    verificación en tu correo electrónico. Deberás ingresar ese
                    código para completar el inicio de sesión.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Activar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Verificación en dos pasos activado
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                    Tu cuenta ahora está protegida con un segundo paso de
                    verificación al iniciar sesión.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenDisableModal}
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Desactivar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal desactivar */}
      {showDisableModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseDisableModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-neutral-900">
              Confirmar desactivación
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              ¿Estás seguro de que deseas desactivar la verificación en dos
              pasos?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleCloseDisableModal}
                className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDisable}
                className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal activar */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {isGoogleUser ? (
              // --- Flujo Google: sin contraseña ---
              <>
                <h3 className="text-base font-semibold text-neutral-900">
                  Activar verificación en dos pasos
                </h3>
                <p className="mt-2 mb-4 text-sm text-neutral-500">
                  Tu identidad fue verificada mediante Google. Puedes activar el
                  2FA directamente.
                </p>
                {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                  >
                    {loading ? "Activando..." : "Confirmar con Google"}
                  </button>
                </div>
              </>
            ) : (
              // --- Flujo normal: con contraseña ---
              <>
                <h3 className="text-base font-semibold text-neutral-900">
                  Ingresa tu contraseña actual para activar la verificación en
                  dos pasos.
                </h3>
                <p className="mt-1 mb-3 text-sm text-neutral-500">
                  Ingresa tu contraseña
                </p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirm();
                    }}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 ${error ? "border-red-400 focus:ring-red-400" : "border-neutral-300 focus:ring-orange-400"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                  >
                    {loading ? "Verificando..." : "Confirmar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
