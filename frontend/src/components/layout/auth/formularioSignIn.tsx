"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildSessionUser, USER_STORAGE_KEY } from "@/lib/session";

type LoginResponse = {
  message?: string;
  token?: string;
  requires2FA?: boolean;
  userId?: number;
  email?: string;
  expiresInMinutes?: number;
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
  };
};

type MeResponse = {
  message?: string;
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
    controlador?: boolean;
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

type DiscordPopupSuccessMessage = {
  type: "propbol:discord-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type DiscordPopupErrorMessage = {
  type: "propbol:discord-login-error";
  code: "DISCORD_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED" | string;
  message: string;
};

type DiscordPopupMessage =
  | DiscordPopupSuccessMessage
  | DiscordPopupErrorMessage;

type FacebookPopupSuccessMessage = {
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

type FacebookPopupErrorMessage = {
  type: "propbol:facebook-login-error";
  code: "FACEBOOK_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED" | string;
  message: string;
};

type FacebookPopupMessage =
  | FacebookPopupSuccessMessage
  | FacebookPopupErrorMessage;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const LOGIN_TIMEOUT_MS = 10000;
const GOOGLE_LOGIN_TIMEOUT_MS = 2 * 60 * 1000;
const DEFAULT_POST_LOGIN_REDIRECT = "/";
const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const SESSION_DURATION_MS = 60 * 60 * 1000;
const PENDING_2FA_KEY = "pending2FA";

const NO_CONNECTION_MESSAGE =
  "Sin conexión a internet. Verifica tu red e intenta nuevamente.";
const SERVER_CONNECTION_MESSAGE =
  "No se pudo conectar con el servidor. Intenta nuevamente.";
const LOGIN_TIMEOUT_MESSAGE =
  "La solicitud tardó demasiado. Por favor intenta nuevamente.";
const GOOGLE_TIMEOUT_MESSAGE =
  "La autenticación con Google tardó demasiado. Por favor intenta nuevamente.";
const FACEBOOK_TIMEOUT_MESSAGE =
  "La autenticación con Facebook tardó demasiado. Por favor intenta nuevamente.";

const DEACTIVATED_ACCOUNT_MESSAGE = "Esta cuenta está desactivada";

const clearClientSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem("propbol_session_expires");
  localStorage.removeItem("nombre");
  localStorage.removeItem("correo");
  localStorage.removeItem("avatar");

  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
};

const savePending2FA = (data: {
  userId: number;
  email?: string;
  expiresInMinutes?: number;
}) => {
  localStorage.setItem(
    PENDING_2FA_KEY,
    JSON.stringify({
      userId: data.userId,
      email: data.email ?? "",
      expiresInMinutes: data.expiresInMinutes ?? 5,
      createdAt: Date.now(),
    }),
  );
};

const clearPending2FA = () => {
  localStorage.removeItem(PENDING_2FA_KEY);
};

const saveSession = (
  token: string,
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
  },
  controlador?: boolean
) => {
  localStorage.setItem("token", token);
  const sessionUser = buildSessionUser(user);

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
   localStorage.setItem("controlador", String(controlador ?? false));

  localStorage.setItem("nombre", sessionUser.name);
  localStorage.setItem("correo", sessionUser.email);
  localStorage.setItem("avatar", sessionUser.avatar ?? "");
  localStorage.setItem(
    "propbol_session_expires",
    String(Date.now() + SESSION_DURATION_MS),
  );

  window.dispatchEvent(new Event("propbol:login"));
  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
  window.dispatchEvent(new Event("propbol:token-guardado"));
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

const isFacebookPopupMessage = (
  value: unknown,
): value is FacebookPopupMessage => {
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

const fetchCurrentUser = async (
  token: string,
): Promise<NonNullable<MeResponse["user"]>> => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as MeResponse;

  if (!response.ok || !data.user) {
    throw new Error(data.message || "No se pudo validar la sesión");
  }

  return data.user;
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false);
  const passwordContainerRef = useRef<HTMLDivElement>(null);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>(
    {},
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);

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

  const finalizeValidatedSession = async (
    token: string,
    fallbackUser?: LoginResponse["user"],
  ) => {
    const validatedUser = await fetchCurrentUser(token);

    if (!validatedUser) {
      throw new Error("No se pudo obtener el usuario autenticado.");
    }

    saveSession(token, {
      id: validatedUser.id,
      correo: validatedUser.correo,
      nombre: validatedUser.nombre ?? fallbackUser?.nombre,
      apellido: validatedUser.apellido ?? fallbackUser?.apellido,
      avatar: validatedUser.avatar ?? fallbackUser?.avatar ?? null,
      
    },validatedUser.controlador);
  };

  const handleGoogleLogin = () => {
    clearClientSession();
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

    async function handleMessage(event: MessageEvent<GooglePopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }

      if (!isGooglePopupMessage(event.data)) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (event.data.type === "propbol:google-login-success") {
        try {
          await finalizeValidatedSession(event.data.token, event.data.user);

          setSuccessMessage(
            event.data.message || "Inicio de sesión con Google exitoso",
          );
          setGoogleError("");
          setIsLoadingGoogle(false);
          popup.close();

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin();
          }, 1000);
        } catch (error) {
          clearClientSession();
          setGoogleError(
            error instanceof Error
              ? error.message
              : "No se pudo consolidar la sesión con Google.",
          );
          setIsLoadingGoogle(false);
          popup.close();
        }

        return;
      }

      clearClientSession();
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
        clearClientSession();

        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE);
          return;
        }

        setGoogleError(
          "Cancelaste el inicio de sesión con Google. Puedes intentarlo nuevamente.",
        );
      }
    }, 500);

    googleTimeoutId = window.setTimeout(() => {
      cleanup();
      clearClientSession();

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
    clearClientSession();
    clearPending2FA();

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

        if (response.status === 403) {
          setErrorMessage(DEACTIVATED_ACCOUNT_MESSAGE);
          return;
        }

        if (response.status === 404) {
          setErrorMessage(
            "Esta cuenta no está registrada. Puedes registrarte para crear una cuenta.",
          );
          return;
        }

        setErrorMessage(data.message || "Error al iniciar sesión");
        return;
      }

      if (data.requires2FA) {
        if (!data.userId) {
          clearClientSession();
          setErrorMessage("No se pudo iniciar la verificación en dos pasos");
          return;
        }

        savePending2FA({
          userId: data.userId,
          email: data.email,
          expiresInMinutes: data.expiresInMinutes,
        });

        setSuccessMessage(
          data.message || "Te enviamos un código de verificación",
        );
        setPassword("");

        window.setTimeout(() => {
          router.push("/sign-in/verify-2fa");
        }, 800);

        return;
      }

      if (!data.token) {
        clearClientSession();
        setErrorMessage("El servidor no devolvió un token válido");
        return;
      }

      await finalizeValidatedSession(data.token, data.user);

      setSuccessMessage(data.message || "Inicio de sesión exitoso");

      window.setTimeout(() => {
        redirectAfterSuccessfulLogin();
      }, 1000);
    } catch (error) {
      clearClientSession();
      setPassword("");
      setErrorMessage(getRequestErrorMessage(error));
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    clearClientSession();
    setGoogleError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingFacebook(true);

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      `${API_URL}/api/auth/facebook/login`,
      "facebook-login",
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
      setIsLoadingFacebook(false);
      return;
    }

    const popup = popupWindow;
    popup.focus();

    const expectedOrigin = new URL(API_URL).origin;
    let authWasResolved = false;
    let checkPopupIntervalId = 0;
    let facebookTimeoutId = 0;

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(checkPopupIntervalId);
      window.clearTimeout(facebookTimeoutId);

      if (shouldStopLoading) {
        setIsLoadingFacebook(false);
      }
    }

    async function handleMessage(event: MessageEvent<FacebookPopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }
      if (!isFacebookPopupMessage(event.data)) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (event.data.type === "propbol:facebook-login-success") {
        try {
          await finalizeValidatedSession(event.data.token, event.data.user);

          setSuccessMessage(
            event.data.message || "Inicio de sesión con Facebook exitoso",
          );
          setGoogleError("");
          setIsLoadingFacebook(false);
          popup.close();

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin();
          }, 1000);
        } catch (error) {
          clearClientSession();
          setGoogleError(
            error instanceof Error
              ? error.message
              : "No se pudo consolidar la sesión con Facebook.",
          );
          setIsLoadingFacebook(false);
          popup.close();
        }

        return;
      }

      clearClientSession();
      setGoogleError(
        event.data.message || "No se pudo iniciar sesión con Facebook.",
      );
      setIsLoadingFacebook(false);
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

        setGoogleError(
          "Cancelaste el inicio de sesión con Facebook. Puedes intentarlo nuevamente.",
        );
      }
    }, 500);

    facebookTimeoutId = window.setTimeout(
      () => {
        cleanup();

        if (!popup.closed) {
          popup.close();
        }

        if (!authWasResolved) {
          setGoogleError(FACEBOOK_TIMEOUT_MESSAGE);
        }
      },
      2 * 60 * 1000,
    );

    window.addEventListener("message", handleMessage);
  };

  const handleDiscordLogin = () => {
    clearClientSession();
    setGoogleError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingDiscord(true);

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      `${API_URL}/api/auth/discord/login`,
      "discord-login",
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
      setIsLoadingDiscord(false);
      return;
    }

    const popup = popupWindow;
    popup.focus();

    const expectedOrigin = new URL(API_URL).origin;
    let authWasResolved = false;
    let checkPopupIntervalId = 0;
    let discordTimeoutId = 0;

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(checkPopupIntervalId);
      window.clearTimeout(discordTimeoutId);

      if (shouldStopLoading) {
        setIsLoadingDiscord(false);
      }
    }

    async function handleMessage(event: MessageEvent<DiscordPopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }

      const data = event.data;
      if (
        !data ||
        typeof data !== "object" ||
        !("type" in data) ||
        (data.type !== "propbol:discord-login-success" &&
          data.type !== "propbol:discord-login-error")
      ) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (data.type === "propbol:discord-login-success") {
        try {
          await finalizeValidatedSession(data.token, data.user);

          setSuccessMessage(
            data.message || "Inicio de sesión con Discord exitoso",
          );
          setGoogleError("");
          setIsLoadingDiscord(false);
          popup.close();

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin();
          }, 1000);
        } catch (error) {
          clearClientSession();
          setGoogleError(
            error instanceof Error
              ? error.message
              : "No se pudo consolidar la sesión con Discord.",
          );
          setIsLoadingDiscord(false);
          popup.close();
        }

        return;
      }

      clearClientSession();
      setGoogleError(data.message || "No se pudo iniciar sesión con Discord.");
      setIsLoadingDiscord(false);
      popup.close();
    }

    checkPopupIntervalId = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }

      cleanup();

      if (!authWasResolved) {
        clearClientSession();

        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE);
          return;
        }

        setGoogleError(
          "Cancelaste el inicio de sesión con Discord. Puedes intentarlo nuevamente.",
        );
      }
    }, 500);

    discordTimeoutId = window.setTimeout(() => {
      cleanup();
      clearClientSession();

      if (!popup.closed) {
        popup.close();
      }

      setGoogleError(
        hasNoInternetConnection()
          ? NO_CONNECTION_MESSAGE
          : "La autenticación con Discord tardó demasiado. Por favor intenta nuevamente.",
      );
    }, GOOGLE_LOGIN_TIMEOUT_MS);

    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Iniciar Sesión</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>

          <input
            type="email"
            required
            autoFocus
            placeholder="Ingresa tu correo electrónico"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              validate("correo", e.target.value);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />

          {errors.correo && (
            <p className="mt-1 text-xs text-red-500">{errors.correo}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>

          <div
            className="relative"
            ref={passwordContainerRef}
            onBlur={(e) => {
              if (
                !passwordContainerRef.current?.contains(e.relatedTarget as Node)
              ) {
                setShowPassword(false);
              }
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Ingresa tu contraseña"
              value={password}
              maxLength={16}
              onChange={(e) => {
                setPassword(e.target.value);
                validate("password", e.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="-mt-2 text-left">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-orange-500 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {errorMessage && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
            !isFormValid || isLoading
              ? "cursor-not-allowed bg-orange-300"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="text-base font-bold">G</span>
          {isLoadingGoogle ? "Autenticando..." : "Continuar con Google"}
        </button>

        {googleError && (
          <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {googleError}
          </p>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={isLoadingFacebook}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-base font-bold text-white">
              f
            </span>
            {isLoadingFacebook ? "Autenticando..." : "Continuar con Facebook"}
          </button>

          <button
            type="button"
            onClick={handleDiscordLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-white"
              aria-hidden="true"
            >
              <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.191.328-.403.769-.552 1.117a18.27 18.27 0 0 0-5.333 0A11.64 11.64 0 0 0 9.448 3a19.736 19.736 0 0 0-4.433 1.369C2.211 8.58 1.443 12.686 1.826 16.735A19.923 19.923 0 0 0 7.239 19.5c.438-.6.828-1.235 1.164-1.904-.634-.24-1.239-.541-1.813-.896.152-.111.301-.227.445-.347 3.495 1.643 7.285 1.643 10.739 0 .146.12.294.236.446.347-.575.355-1.182.656-1.817.896.336.669.726 1.304 1.164 1.904a19.874 19.874 0 0 0 5.416-2.765c.451-4.695-.769-8.763-3.666-12.366ZM9.349 14.546c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.84 2.154-1.909 2.154Zm5.303 0c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.831 2.154-1.909 2.154Z" />
            </svg>
            Continuar con Discord
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mx-auto block w-fit rounded-md bg-gray-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Cancelar Inicio de sesión
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-orange-500 hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
