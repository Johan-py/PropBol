"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay sesión activa");
      return;
    }

    if (!passwordActual.trim()) {
      setError("Debes ingresar tu contraseña actual");
      return;
    }

    if (!nuevaPassword.trim()) {
      setError("Debes ingresar la nueva contraseña");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/perfil/verificar-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordActual: passwordActual.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.msg || "Contraseña incorrecta");
      }

      setSuccess("La contraseña actual es correcta");
    } catch (error: any) {
      setError(error.message || "Error al verificar la contraseña actual");
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
            onChange={(val) => {
              setNuevaPassword(val);
              if (error === "Las contraseñas no coinciden" && val === confirmarPassword) {
                setError("");
              }
            }}
          />

          <PasswordField
            label="Confirma tu nueva contraseña"
            placeholder="••••••••"
            value={confirmarPassword}
            onChange={(val) => {
              setConfirmarPassword(val);
              if (error === "Las contraseñas no coinciden" && val === nuevaPassword) {
                setError("");
              }
            }}
          />

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          {success && (
            <p className="text-sm font-medium text-green-600">{success}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Verificando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
