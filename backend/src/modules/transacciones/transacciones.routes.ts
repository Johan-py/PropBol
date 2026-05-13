import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import {
  generarPagoQr,
  obtenerPagoPendiente,
  consultarEstadoPago,
  cancelarTransaccion,
  confirmarPago,
  rechazarPago,
  aplicarCupon,
  actualizarTransaccion,
  listarTransaccionesAdmin,
  listarMisPagos,
  subirComprobante,
  notificarPagoRealizado,
} from './transacciones.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const uploadComprobante = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(process.cwd(), 'uploads', 'comprobantes')
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `comprobante-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Formato no soportado. Usa JPG, PNG o PDF'))
    }
  },
})

const router = Router()

router.get('/admin', requireAuth, listarTransaccionesAdmin)
router.get('/mis-pagos', requireAuth, listarMisPagos)
router.post('/', requireAuth, generarPagoQr)
router.get('/pendiente/:userId', obtenerPagoPendiente)
router.patch('/:id/confirmar', requireAuth, confirmarPago)
router.patch('/:id/rechazar', requireAuth, rechazarPago)
router.patch('/:id/cancelar', cancelarTransaccion)
router.patch('/:id/actualizar', actualizarTransaccion)
router.post('/:id/cupon', aplicarCupon)
router.post('/:id/comprobante', uploadComprobante.single('comprobante'), subirComprobante)
router.post('/:id/notificar-admin', requireAuth, notificarPagoRealizado)
router.get('/:id/estado', consultarEstadoPago)

export default router
