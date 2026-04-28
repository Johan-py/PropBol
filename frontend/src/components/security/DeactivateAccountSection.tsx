"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_PASSWORD_LENGTH = 255;
const AUTH_ERROR_STATUSES = [401, 403];

type DeactivateResponse = {
  message: string;
  verificationToken?: string;
};

const notifySecurityAuthError = () => {
  window.dispatchEvent(new Event("propbol:auth-error"));
};

const isSecurityAuthError = (status: number) => {
  return AUTH_ERROR_STATUSES.includes(status);
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
  const [showEmailCodeModal, setShowEmailCodeModal] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeError, setEmailCodeError] = useState("");
  const [emailCodeSuccess, setEmailCodeSuccess] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");

  const resetPasswordState = () => {
    setPassword("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(false);
    setShowPassword(false);
  };

  const resetEmailCodeState = () => {
    setEmailCode("");
    setEmailCodeError("");
    setEmailCodeSuccess("");
    setIsSendingCode(false);
    setIsVerifyingCode(false);
    setEmailVerificationToken("");
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
    resetEmailCodeState();
  };

  const handleCancelPassword = () => {
    setShowPasswordModal(false);
    resetPasswordState();
    resetEmailCodeState();
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  const handleCancelEmailCode = () => {
    setShowEmailCodeModal(false);
    resetEmailCodeState();
  };

  const handleOpenEmailVerification = async () => {
    try {
      setErrorMessage("");
      setEmailCodeError("");
      setEmailCodeSuccess("");

      if (!API_URL) {
        setErrorMessage("No se configuró NEXT_PUBLIC_API_URL en el frontend.");
        return;
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        notifySecurityAuthError();
        return;
      }

      setIsSendingCode(true);

      const response = await fetch(
        `${API_URL}/api/security/deactivate-account/send-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (isSecurityAuthError(response.status)) {
        notifySecurityAuthError();
        return;
      }

      const data = (await response.json()) as DeactivateResponse;

      if (!response.ok) {
        setErrorMessage(data.message || "No se pudo enviar el código.");
        return;
      }

      setEmailVerificationToken(data.verificationToken || "");
      setShowPasswordModal(false);
      setShowEmailCodeModal(true);
      setEmailCode("");
      setEmailCodeSuccess("Enviamos un código al correo asociado a tu cuenta.");
    } catch {
      setErrorMessage("No se pudo conectar con el servidor.");
    } finally {
      setIsSendingCode(false);
    }
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
        notifySecurityAuthError();
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

      if (isSecurityAuthError(response.status)) {
        notifySecurityAuthError();
        return;
      }

      const data = (await response.json()) as DeactivateResponse;

      if (!response.ok) {
        setErrorMessage(data.message || "No se pudo desactivar la cuenta.");
        return;
      }

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

  const handleDeactivateAccountWithCode = async () => {
    try {
      setEmailCodeError("");
      setEmailCodeSuccess("");

      const trimmedCode = emailCode.trim();

      if (!trimmedCode) {
        setEmailCodeError("El código es obligatorio.");
        return;
      }

      if (!/^\d{6}$/.test(trimmedCode)) {
        setEmailCodeError("El código debe tener exactamente 6 dígitos.");
        return;
      }

      if (!emailVerificationToken) {
        setEmailCodeError(
          "No se encontró la verificación del código. Solicita uno nuevo.",
        );
        return;
      }

      if (!API_URL) {
        setEmailCodeError(
          "No se configuró NEXT_PUBLIC_API_URL en el frontend.",
        );
        return;
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        notifySecurityAuthError();
        return;
      }

      setIsVerifyingCode(true);

      const response = await fetch(
        `${API_URL}/api/security/deactivate-account/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            codigo: trimmedCode,
            verificationToken: emailVerificationToken,
          }),
        },
      );

      if (isSecurityAuthError(response.status)) {
        notifySecurityAuthError();
        return;
      }

      const data = (await response.json()) as DeactivateResponse;

      if (!response.ok) {
        setEmailCodeError(data.message || "No se pudo validar el código.");
        return;
      }

      setEmailCodeSuccess("Tu cuenta fue desactivada. Redirigiendo...");
      clearClientSession();

      window.setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      setEmailCodeError("No se pudo conectar con el servidor.");
    } finally {
      setIsVerifyingCode(false);
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
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !isSubmitting) {
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

            <div className="mt-3">
              <p className="text-sm text-neutral-600">
                Si te registraste con Google, Discord u otro método externo,
                puedes verificar mediante correo.
              </p>

              <button
                type="button"
                onClick={handleOpenEmailVerification}
                disabled={isSubmitting || !!successMessage || isSendingCode}
                className="mt-2 text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingCode
                  ? "Enviando código..."
                  : "Verificación mediante correo"}
              </button>
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

      {showEmailCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-300 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-1 text-red-500">✉</div>

              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Verificación mediante correo
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Ingresa el código enviado al correo asociado a tu cuenta para
                  desactivarla.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email-code"
                className="text-sm font-medium text-neutral-700"
              >
                Código de verificación
              </label>

              <div className="flex h-11 items-center rounded-lg border border-neutral-300 px-3">
                <input
                  id="email-code"
                  type="text"
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !isVerifyingCode) {
                      void handleDeactivateAccountWithCode();
                    }
                  }}
                  placeholder="123456"
                  maxLength={6}
                  disabled={isVerifyingCode}
                  className="w-full border-none bg-transparent text-sm text-neutral-900 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {emailCodeError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {emailCodeError}
              </p>
            )}

            {emailCodeSuccess && (
              <p className="mt-3 text-sm font-medium text-green-600">
                {emailCodeSuccess}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEmailCode}
                disabled={isVerifyingCode}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeactivateAccountWithCode}
                disabled={isVerifyingCode}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifyingCode ? "Verificando..." : "Desactivar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
