// erroresPublicacion.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const reglasValidacionHU5 = [
  body("titulo")
    .isLength({ min: 20, max: 80 })
    .withMessage("El título debe tener entre 20 y 80 caracteres"),
  body("descripcion")
    .isLength({ min: 50, max: 300 })
    .withMessage("La descripción debe tener entre 50 y 300 caracteres"),
  body("direccion")
    .isLength({ min: 5 })
    .withMessage("La dirección debe tener al menos 5 caracteres"),
  body("precio")
    .isNumeric()
    .withMessage("El precio debe ser un número válido"),
];

export const manejarErroresPublicacion = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const agrupados: Record<string, { campo: string; mensaje: string }[]> = {
      informacionBasica: [],
      ubicacion: [],
      detalles: [],
    };

    errors.array().forEach((err: any) => {
      const campo = err.param || "desconocido";
      const mensaje = err.msg || "Error sin mensaje";

      if (["titulo", "precio"].includes(campo)) {
        agrupados.informacionBasica.push({ campo, mensaje });
      } else if (["direccion"].includes(campo)) {
        agrupados.ubicacion.push({ campo, mensaje });
      } else if (["descripcion"].includes(campo)) {
        agrupados.detalles.push({ campo, mensaje });
      }
    });

    return res.status(400).json({
      estado: "Pendiente de revisión",
      totalErrores: errors.array().length,
      errores: agrupados,
    });
  }
  next();
};
