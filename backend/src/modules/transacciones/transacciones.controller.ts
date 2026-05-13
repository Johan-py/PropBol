import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import { crearTransaccion } from './servicios/transaccion.service.js'
import { emitirComprobante } from './servicios/comprobanteService.js'
import { suscripcionesService } from '../suscripciones/suscripciones.service.js'
import { createNotificationRepository } from '../notificaciones/notificaciones.repository.js'

const crearNotificacion = async (usuarioId: number, titulo: string, mensaje: string) => {
  try {
    await createNotificationRepository({ usuarioId, titulo, mensaje })
  } catch { /* no bloquear el flujo principal */ }
}

const notificarAdmins = async (titulo: string, mensaje: string) => {
  const admins = await prisma.usuario.findMany({
    where: { rol: { nombre: 'ADMIN' } },
    select: { id: true },
  })
  await Promise.all(admins.map((a) => crearNotificacion(a.id, titulo, mensaje)))
}

interface AuthRequest extends Request {
  user?: { id: number }
}

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Error interno'

export const generarPagoQr = async (req: AuthRequest, res: Response) => {
  try {
    const { idSuscripcion, userId } = req.body
    const usuarioId: number = req.user?.id ?? userId ?? 1

    if (!idSuscripcion) {
      return res.status(400).json({ error: 'Falta idSuscripcion' })
    }

    const { transaccion, plan } = await crearTransaccion(usuarioId, parseInt(idSuscripcion))

    return res.status(201).json({
      id: transaccion.id,
      id_usuario: transaccion.id_usuario,
      id_suscripcion: transaccion.id_suscripcion,
      subtotal: Number(transaccion.subtotal),
      iva_porcentaje: transaccion.iva_porcentaje,
      iva_monto: Number(transaccion.iva_monto),
      total: Number(transaccion.total),
      metodo_pago: transaccion.metodo_pago,
      fecha_intento: transaccion.fecha_intento,
      estado: transaccion.estado,
      verificacion_requerida: transaccion.verificacion_requerida,
      monto_descuento: Number(transaccion.monto_descuento ?? 0),
      referencia: `REF-${transaccion.id}`,
      fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      qrContent: plan.imagen_gr_url ?? null,
      plan_suscripcion: {
        nombre_plan: plan.nombre_plan,
        precio_plan: Number(plan.precio_plan),
        nro_publicaciones_plan: plan.nro_publicaciones_plan,
        duración_plan_días: plan.duracion_plan_dias,
        fotos_galeria: null,
        imagen_gr_url: plan.imagen_gr_url,
      },
    })
  } catch (error) {
    const msg = toMessage(error)
    const status = msg === 'Plan no encontrado' ? 404 : 500
    return res.status(status).json({ error: msg })
  }
}

