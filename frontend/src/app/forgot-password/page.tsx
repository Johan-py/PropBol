"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const correoNormalizado = correo.trim().toLowerCase();

    if (!correoNormalizado) {
      setError("El correo es obligatorio");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(correoNormalizado)) {
      setError("Formato de correo inválido");
      return;
    }

    setError("");

    // Por ahora solo cumple navegación y captura del correo.
    // El siguiente criterio conectará esto con backend o envío de correo.
    console.log("Correo para recuperación:", correoNormalizado);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          ¿Olvidaste tu contraseña?
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Ingresa el correo electrónico de tu cuenta para que podamos enviarte
          un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ingresa tu correo electrónico"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-orange-400 py-2 text-sm font-semibold text-white hover:bg-orange-500"
          >
            Enviar correo electrónico
          </button>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-md bg-gray-700 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Regresar
          </button>
        </form>
      </div>
    </main>
  );
}