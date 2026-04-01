import { Router } from 'express'
import { createProperty, cancelProperty } from '../publicacion/publicacion.controller.js'
import { propertyValidationRules } from '../publicacion/publicacion.validator.js'
//import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/properties', propertyValidationRules, createProperty)
router.post('/properties/cancel', cancelProperty)

export default router
