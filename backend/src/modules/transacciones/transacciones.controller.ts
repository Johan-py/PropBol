import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import { crearTransaccion } from './servicios/transaccionServicios.js'
import { emitirComprobante } from './servicios/comprobanteService.js'

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
      planNombre: transaccion.plan_suscripcion?.nombre_plan ?? null
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

    return res.json({ estado: transaccion.estado?.toLowerCase() ?? 'pendiente' })
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
      select: { estado: true, id_usuario: true, id_suscripcion: true },
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    if (transaccion.estado === 'COMPLETADO') {
      return res.status(409).json({ error: 'La transacción ya fue confirmada' })
    }

    const ahora = new Date()

    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { estado: 'COMPLETADO', fecha_completado: ahora },
    })

    await prisma.suscripciones_activas.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: transaccionId,
        fecha_inicio: ahora,
        fecha_fin: new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA',
      },
    })

    const comprobanteEnviado = await emitirComprobante(transaccionId)

    return res.status(200).json({
      mensaje: comprobanteEnviado
        ? 'Pago confirmado y comprobante enviado'
        : 'Pago confirmado, fallo al enviar comprobante',
    })
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
