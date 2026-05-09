import {
  countActiveSocialLinksByUser,
  deactivateSocialLinkByUserAndProvider,
  findSocialLinkByUserAndProvider,
  listSocialLinksByUser,
} from "../auth.repository.js";

const SUPPORTED_PROVIDERS = ["facebook", "discord", "google", "linkedin"] as const;

export const getSocialLinksService = async (usuarioId: number) => {
  const links = await listSocialLinksByUser(usuarioId);

  const facebook = links.find((item) => item.proveedor === "facebook");
  const discord = links.find((item) => item.proveedor === "discord");
  const google = links.find((item) => item.proveedor === "google");
  const linkedin = links.find((item) => item.proveedor === "linkedin");

  return {
    facebook: {
      linked: Boolean(facebook),
      linkedEmail: facebook?.correoProveedor ?? null,
      linkedAt: facebook?.vinculadoEn ?? null,
    },
    discord: {
      linked: Boolean(discord),
      linkedEmail: discord?.correoProveedor ?? null,
      linkedAt: discord?.vinculadoEn ?? null,
    },
    google: {
      linked: Boolean(google),
      linkedEmail: google?.correoProveedor ?? null,
      linkedAt: google?.vinculadoEn ?? null,
    },
    linkedin: {
      linked: Boolean(linkedin),
      linkedEmail: linkedin?.correoProveedor ?? null,
      linkedAt: linkedin?.vinculadoEn ?? null,
    },
  };
};

export const unlinkSocialProviderService = async (
  usuarioId: number,
  provider: string,
) => {
  if (
    !SUPPORTED_PROVIDERS.includes(
      provider as (typeof SUPPORTED_PROVIDERS)[number],
    )
  ) {
    throw new Error("Proveedor no soportado.");
  }

  const existingLink = await findSocialLinkByUserAndProvider(
    usuarioId,
    provider,
  );

  if (!existingLink) {
    throw new Error("La red social no está vinculada.");
  }

  const activeLinksCount = await countActiveSocialLinksByUser(usuarioId);

  if (activeLinksCount <= 1) {
    throw new Error(
      "No puedes desvincular esta red porque es tu único método de acceso activo.",
    );
  }

  await deactivateSocialLinkByUserAndProvider(usuarioId, provider);

  return {
    message: "La red social fue desvinculada correctamente.",
    provider,
  };
};

export const getLinkedInOriginalEmail = async (usuarioId: number) => {
  const link = await findSocialLinkByUserAndProvider(usuarioId, "linkedin");
  if (!link) return null;
  return link.correoProveedor ?? null;
};