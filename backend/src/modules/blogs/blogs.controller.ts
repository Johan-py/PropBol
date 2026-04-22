import { Request, Response } from "express";
import { blogsService, comentariosService } from "./blogs.service.js";

// Tipo extendido con usuario autenticado
export type AuthRequest = Request & {
  user?: { id: number; correo?: string };
};

// ──────────────────────────────────────────
// BLOGS CONTROLLERS
// ──────────────────────────────────────────

/** POST /api/blogs */
export const crearBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const { titulo, contenido, imagen, categoria_id, accion } = req.body;

    if (!titulo || !contenido || !categoria_id) {
      return res
        .status(400)
        .json({ message: "titulo, contenido y categoria_id son requeridos" });
    }

    if (!["borrador", "pendiente"].includes(accion)) {
      return res
        .status(400)
        .json({ message: "accion debe ser 'borrador' o 'pendiente'" });
    }

    const blog = await blogsService.crear(req.user.id, {
      titulo,
      contenido,
      imagen,
      categoria_id: Number(categoria_id),
      accion,
    });

    return res.status(201).json(blog);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** GET /api/blogs */
export const listarBlogs = async (req: Request, res: Response) => {
  try {
    const { categoria_id, page, limit } = req.query;
    const result = await blogsService.listar({
      categoria_id: categoria_id ? Number(categoria_id) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
    return res.json(result);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** GET /api/blogs/mis-blogs */
export const misBlogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });
    const blogs = await blogsService.misBlogs(req.user.id);
    return res.json(blogs);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** PATCH /api/blogs/:id */
export const actualizarBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const id = Number(req.params.id);
    const { titulo, contenido, imagen, accion } = req.body;

    const blog = await blogsService.actualizar(id, req.user.id, {
      titulo,
      contenido,
      imagen,
      accion,
    });

    return res.json(blog);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BLOG_NOT_FOUND")
        return res.status(404).json({ message: "Blog no encontrado" });
      if (error.message === "FORBIDDEN")
        return res
          .status(403)
          .json({ message: "No tienes permiso para editar este blog" });
      if (error.message === "BLOG_NOT_EDITABLE")
        return res.status(409).json({
          message: "Solo puedes editar blogs en estado BORRADOR o RECHAZADO",
        });
    }
    return handleError(res, error);
  }
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
