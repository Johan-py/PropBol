import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { verificarToken } from '../../middleware/auth.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  getPlanes,
  getPlanById,
  getAdminPlanes,
  createPlan,
  updatePlan,
  softDeletePlan,
  restorePlan,
  uploadQrImage,
} from './plans.controller.js'

const qrStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'qr')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    cb(null, `qr-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
  },
})

const uploadQr = multer({
  storage: qrStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png/
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.test(ext) && allowed.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes JPG o PNG'))
    }
  },
})
import { calcularPrecio } from './priceCalculator.controller.js'
import {
  crearOrdenCobro,
  listarOrdenes,
  cancelarOrden,
  cambiarPlan
} from './ordenCobro.controller.js'

const router = Router()

// HU-01
router.get('/membership-plans', verificarToken, getPlanes)

// HU-10 — Admin CRUD de planes (antes de /:id para evitar conflicto)
router.get('/admin/lista', requireAuth, getAdminPlanes)
router.post('/admin/upload-qr', requireAuth, uploadQr.single('qr'), uploadQrImage)
router.post('/admin', requireAuth, createPlan)
router.put('/admin/:id', requireAuth, updatePlan)
router.delete('/admin/:id', requireAuth, softDeletePlan)
router.patch('/admin/:id/restaurar', requireAuth, restorePlan)

router.get('/:id', verificarToken, getPlanById)

// HU-07
router.post('/calcular-precio', verificarToken, calcularPrecio)
router.post('/crear-orden', verificarToken, crearOrdenCobro)
router.get('/mis-ordenes', verificarToken, listarOrdenes)
router.delete('/cancelar-orden/:id', verificarToken, cancelarOrden)
router.put('/cambiar-plan', verificarToken, cambiarPlan)

export default router
