"use client";

import { useState } from "react";

export default function DeactivateAccountSection() {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");

  const closeAllModals = () => {
    setShowWarningModal(false);
    setShowPasswordModal(false);
    setPassword("");
  };

  const handleOpenWarning = () => {
    setShowWarningModal(true);
  };

  const handleContinueToPassword = () => {
    setShowWarningModal(false);
    setShowPasswordModal(true);
  };

  const handleCancelWarning = () => {
    setShowWarningModal(false);
  };

  const handleCancelPassword = () => {
    setShowPasswordModal(false);
    setPassword("");
  };

  const handleFakeDeactivate = () => {
    // Solo frontend, sin funcionalidad real
    setShowPasswordModal(false);
    setPassword("");
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
                  Esta acción solo es visual por ahora y no tendrá efecto real.
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
                  Por seguridad, ingresa tu contraseña actual para desactivar tu
                  cuenta.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label
                htmlFor="current-password"
                className="text-sm font-medium text-neutral-700"
              >
                Ingresa tu contraseña
              </label>

              <input
                id="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelPassword}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleFakeDeactivate}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Desactivar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
