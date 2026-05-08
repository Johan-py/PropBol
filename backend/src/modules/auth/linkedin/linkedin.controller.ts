import type { Request, Response } from "express";

export const getLinkedInLinkUrlController = async (
  _req: Request,
  res: Response,
) => {
  return res.status(501).json({
    message:
      "La vinculación con LinkedIn todavía no está disponible. Se implementará el flujo OAuth posteriormente.",
  });
};