"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginResponse = {
  message?: string;
  token?: string;
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type GooglePopupSuccessMessage = {
  type: "propbol:google-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type GooglePopupErrorMessage = {
  type: "propbol:google-login-error";
  code: "GOOGLE_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED" | string;
  message: string;
};

type GooglePopupMessage = GooglePopupSuccessMessage | GooglePopupErrorMessage;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const LOGIN_TIMEOUT_MS = 10000;
const GOOGLE_LOGIN_TIMEOUT_MS = 2 * 60 * 1000;
const DEFAULT_POST_LOGIN_REDIRECT = "/";
const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";

const NO_CONNECTION_MESSAGE =
  "Sin conexión a internet. Verifica tu red e intenta nuevamente.";
const SERVER_CONNECTION_MESSAGE =
  "No se pudo conectar con el servidor. Intenta nuevamente.";
const LOGIN_TIMEOUT_MESSAGE =
  "La solicitud tardó demasiado. Por favor intenta nuevamente.";
const GOOGLE_TIMEOUT_MESSAGE =
  "La autenticación con Google tardó demasiado. Por favor intenta nuevamente.";

const saveSession = (token: string, user?: LoginResponse["user"]) => {
  localStorage.setItem("token", token);

  const userName =
    user?.nombre && user?.apellido
      ? `${user.nombre} ${user.apellido}`
      : (user?.correo ?? "Usuario");

  localStorage.setItem(
    "propbol_user",
    JSON.stringify({
      name: userName,
      email: user?.correo ?? "",
    }),
  );

  localStorage.setItem(
    "propbol_session_expires",
    String(Date.now() + 60 * 60 * 1000),
  );

  window.dispatchEvent(new Event("propbol:login"));
  window.dispatchEvent(new Event("propbol:session-changed"));
};

const getRedirectAfterLogin = () => {
  const redirect = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);

  if (!redirect || !redirect.startsWith("/")) {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }

  return redirect;
};

const clearRedirectAfterLogin = () => {
  localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
};

const isGooglePopupMessage = (value: unknown): value is GooglePopupMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "type" in value;
};

const hasNoInternetConnection = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return !navigator.onLine;
};

const getRequestErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.name === "AbortError") {
    return LOGIN_TIMEOUT_MESSAGE;
  }

  if (hasNoInternetConnection()) {
    return NO_CONNECTION_MESSAGE;
  }

  return SERVER_CONNECTION_MESSAGE;
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>(
    {},
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const redirectAfterSuccessfulLogin = () => {
    const redirect = getRedirectAfterLogin();
    clearRedirectAfterLogin();
    router.push(redirect);
  };

  const isFormValid =
    correo.length > 0 &&
    password.length > 0 &&
    !errors.correo &&
    !errors.password;

  const validate = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === "correo") {
      if (!value) {
        newErrors.correo = "El correo es obligatorio";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.correo = "Formato de correo inválido";
      } else {
        delete newErrors.correo;
      }
    }

    if (field === "password") {
      if (!value) {
        newErrors.password = "La contraseña es obligatoria";
      } else if (value.length > 16) {
        newErrors.password =
          "La contraseña no puede tener más de 16 caracteres";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const handleGoogleLogin = () => {
    setGoogleError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingGoogle(true);

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      `${API_URL}/api/auth/google/login`,
      "google-login",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );

    if (
      !popupWindow ||
      popupWindow.closed ||
      typeof popupWindow.closed === "undefined"
    ) {
      setGoogleError(
        "El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.",
      );
      setIsLoadingGoogle(false);
      return;
    }

    const popup = popupWindow;
    popup.focus();

    const expectedOrigin = new URL(API_URL).origin;
    let authWasResolved = false;
    let checkPopupIntervalId = 0;
    let googleTimeoutId = 0;

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(checkPopupIntervalId);
      window.clearTimeout(googleTimeoutId);

      if (shouldStopLoading) {
        setIsLoadingGoogle(false);
      }
    }

    function handleMessage(event: MessageEvent<GooglePopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }

      if (!isGooglePopupMessage(event.data)) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (event.data.type === "propbol:google-login-success") {
        saveSession(event.data.token, event.data.user);
        setSuccessMessage(
          event.data.message || "Inicio de sesión con Google exitoso",
        );
        setIsLoadingGoogle(false);
        popup.close();

        window.setTimeout(() => {
          redirectAfterSuccessfulLogin();
        }, 1000);

        return;
      }

      setGoogleError(
        event.data.message || "No se pudo iniciar sesión con Google.",
      );
      setIsLoadingGoogle(false);
      popup.close();
    }

    checkPopupIntervalId = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }

      cleanup();

      if (!authWasResolved) {
        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE);
          return;
        }

        const tokenGuardado = localStorage.getItem("token");

        if (!tokenGuardado) {
          setGoogleError(
            "Cancelaste el inicio de sesión con Google. Puedes intentarlo nuevamente.",
          );
        }
      }
    }, 500);

    googleTimeoutId = window.setTimeout(() => {
      cleanup();

      if (!popup.closed) {
        popup.close();
      }

      setGoogleError(
        hasNoInternetConnection()
          ? NO_CONNECTION_MESSAGE
          : GOOGLE_TIMEOUT_MESSAGE,
      );
    }, GOOGLE_LOGIN_TIMEOUT_MS);

    window.addEventListener("message", handleMessage);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedCorreo = correo.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const newErrors: { correo?: string; password?: string } = {};

    if (!trimmedCorreo) {
      newErrors.correo = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(trimmedCorreo)) {
      newErrors.correo = "Formato de correo inválido";
    }

    if (!trimmedPassword) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleError("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (hasNoInternetConnection()) {
      setPassword("");
      setErrorMessage(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, LOGIN_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: trimmedCorreo,
          password: trimmedPassword,
        }),
        signal: controller.signal,
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setPassword("");

        if (response.status
