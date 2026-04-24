"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type PasswordFieldProps = Readonly<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}>;

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">{label}</label>

      <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3">
        <LockKeyhole className="h-4 w-4 text-neutral-400" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full border-none bg-transparent px-3 text-sm text-neutral-900 outline-none"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-neutral-400 transition hover:text-neutral-600"
          aria-label={
            showPassword
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function PasswordSection() {
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null);

  const usuarioGuardado =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("propbol_user") || "{}")
      : {};

  const usuarioKey =
    usuarioGuardado?.email || usuarioGuardado?.correo || "anonimo";

  const claveIntentos = useMemo(
    () => `cambio_password_intentos_${usuarioKey}`,
    [usuarioKey],
  );

  const claveBloqueo = useMemo(
    () => `cambio_password_bloqueado_hasta_${usuarioKey}`,
    [usuarioKey],
  );

  const bloqueado =
    bloqueadoHasta !== null && Date.now() < Number(bloqueadoHasta);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const intentosGuardados = localStorage.getItem(claveIntentos);
    const bloqueoGuardado = localStorage.getItem(claveBloqueo);

    if (intentosGuardados) {
      setIntentosFallidos(Number(intentosGuardados));
    } else {
      setIntentosFallidos(0);
    }

    if (bloqueoGuardado) {
      const tiempoBloqueo = Number(bloqueoGuardado);

      if (Date.now() < tiempoBloqueo) {
        setBloqueadoHasta(tiempoBloqueo);
      } else {
        localStorage.removeItem(claveIntentos);
        localStorage.removeItem(claveBloqueo);
        setBloqueadoHasta(null);
        setIntentosFallidos(0);
      }
    } else {
      setBloqueadoHasta(null);
    }
  }, [claveIntentos, claveBloqueo]);

  useEffect(() => {
    if (!bloqueadoHasta) return;

    const intervalo = setInterval(() => {
      if (Date.now() >= bloqueadoHasta) {
        setBloqueadoHasta(null);
        setIntentosFallidos(0);
        localStorage.removeItem(claveIntentos);
        localStorage.removeItem(claveBloqueo);
        clearInterval(intervalo);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [bloqueadoHasta, claveIntentos, claveBloqueo]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (bloqueado) {
      setError("Has superado los 5 intentos fallidos. Intenta más tarde.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay sesión activa");
      return;
    }

    if (
      !passwordActual.trim() ||
      !nuevaPassword.trim() ||
      !confirmarPassword.trim()
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (nuevaPassword.trim().length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordActual.trim() === nuevaPassword.trim()) {
      setError("La nueva contraseña no puede ser igual a la actual");
      return;
    }

    if (nuevaPassword.trim() !== confirmarPassword.trim()) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/perfil/cambiar-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordActual: passwordActual.trim(),
          nuevaPassword: nuevaPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (typeof data.intentosFallidos === "number") {
          setIntentosFallidos(data.intentosFallidos);
          localStorage.setItem(claveIntentos, String(data.intentosFallidos));
        }

        if (data.bloqueado && data.bloqueoHasta) {
          const tiempoBloqueo = new Date(data.bloqueoHasta).getTime();
          setBloqueadoHasta(tiempoBloqueo);
          localStorage.setItem(claveBloqueo, String(tiempoBloqueo));
        }

        throw new Error(data.msg || "Error al actualizar la contraseña");
      }

      setIntentosFallidos(0);
      setBloqueadoHasta(null);
      localStorage.removeItem(claveIntentos);
      localStorage.removeItem(claveBloqueo);

      setSuccess("Contraseña actualizada correctamente");
      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (error: any) {
      setError(error.message || "Error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Cambiar contraseña
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Actualiza tu contraseña para mantener tu cuenta segura.
        </p>
      </header>

      <div className="max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <PasswordField
            label="Ingresa tu contraseña actual"
            placeholder="••••••••"
            value={passwordActual}
            onChange={setPasswordActual}
          />

          <PasswordField
            label="Ingresa tu nueva contraseña"
            placeholder="••••••••"
            value={nuevaPassword}
            onChange={setNuevaPassword}
          />

          <PasswordField
            label="Confirma tu nueva contraseña"
            placeholder="••••••••"
            value={confirmarPassword}
            onChange={setConfirmarPassword}
          />

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          {!error && intentosFallidos > 0 && !bloqueado && (
            <p className="text-sm font-medium text-amber-600">
              Intentos fallidos: {intentosFallidos} de 5
            </p>
          )}

          {success && (
            <p className="text-sm font-medium text-green-600">{success}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || bloqueado}
            className={`mt-2 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition ${
              isLoading || bloqueado
                ? "cursor-not-allowed bg-orange-300"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isLoading
              ? "Verificando..."
              : bloqueado
                ? "Bloqueado"
                : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
