import { body } from 'express-validator'

export const createParametroPersonalizadoRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),

  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
]

export const replacePublicationParametersRules = [
  body('parametros').isArray().withMessage('parametros debe ser un arreglo'),

  body('parametros.*.parametroId')
    .isInt({ min: 1 })
    .withMessage('parametroId debe ser un entero válido'),

  body('parametros.*.valor')
    .optional({ nullable: true })
    .isString()
    .withMessage('valor debe ser texto')
]
