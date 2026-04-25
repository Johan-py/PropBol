import type { Request, Response } from "express";
import {
  getSocialLinksService,
  unlinkSocialProviderService,
} from "./social-links.service.js";

export const getSocialLinksController = async (req: Request, res: Response) => {
  const usuarioId = req.user?.id;

  if (!usuarioId) { 
    return res.status(401).json({
      message: "No autorizado.",
    });
  }

  

  const data = await getSocialLinksService(usuarioId);

  return res.status(200).json(data);
};

export const unlinkSocialProviderController = async (
  req: Request,
  res: Response,
) => {
  const usuarioId = req.user?.id;
  const rawProvider = req.params.provider;
  const provider = Array.isArray(rawProvider) ? rawProvider[0] : rawProvider;

  if (!usuarioId) {
    return res.status(401).json({
      message: "No autorizado.",
    });
  }

  if (!provider) {
    return res.status(400).json({
      message: "Proveedor inválido.",
    });
  }

  const result = await unlinkSocialProviderService(usuarioId, provider);

  return res.status(200).json(result);
};
