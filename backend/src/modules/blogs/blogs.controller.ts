import { Request, Response } from "express";
import { blogsService, comentariosService } from "./blogs.service.js";

// Tipo extendido con usuario autenticado
export type AuthRequest = Request & {
  user?: { id: number; correo?: string };
};

// ──────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────

function handleError(res: Response, error: unknown) {
  console.error("❌ Error:", error);

  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(500).json({ message: "Error interno del servidor" });
}
