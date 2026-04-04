import { Router } from 'express'
import {
  getMyProfileController,
  updateNameController,
  updateAvatarController
} from './perfil.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { uploadPerfilAvatar } from '../../middleware/upload.middleware.js'

const router = Router()

// GET /api/perfil/me
// Retorna la información del perfil del usuario autenticado.
// Incluye: id, nombreCompleto, email y avatar.
router.get('/me', requireAuth, getMyProfileController)

// PUT /api/perfil/name
// Actualiza el nombre completo del usuario autenticado.
// Recibe en el body: { nombreCompleto }
router.put('/name', requireAuth, updateNameController)

// PUT /api/perfil/avatar
// Actualiza la foto de perfil del usuario autenticado.
// Recibe un archivo en el campo "avatar" (imagen JPG o PNG).
router.put(
  '/avatar',
  requireAuth,
  uploadPerfilAvatar.single('avatar'),
  updateAvatarController
)

export default router
  obtenerPerfil,
  editarNombre,
  editarPais,
  editarGenero,
  editarDireccion,
  editarFotoPerfil,
  editarTelefonos
} from './perfil.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

// GET - Obtener perfil --> GET http://localhost:5000/api/perfil
router.get('/', validarJWT, obtenerPerfil)

// PUTs - Editar cada campo

/*
PUT http://localhost:5000/api/perfil/usuario/nombre
{
  "nombre": "Carlos"
}
*/
router.put('/nombre', validarJWT, editarNombre)
/*
PUT http://localhost:5000/api/perfil/usuario/pais
{
  "pais": "Bolivia"
}
*/
router.put('/pais', validarJWT, editarPais)
/*
PUT http://localhost:5000/api/perfil/usuario/genero
{
  "genero": "Masculino" "Femenino" 
}
*/
router.put('/genero', validarJWT, editarGenero)
/*
PUT http://localhost:5000/api/perfil/usuario/direccion
{
  "direccion": "Calle Principal 123"
}
*/
router.put('/direccion', validarJWT, editarDireccion)
/*
PUT http://localhost:5000/api/perfil/usuario/foto-perfil
{
  "fotoPerfil": "https://example.com/nueva-foto.jpg"
}
*/
router.put('/foto-perfil', validarJWT, editarFotoPerfil)
/*
PUT http://localhost:5000/api/perfil/usuario/telefonos
{
  "telefonos": ["+59171234567", "+59176543210"]}
*/

// perfil.routes.ts
router.put('/telefonos', validarJWT, editarTelefonos)

export default router

