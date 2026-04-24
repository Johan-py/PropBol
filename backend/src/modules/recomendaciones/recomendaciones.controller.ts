import { Request, Response } from "express";
import { RecomendacionesService } from "./recomendaciones.service.js";

const recomendacionesService = new RecomendacionesService();

export const getRecomendacionesGlobales = async (
  req: Request,
  res: Response,
) => {
  try {
    const usuarioId = (req as any).usuario?.id;
    if (!usuarioId) {
      return res
        .status(401)
        .json({ success: false, error: "Usuario no autenticado" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const zonaForzada = req.query.zona as string | undefined;

    const recomendaciones =
      await recomendacionesService.getRecomendacionesGlobales({
        usuarioId,
        limit,
        zonaForzada,
      });

    res.status(200).json({ success: true, data: recomendaciones });
  } catch (error) {
    console.error("Error en getRecomendacionesGlobales:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener recomendaciones" });
  }
};
export const getInmueblesRecomendados = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id;
    const orden = (req.query.orden as string) || "relevancia";
    const zona = req.query.zona as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    let resultados: any[] = [];

    if (orden === "recomendados" && usuarioId) {
      resultados = await recomendacionesService.getRecomendacionesGlobales({
        usuarioId,
        limit,
        zonaForzada: zona,
      });
    } else if (orden === "recomendados" && !usuarioId) {
      const zonaABuscar = zona || "Cochabamba";
      resultados =
        await recomendacionesService.getRecomendacionesPorPopularidad(
          zonaABuscar,
          limit,
        );
    } else {
      resultados = [];
    }

    res.status(200).json({ success: true, data: resultados });
  } catch (error) {
    console.error("Error en getInmueblesRecomendados:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener resultados" });
  }
};
