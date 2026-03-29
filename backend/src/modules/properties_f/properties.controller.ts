import { Request, Response } from "express"
import { propertiesService } from "./properties.service.js"

export const propertiesController = {

  async search(req: Request, res: Response) {

    try {

      const { categoria, tipoAccion } = req.query

      const filtros = {
        categoria,
        tipoAccion
      }

      const properties = await propertiesService.search(filtros)

      res.json({
        ok: true,
        total: properties.length,
        data: properties
      })

    } catch (error) {

      console.error(error)

      res.status(500).json({
        ok: false,
        message: "Error al buscar propiedades"
      })

    }

  }

}