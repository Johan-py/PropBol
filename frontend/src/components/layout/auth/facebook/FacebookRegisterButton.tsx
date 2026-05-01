"use client";

import { useEffect, useRef, useState } from "react";

type FacebookRegisterSuccessPayload = {
  type: "propbol:facebook-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type FacebookRegisterErrorPayload = {
  type: "propbol:facebook-login-error";
  code: string;
  message: string;
};

type FacebookPopupMessage =
  | FacebookRegisterSuccessPayload
  | FacebookRegisterErrorPayload;

type FacebookRegisterButtonProps = {
  onSuccess: (payload: FacebookRegisterSuccessPayload) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
};

const FACEBOOK_LOGIN_TIMEOUT_MS = 2 * 60 * 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function FacebookLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
      fill="#1877F2"
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export default function FacebookRegisterButton({
  onSuccess,
  onError,
  disabled = false,
}: FacebookRegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const cleanup = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    window.removeEventListener("message", handleMessage);
    setIsLoading(false);
  };

  const handleMessage = async (event: MessageEvent<FacebookPopupMessage>) => {
    const expectedOrigin = new URL(API_URL).origin;

    if (event.origin !== expectedOrigin) return;

    const data = event.data;

    if (!data || typeof data !== "object" || !("type" in data)) return;

    cleanup();

    if (data.type === "propbol:facebook-login-error") {
      onError?.(data.message || "No se pudo completar el registro con Facebook.");
      return;
    }

    await onSuccess(data);
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handleFacebookRegister = () => {
    if (disabled || isLoading) return;

    onError?.("");
    setIsLoading(true);

    const popupWidth = 500;
    const popupHeight = 650;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popup = window.open(
      `${API_URL}/api/auth/facebook/register`,
      "facebook-register",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setIsLoading(false);
      onError?.(
        "El navegador bloqueó la ventana emergente. Habilita los pop-ups e intenta nuevamente.",
      );
      return;
    }

    popupRef.current = popup;
    popup.focus();

    window.addEventListener("message", handleMessage);

    intervalRef.current = window.setInterval(() => {
      if (!popupRef.current || !popupRef.current.closed) return;
      cleanup();
      onError?.("Cancelaste el registro con Facebook. Intenta nuevamente.");
    }, 500);

    timeoutRef.current = window.setTimeout(() => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
      cleanup();
      onError?.(
        "La autenticación con Facebook tardó demasiado. Intenta nuevamente.",
      );
    }, FACEBOOK_LOGIN_TIMEOUT_MS);
  };

  return (
    <button
      type="button"
      onClick={handleFacebookRegister}
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#166FE5] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FacebookLogo />
      {isLoading ? "Conectando con Facebook..." : "Continuar con Facebook"}
    </button>
  );
}
