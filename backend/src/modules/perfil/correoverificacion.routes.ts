

import { Router } from 'express';
// Importamos las funciones específicas del controlador
import {
  verificarPassword,
  solicitarCambioEmail,
  confirmarCambioEmail
} from '../perfil/correoverificacion.controller.js';

// Si tienes un middleware de JWT, impórtalo aquí. 
// Si te da error de tipos, puedes usar require o declarar el tipo
const { validarJWT } = require('../../../middlewares/validar-jwt');

const router = Router();

/**
 * Ruta base definida en index.ts: /api/perfil
 */

// POST /api/perfil/verificar-password
router.post('/verificar-password', [validarJWT], verificarPassword);

// POST /api/perfil/solicitar-cambio-email
router.post('/solicitar-cambio-email', [validarJWT], solicitarCambioEmail);

// POST /api/perfil/confirmar-cambio-email
router.post('/confirmar-cambio-email', [validarJWT], confirmarCambioEmail);

export default router;