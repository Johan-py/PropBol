import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import { crearTransaccion } from './servicios/transaccionServicios.js'

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

    const transaccion = await crearTransaccion(usuarioId, parseInt(idSuscripcion))
    return res.status(201).json(transaccion)
  } catch (error) {
    const msg = toMessage(error)
    const status = msg === 'Plan no encontrado' ? 404 : 500
    return res.status(status).json({ error: msg })
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
