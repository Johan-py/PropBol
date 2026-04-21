"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_PASSWORD_LENGTH = 255;

type DeactivateResponse = {
  message: string;
};
const clearClientSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("propbol_user");
  localStorage.removeItem("propbol_session_expires");
  localStorage.removeItem("nombre");
  localStorage.removeItem("correo");
  localStorage.removeItem("avatar");

  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
};

export default function DeactivateAccountSection() {
  const router = useRouter();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPasswordState = () => {
    setPassword("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(false);
    setShowPassword(false);
  };

  const handleOpenWarning = () => {
    setShowWarningModal(true);
  };

  const handleCancelWarning = () => {
    setShowWarningModal(false);
  };

  const handleContinueToPassword = () => {
    setShowWarningModal(false);
    setShowPasswordModal(true);
    resetPasswordState();
  };

  const handleCancelPassword = () => {
    setShowPasswordModal(false);
    resetPasswordState();
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  const handleDeactivateAccount = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const trimmedPassword = password.trim();

      if (!trimmedPassword) {
        setErrorMessage(
          "La contraseña es obligatoria y no puede contener solo espacios en blanco.",
        );
        return;
      }

      if (password.length > MAX_PASSWORD_LENGTH) {
        setErrorMessage(
          `La contraseña no puede superar ${MAX_PASSWORD_LENGTH} caracteres.`,
        );
        return;
      }

      if (!API_URL) {
        setErrorMessage("No se configuró NEXT_PUBLIC_API_URL en el frontend.");
        return;
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setErrorMessage("No se encontró la sesión del usuario.");
        return;
      }

      setIsSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/security/deactivate-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        },
      );

      const data = (await response.json()) as DeactivateResponse;

      if (!response.ok) {
        setErrorMessage(data.message || "No se pudo desactivar la cuenta.");
        return;
      }

      // Cuenta desactivada: mostrar mensaje, limpiar sesión y redirigir al home
      setSuccessMessage("Tu cuenta fue desactivada. Redirigiendo...");
      clearClientSession();

      window.setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      setErrorMessage("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Desactiva tu cuenta de PropBol
          </h1>
        </header>

        <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-red-500">⚠</div>

              <div>
                <h3 className="text-sm font-semibold text-red-700">
                  Advertencia
                </h3>
                <p className="mt-1 text-sm text-red-600">
                  Al desactivar tu cuenta ya no podrás iniciar sesión
                  nuevamente.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenWarning}
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Desactivar mi cuenta
          </button>
        </div>
      </div>

      {/* Modal 1: Confirmación de intención */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-300 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-1 text-red-500">⚠</div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  ¿Estás seguro de que quieres desactivar tu cuenta?
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Esta acción requiere confirmar tu contraseña.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelWarning}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleContinueToPassword}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmación con contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-300 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-1 text-red-500">⚠</div>

              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Confirmación final
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Ingresa tu contraseña actual para desactivar tu cuenta.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="current-password"
                className="text-sm font-medium text-neutral-700"
              >
                Ingresa tu contraseña
              </label>

              <div className="flex h-11 items-center rounded-lg border border-neutral-300 px-3">
                <input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmitting) {
                      void handleDeactivateAccount();
                    }
                  }}
                  placeholder="••••••••"
                  maxLength={MAX_PASSWORD_LENGTH}
                  disabled={isSubmitting || !!successMessage}
                  className="w-full border-none bg-transparent text-sm text-neutral-900 outline-none disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={handleTogglePasswordVisibility}
                  className="ml-3 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="mt-3 text-sm font-medium text-green-600">
                {successMessage}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelPassword}
                disabled={isSubmitting || !!successMessage}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeactivateAccount}
                disabled={isSubmitting || !!successMessage}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Desactivando..." : "Desactivar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
