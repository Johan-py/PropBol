import { body } from 'express-validator'

export const crearPoiRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del punto de interés es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),

  body('latitud')
    .notEmpty().withMessage('La latitud es obligatoria')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),

  body('longitud')
    .notEmpty().withMessage('La longitud es obligatoria')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
]
