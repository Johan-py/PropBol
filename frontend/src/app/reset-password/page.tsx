"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md text-center">
          <p className="text-red-500 font-medium">Enlace inválido o expirado.</p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="mt-4 w-full rounded-md bg-orange-400 py-2 text-sm font-semibold text-white hover:bg-orange-500"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo restablecer la contraseña");
        return;
      }

      setSuccess(data.message);
      setTimeout(() => router.push("/sign-in"), 2500);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Reestablece tu contraseña
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Ingresa tu nueva contraseña"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirma tu nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Ingresa tu contraseña nuevamente"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              {success} Redirigiendo...
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !!success}
            className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
              isLoading || success
                ? "cursor-not-allowed bg-orange-300"
                : "bg-orange-400 hover:bg-orange-500"
            }`}
          >
            {isLoading ? "Guardando..." : "Cambiar mi contraseña"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-md bg-gray-700 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
