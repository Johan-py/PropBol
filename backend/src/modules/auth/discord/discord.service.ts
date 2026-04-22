import { randomUUID } from "node:crypto";
import { env } from "../../../config/env.js";
import { generateToken, type JwtPayload } from "../../../utils/jwt.js";
import {
  createDiscordSession,
  createDiscordUser,
  findUserByDiscordEmail,
  findUserByDiscordId,
  linkDiscordToUser,
} from "./discord.repository.js";
import {
  DiscordAuthError,
  type DiscordLoginSuccess,
  type DiscordTokenResponse,
  type DiscordUserInfo,
} from "./discord.types.js";

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_USERINFO_URL = "https://discord.com/api/users/@me";
const SESSION_DURATION_MS = 60 * 60 * 1000;

type DiscordAuthMode = "login" | "register";

const exchangeCodeForTokens = async (code: string) => {
  const response = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      redirect_uri: env.DISCORD_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as DiscordTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new DiscordAuthError(
      data.error_description || "No se pudo obtener el token de Discord.",
      "DISCORD_AUTH_FAILED",
      401,
    );
  }

  return data;
};

const getDiscordUserInfo = async (accessToken: string) => {
  const response = await fetch(DISCORD_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json()) as DiscordUserInfo;

  if (!response.ok || !data.email?.trim()) {
    throw new DiscordAuthError(
      "No se pudo obtener el correo de la cuenta de Discord.",
      "DISCORD_AUTH_FAILED",
      401,
    );
  }

  return data;
};

const resolveDiscordNames = (discordUser: DiscordUserInfo) => {
  const fullName =
    discordUser.global_name?.trim() || discordUser.username?.trim() || "";
  const parts = fullName.split(/\s+/);

  const nombre = parts[0] || discordUser.username?.trim() || "Usuario";
  const apellido = parts.slice(1).join(" ") || "Discord";

  return { nombre, apellido };
};

const buildDiscordSessionResponse = async (
  user: {
    id: number;
    correo: string;
    nombre: string;
    apellido: string;
  },
  message: string,
): Promise<DiscordLoginSuccess> => {
  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo,
  };

  const token = generateToken(jwtPayload);
  const fechaExpiracion = new Date(Date.now() + SESSION_DURATION_MS);

  await createDiscordSession({
    token,
    usuarioId: user.id,
    fechaExpiracion,
  });

  return {
    message,
    token,
    user: {
      id: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
    },
  };
};

const authenticateWithDiscord = async (
  code: string,
  mode: DiscordAuthMode,
): Promise<DiscordLoginSuccess> => {
  if (!code?.trim()) {
    throw new DiscordAuthError(
      "Discord no devolvió un código válido.",
      "DISCORD_AUTH_FAILED",
      400,
    );
  }

  const tokenData = await exchangeCodeForTokens(code);
  const discordUser = await getDiscordUserInfo(
    tokenData.access_token as string,
  );

  const discordId = discordUser.id?.trim();
  const correo = discordUser.email?.trim().toLowerCase();

  if (!discordId || !correo) {
    throw new DiscordAuthError(
      "No se pudo obtener la información de la cuenta de Discord.",
      "DISCORD_AUTH_FAILED",
      401,
    );
  }

  // Primero busca por ID de Discord en autenticacion_social
  const userByDiscordId = await findUserByDiscordId(discordId);

  if (mode === "register") {
    if (userByDiscordId) {
      throw new DiscordAuthError(
        "Esta cuenta de Discord ya está registrada. Inicia sesión con Discord desde la pantalla de login.",
        "ACCOUNT_ALREADY_REGISTERED",
        409,
      );
    }

    // Verifica si ya existe un usuario con ese correo (se registró con email)
    const existingUserByEmail = await findUserByDiscordEmail(correo);

    if (existingUserByEmail) {
      // Ya tiene cuenta con ese correo → solo vincula Discord
      await linkDiscordToUser(existingUserByEmail.id, discordId, correo);

      return await buildDiscordSessionResponse(
        existingUserByEmail,
        "Discord vinculado e inicio de sesión exitoso",
      );
    }

    // Usuario nuevo → crea cuenta y vincula Discord
    const { nombre, apellido } = resolveDiscordNames(discordUser);

    const createdUser = await createDiscordUser(
      {
        nombre,
        apellido,
        correo,
        password: `discord_${randomUUID()}`,
      },
      discordId,
      correo,
    );

    return await buildDiscordSessionResponse(
      createdUser,
      "Cuenta creada e inicio de sesión con Discord exitoso",
    );
  }

  // Modo login
  if (userByDiscordId) {
    return await buildDiscordSessionResponse(
      userByDiscordId,
      "Inicio de sesión con Discord exitoso",
    );
  }

  // No tiene Discord vinculado → verifica si tiene cuenta con ese correo
  const existingUserByEmail = await findUserByDiscordEmail(correo);

  if (existingUserByEmail) {
    // Tiene cuenta pero no tiene Discord vinculado → lo vincula automáticamente
    await linkDiscordToUser(existingUserByEmail.id, discordId, correo);

    return await buildDiscordSessionResponse(
      existingUserByEmail,
      "Discord vinculado e inicio de sesión exitoso",
    );
  }

  throw new DiscordAuthError(
    "Esta cuenta no está registrada. Debes registrarte primero con Discord.",
    "ACCOUNT_NOT_REGISTERED",
    404,
  );
};

export const loginWithDiscordCodeService = async (
  code: string,
): Promise<DiscordLoginSuccess> => {
  return await authenticateWithDiscord(code, "login");
};

export const registerWithDiscordCodeService = async (
  code: string,
): Promise<DiscordLoginSuccess> => {
  return await authenticateWithDiscord(code, "register");
};
