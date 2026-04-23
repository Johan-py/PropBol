import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationError } from "express-validator";

export const propertyValidationRules = [
  body("titulo")
    .isLength({ min: 20, max: 80 })
    .withMessage("El título debe tener entre 20 y 80 caracteres")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("El título solo puede contener caracteres alfanuméricos"),

  body("tipoAccion")
    .isIn(["VENTA", "ALQUILER", "ANTICRETO"])
    .withMessage("Tipo de operación inválido"),

  body("categoria")
    .isIn(["CASA", "DEPARTAMENTO", "TERRENO", "OFICINA"])
    .withMessage("Tipo de inmueble inválido"),

  body("precio")
    .isFloat({ gt: 0 })
    .withMessage("El precio debe ser un número positivo"),

  body("superficieM2")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("El área debe ser un número positivo"),

  body("nroCuartos")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("El número de habitaciones debe ser positivo"),

  body("direccion")
    .isLength({ min: 5 })
    .withMessage("La dirección debe tener al menos 5 caracteres"),

  body("descripcion")
    .isLength({ min: 50, max: 300 })
    .withMessage("La descripción debe tener entre 50 y 300 caracteres")
    .matches(/^[a-zA-Z0-9\s.,;:()]+$/)
    .withMessage("La descripción solo puede contener caracteres alfanuméricos y básicos"),
];

// Middleware HU‑5 v2
export const manejarErroresPublicacion = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const grouped: {
      informacionBasica: { campo: string; mensaje: string }[];
      caracteristicas: { campo: string; mensaje: string }[];
      ubicacion: { campo: string; mensaje: string }[];
      detalles: { campo: string; mensaje: string }[];
    } = {
      informacionBasica: [],
      caracteristicas: [],
      ubicacion: [],
      detalles: [],
    };

    errors.array().forEach((err: ValidationError & { param?: string; msg?: string }) => {
      const campo = err.param ?? "campo_desconocido";
      const mensaje = err.msg ?? "Error sin mensaje";

      if (["titulo", "tipoAccion", "categoria", "precio"].includes(campo)) {
        grouped.informacionBasica.push({ campo, mensaje });
      } else if (["superficieM2", "nroCuartos", "nroBanos"].includes(campo)) {
        grouped.caracteristicas.push({ campo, mensaje });
      } else if (["direccion", "ciudad", "codigoPostal"].includes(campo)) {
        grouped.ubicacion.push({ campo, mensaje });
      } else if (["descripcion"].includes(campo)) {
        grouped.detalles.push({ campo, mensaje });
      }
    });

    return res.status(400).json({
      estado: "Pendiente de revisión",
      totalErrores: errors.array().length,
      errores: grouped,
    });
    
  }

  next();
};
