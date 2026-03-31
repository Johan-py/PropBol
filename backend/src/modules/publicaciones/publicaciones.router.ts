import { Router } from 'express'
import {
  getPublicaciones,
  editPublicacion,
  removePublicacion
} from './publicaciones.controller.js'

const router = Router()

router.get('/usuario/:usuarioId', getPublicaciones)
router.put('/:id', editPublicacion)
router.delete('/:id', removePublicacion)

export default router