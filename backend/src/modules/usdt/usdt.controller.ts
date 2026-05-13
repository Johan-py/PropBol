import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import { convertirBobAUsdt, getExchangeRate, verificarTransaccionShasta } from './usdt.service.js'
import { suscripcionesService } from '../suscripciones/suscripciones.service.js'
import { createNotificationRepository } from '../notificaciones/notificaciones.repository.js'

interface AuthRequest extends Request {
  user?: { id: number }
}

const crearNotificacion = async (usuarioId: number, titulo: string, mensaje: string) => {
  try {
    await createNotificationRepository({ usuarioId, titulo, mensaje })
  } catch { /* no bloquear flujo */ }
}

export const crearPagoUsdt = async (req: AuthRequest, res: Response) => {
  try {
    const { idSuscripcion } = req.body
    const usuarioId: number = req.user?.id ?? 0

    if (!idSuscripcion) return res.status(400).json({ error: 'Falta idSuscripcion' })

    const plan = await prisma.plan_suscripcion.findUnique({
      where: { id: parseInt(String(idSuscripcion)) },
    })
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' })

    const totalBob = Number(plan.precio_plan)
    const totalUsdt = convertirBobAUsdt(totalBob)
    const { bob_per_usdt } = getExchangeRate()

    const walletAddress = process.env.TRON_WALLET_ADDRESS ?? ''

    const transaccion = await prisma.transacciones.create({
      data: {
        id_usuario: usuarioId,
        id_suscripcion: parseInt(String(idSuscripcion)),
        subtotal: totalBob,
        iva_porcentaje: 0,
        iva_monto: 0,
        total: totalBob,
        metodo_pago: 'USDT_TRC20',
        estado: 'PENDIENTE',
        verificacion_requerida: true,
      },
    })

    const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    return res.status(201).json({
      id: transaccion.id,
      walletAddress,
      totalBob,
      totalUsdt,
      bob_per_usdt,
      red: 'TRC20 (TRON)',
      token: 'USDT',
      fechaExpiracion,
      referencia: `USDT-${transaccion.id}`,
      planNombre: plan.nombre_plan,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return res.status(500).json({ error: msg })
  }
}

export const verificarPagoUsdt = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    const { txHash } = req.body

    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    if (!txHash || typeof txHash !== 'string') {
      return res.status(400).json({ error: 'Falta txHash' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.estado === 'COMPLETADO') {
      return res.json({ confirmada: true, mensaje: 'Ya confirmada previamente' })
    }
    if (transaccion.metodo_pago !== 'USDT_TRC20') {
      return res.status(400).json({ error: 'Esta transacción no es USDT' })
    }

    const resultado = await verificarTransaccionShasta(txHash)

    if (!resultado.encontrada) {
      return res.json({ confirmada: false, mensaje: 'Transacción no encontrada en la red' })
    }

    if (!resultado.confirmada) {
      return res.json({ confirmada: false, mensaje: 'Transacción encontrada pero aún no confirmada' })
    }

    const suscripcionVigente = await suscripcionesService.obtenerSuscripcionActiva(
      transaccion.id_usuario
    )
    if (suscripcionVigente) {
      const planNombre = suscripcionVigente.plan_suscripcion?.nombre_plan ?? 'activa'
      const fechaFin = suscripcionVigente.fecha_fin.toISOString().slice(0, 10)
      return res.status(409).json({
        error: `El usuario ya tiene una suscripción ${planNombre} vigente hasta ${fechaFin}`,
      })
    }

    const ahora = new Date()

    await prisma.transacciones.update({
      where: { id },
      data: { estado: 'COMPLETADO', fecha_completado: ahora },
    })

    await prisma.suscripciones_activas.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        fecha_inicio: ahora,
        fecha_fin: new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA',
      },
    })

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'PAGO_USDT_CONFIRMADO',
        mensaje: `TX hash: ${txHash}`,
      },
    })

    const plan = await prisma.plan_suscripcion.findUnique({
      where: { id: transaccion.id_suscripcion },
      select: { nombre_plan: true },
    })
    const vigenciaFin = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })

    await crearNotificacion(
      transaccion.id_usuario,
      '¡Pago USDT confirmado!',
      `Plan ${plan?.nombre_plan ?? ''} activado. Vigencia hasta: ${vigenciaFin}. TX: ${txHash.slice(0, 12)}...`
    )

    return res.json({
      confirmada: true,
      mensaje: 'Pago confirmado y suscripción activada',
      detalles: resultado.detalles,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return res.status(500).json({ error: msg })
  }
}

export const obtenerTipoCambio = (_req: Request, res: Response) => {
  const { bob_per_usdt } = getExchangeRate()
  const walletAddress = process.env.TRON_WALLET_ADDRESS ?? ''
  const red = process.env.TRON_NETWORK ?? 'shasta'
  return res.json({ bob_per_usdt, walletAddress, red })
}