export const aplicarCupon = async (req: Request, res: Response) => {
  try {
    const transaccionId = parseInt(String(req.params.id))
    const { codigo, totalOriginal } = req.body

    if (!codigo) return res.status(400).json({ error: 'Ingresa un código' })
    if (totalOriginal === undefined || isNaN(Number(totalOriginal))) {
      return res.status(400).json({ error: 'Monto no válido' })
    }

    const cupon = await prisma.cupon.findUnique({
      where: { codigo: String(codigo).toUpperCase() },
    })
    if (!cupon) return res.status(400).json({ error: 'Código inválido' })

    if (cupon.usos_actuales >= cupon.max_usos) {
      return res.status(400).json({ error: 'Cupón agotado' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id: transaccionId } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.cupon_id) return res.status(400).json({ error: 'Ya se aplicó un descuento' })

    const cuponValor = Number(cupon.valor_descuento)
    let montoDescuento = cupon.tipo_descuento === 'PORCENTAJE'
      ? Number(totalOriginal) * (cuponValor / 100)
      : Math.min(cuponValor, Number(totalOriginal))
    montoDescuento = Number(montoDescuento.toFixed(2))
    const nuevoTotal = Number((Number(totalOriginal) - montoDescuento).toFixed(2))

    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { cupon_id: cupon.id, monto_descuento: montoDescuento, total: nuevoTotal },
    })

    return res.json({ total: nuevoTotal, montoDescuento })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const obtenerPagoPendiente = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(String(req.params.userId))

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'userId inválido' })
    }

    const transaccion = await prisma.transacciones.findFirst({
      where: { id_usuario: userId, estado: 'PENDIENTE' },
      include: { plan_suscripcion: true },
      orderBy: { fecha_intento: 'desc' }
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'No hay pagos pendientes' })
    }

    return res.json({
      id: transaccion.id,
      monto: Number(transaccion.total),
      referencia: `REF-${transaccion.id}`,
      estado: transaccion.estado?.toLowerCase() ?? 'pendiente',
      qrContent: transaccion.plan_suscripcion?.imagen_gr_url ?? null,
      fechaExpiracion: new Date(
        (transaccion.fecha_intento?.getTime() ?? Date.now()) + 30 * 60 * 1000
      ).toISOString(),
      subtotal: Number(transaccion.subtotal),
      iva_monto: Number(transaccion.iva_monto),
      planNombre: transaccion.plan_suscripcion?.nombre_plan ?? null,
      planId: transaccion.id_suscripcion,
      tipoFacturacion: transaccion.metodo_pago === 'QR_BANCARIO_ANUAL' ? 'anual' : 'mensual',
    })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const consultarEstadoPago = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    const estadoRaw = transaccion.estado?.toLowerCase() ?? 'pendiente'
    const estado = estadoRaw === 'completado' ? 'pagado' : estadoRaw
    return res.json({ estado })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const confirmarPago = async (req: Request, res: Response) => {
  try {
    const transaccionId = parseInt(String(req.params.id))

    if (isNaN(transaccionId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const transaccion = await prisma.transacciones.findUnique({
      where: { id: transaccionId },
      select: { estado: true, id_usuario: true, id_suscripcion: true, metodo_pago: true, total: true },
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    if (transaccion.estado === 'COMPLETADO') {
      return res.status(409).json({ error: 'La transacción ya fue confirmada' })
    }

    const suscripcionVigente = await suscripcionesService.obtenerSuscripcionActiva(
      transaccion.id_usuario
    )
    if (suscripcionVigente) {
      const planVigente = suscripcionVigente.plan_suscripcion?.nombre_plan ?? 'activa'
      const fechaFin = suscripcionVigente.fecha_fin.toISOString().slice(0, 10)
      return res.status(409).json({
        error: `El usuario ya tiene una suscripción ${planVigente} vigente hasta ${fechaFin}`,
      })
    }

    const ahora = new Date()

    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { estado: 'COMPLETADO', fecha_completado: ahora },
    })

    const esAnual = transaccion.metodo_pago === 'QR_BANCARIO_ANUAL'
    const diasSuscripcion = esAnual ? 365 : 30

    await prisma.suscripciones_activas.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: transaccionId,
        fecha_inicio: ahora,
        fecha_fin: new Date(ahora.getTime() + diasSuscripcion * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA',
      },
    })

    const comprobanteEnviado = await emitirComprobante(transaccionId)

    // HU-15: notificar al usuario que su pago fue aprobado
    const planNombre = await prisma.plan_suscripcion.findUnique({
      where: { id: transaccion.id_suscripcion },
      select: { nombre_plan: true },
    })
    const vigenciaFin = new Date(ahora.getTime() + diasSuscripcion * 24 * 60 * 60 * 1000)
      .toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })

    await crearNotificacion(
      transaccion.id_usuario,
      '¡Tu pago fue aprobado!',
      `Plan ${planNombre?.nombre_plan ?? ''} activado. Vigencia hasta: ${vigenciaFin}. Monto: Bs. ${Number(transaccion.total).toFixed(2)}.`
    )

    return res.status(200).json({
      mensaje: comprobanteEnviado
        ? 'Pago confirmado y comprobante enviado'
        : 'Pago confirmado, fallo al enviar comprobante',
    })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const actualizarTransaccion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const { tipoFacturacion, totalFinal } = req.body
    if (!tipoFacturacion || totalFinal === undefined) {
      return res.status(400).json({ error: 'Faltan parámetros: tipoFacturacion y totalFinal' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden modificar transacciones PENDIENTES' })
    }

    const total = Math.round(Number(totalFinal) * 100) / 100
    const subtotal = Math.round((total / 1.13) * 100) / 100
    const iva_monto = Math.round((total - subtotal) * 100) / 100
    const metodo_pago = tipoFacturacion === 'anual' ? 'QR_BANCARIO_ANUAL' : 'QR_BANCARIO_MENSUAL'

    await prisma.transacciones.update({
      where: { id },
      data: { total, subtotal, iva_monto, metodo_pago },
    })

    return res.json({ total, subtotal, iva_monto, tipoFacturacion })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const listarTransaccionesAdmin = async (_req: Request, res: Response) => {
  try {
    const transacciones = await prisma.transacciones.findMany({
      include: {
        usuario: { select: { nombre: true, apellido: true, correo: true } },
        plan_suscripcion: { select: { nombre_plan: true } },
      },
      orderBy: { fecha_intento: 'desc' },
    })

    return res.json(
      transacciones.map((t) => ({
        id: t.id,
        usuario: `${t.usuario.nombre} ${t.usuario.apellido}`,
        correo: t.usuario.correo,
        referencia: `REF-${t.id}`,
        monto: Number(t.total),
        fecha: t.fecha_intento,
        estado: t.estado ?? 'PENDIENTE',
        plan: t.plan_suscripcion?.nombre_plan ?? null,
      }))
    )
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const rechazarPago = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const { motivo } = req.body

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })

    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden rechazar transacciones PENDIENTES' })
    }

    await prisma.transacciones.update({
      where: { id },
      data: { estado: 'RECHAZADO' },
    })

    const motivoTexto = motivo?.trim() ? String(motivo).trim() : 'No especificado'

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'PAGO_RECHAZADO',
        mensaje: `Transacción ${id} rechazada. Motivo: ${motivoTexto}`,
      },
    })

    // HU-15: notificar al usuario sobre el rechazo
    await crearNotificacion(
      transaccion.id_usuario,
      'Pago rechazado',
      `Tu pago (Ref: TXN-${String(id).padStart(3, '0')}) fue rechazado. Motivo: ${motivoTexto}. Puedes intentar nuevamente.`
    )

    return res.json({ mensaje: 'Pago rechazado correctamente' })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const notificarPagoRealizado = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const transaccion = await prisma.transacciones.findUnique({
      where: { id },
      include: {
        usuario: { select: { nombre: true, correo: true } },
        plan_suscripcion: { select: { nombre_plan: true } },
      },
    })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(409).json({ error: 'La transacción no está pendiente' })
    }

    // Idempotencia: evitar notificaciones duplicadas
    const yaNotificado = await prisma.bitacora_pagos.findFirst({
      where: { id_transaccion: id, evento: 'PAGO_NOTIFICADO_ADMIN' },
    })
    if (yaNotificado) return res.json({ mensaje: 'Ya notificado previamente' })

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'PAGO_NOTIFICADO_ADMIN',
        mensaje: `Usuario ${transaccion.usuario.nombre} (${transaccion.usuario.correo}) indicó que realizó el pago`,
      },
    })

    const metodo = transaccion.metodo_pago?.includes('ANUAL') ? 'QR Anual' : 'QR'
    const titulo = `Nuevo pago pendiente — ${transaccion.usuario.nombre}`
    const mensaje = `Plan: ${transaccion.plan_suscripcion?.nombre_plan ?? '—'} · Monto: Bs. ${Number(transaccion.total).toFixed(2)} · Método: ${metodo} · Ref: TXN-${String(id).padStart(3, '0')}`

    await notificarAdmins(titulo, mensaje)

    return res.json({ mensaje: 'Administradores notificados' })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const subirComprobante = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const file = (req as Request & { file?: Express.Multer.File }).file
    if (!file) return res.status(400).json({ error: 'No se recibió ningún archivo' })

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })

    const fileUrl = `/uploads/comprobantes/${file.filename}`

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'COMPROBANTE_SUBIDO',
        mensaje: fileUrl,
      },
    })

    return res.json({ mensaje: 'Comprobante subido', url: fileUrl })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const listarMisPagos = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autenticado' })

    const transacciones = await prisma.transacciones.findMany({
      where: { id_usuario: userId },
      include: { plan_suscripcion: { select: { nombre_plan: true } } },
      orderBy: { fecha_intento: 'desc' },
    })

    return res.json(
      transacciones.map((t) => ({
        id: t.id,
        referencia: `TXN-${String(t.id).padStart(3, '0')}`,
        fecha: t.fecha_intento,
        plan: t.plan_suscripcion?.nombre_plan ?? null,
        metodo: t.metodo_pago,
        monto: Number(t.total),
        estado: t.estado ?? 'PENDIENTE',
      }))
    )
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const cancelarTransaccion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden cancelar transacciones PENDIENTES' })
    }

    await prisma.transacciones.update({
      where: { id },
      data: { estado: 'CANCELADO' }
    })

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'TRANSACCION_CANCELADA',
        mensaje: `Transacción ${id} cancelada por el usuario`
      }
    })

    return res.json({ message: 'Transacción cancelada correctamente' })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}
