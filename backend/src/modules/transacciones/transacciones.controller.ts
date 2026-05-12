import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import { crearTransaccion } from './servicios/transaccion.service.js'
import { emitirComprobante } from './servicios/comprobanteService.js'
import { suscripcionesService } from '../suscripciones/suscripciones.service.js'

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
      select: { estado: true, id_usuario: true, id_suscripcion: true, metodo_pago: true, metadata: true },
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
     const metadata = transaccion.metadata as any
    const esPublicidad = metadata?.tipo === 'PUBLICIDAD'

    // Si es suscripción (no publicidad), verificar que no tenga una activa
    if (!esPublicidad) {
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
   } 
    const ahora = new Date()

    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { estado: 'COMPLETADO', fecha_completado: ahora },
    })
     // Si es suscripción, crear suscripción activa
    if (!esPublicidad) {
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
    } else {
      // ACTIVAR PUBLICIDAD DESPUÉS DE PAGO EXITOSO
      const publicacionId = metadata.publicacionId
      const duracionDias = metadata.duracionDias || 30
      const fechaExpiracion = new Date()
      fechaExpiracion.setDate(fechaExpiracion.getDate() + duracionDias)

      await prisma.publicacion.update({
        where: { id: publicacionId },
        data: {
          promoted: true,
          promotedAt: ahora,
          promotedExpiresAt: fechaExpiracion,
          paymentIntentId: metadata.paymentIntentId || null
        }
      })
    }
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

export const crearPagoPublicidad = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id
    const { publicacionId, planPublicidadId } = req.body

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (!publicacionId || !planPublicidadId) {
      return res.status(400).json({ error: 'Faltan datos: publicacionId y planPublicidadId' })
    }

    const plan = await prisma.plan_publicidad.findUnique({
      where: { id: parseInt(planPublicidadId) }
    })

    if (!plan) {
      return res.status(404).json({ error: 'Plan de publicidad no encontrado' })
    }

   
    const publicacion = await prisma.publicacion.findFirst({
      where: { id: publicacionId, usuarioId }
    })

    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada' })
    }

    if (publicacion.promoted) {
      return res.status(400).json({ error: 'La propiedad ya está publicitada' })
    }
   
    const subtotal = plan.precio_plan
    const ivaPorcentaje = 13
    const ivaMonto = subtotal * (ivaPorcentaje / 100)
    const total = subtotal + ivaMonto

   
    const transaccion = await prisma.transacciones.create({
      data: {
        id_usuario: usuarioId,
        id_suscripcion: null,
        subtotal: subtotal,
        iva_porcentaje: ivaPorcentaje,
        iva_monto: ivaMonto,
        total: total,
        metodo_pago: 'QR_BANCARIO',
        estado: 'PENDIENTE',
        verificacion_requerida: true,
        metadata: {
          tipo: 'PUBLICIDAD',
          publicacionId: publicacionId,
          publicacionTitulo: publicacion.titulo,
          duracionDias: plan.duracion_plan_dias,
          planPublicidadId: plan.id,
          planNombre: plan.nombre_plan
        }
      }
    })

    const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago-publicidad?transaccion=${transaccion.id}`

    return res.status(201).json({
      ok: true,
      data: {
        transaccionId: transaccion.id,
        checkoutUrl: checkoutUrl,
        monto: total,
        moneda: 'BOB',
        duracionDias: plan.duracion_plan_dias,
        referencia: `PUB-${transaccion.id}`
      },
      message: 'Transacción creada, proceder al pago'
    })
  } catch (error) {
    console.error('Error al crear pago de publicidad:', error)
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const webhookPublicidad = async (req: Request, res: Response) => {
  try {
    const { transaccionId, paymentIntentId, status } = req.body

    if (!transaccionId || !paymentIntentId) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }

    const transaccion = await prisma.transacciones.findUnique({
      where: { id: transaccionId }
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    if (transaccion.estado === 'COMPLETADO') {
      return res.status(200).json({ message: 'Transacción ya estaba completada' })
    }

    if (status === 'success') {
      const ahora = new Date()

      await prisma.transacciones.update({
        where: { id: transaccionId },
        data: {
          estado: 'COMPLETADO',
          fecha_completado: ahora,
          payment_intent_id: paymentIntentId
        }
      })

      const metadata = transaccion.metadata as any
      if (metadata?.tipo === 'PUBLICIDAD') {
        const fechaExpiracion = new Date()
        fechaExpiracion.setDate(fechaExpiracion.getDate() + (metadata.duracionDias || 30))

        await prisma.publicacion.update({
          where: { id: metadata.publicacionId },
          data: {
            promoted: true,
            promotedAt: ahora,
            promotedExpiresAt: fechaExpiracion,
            paymentIntentId: paymentIntentId
          }
        })
      }
    }

    return res.json({ ok: true, message: 'Webhook procesado correctamente' })
  } catch (error) {
    console.error('Error en webhook de publicidad:', error)
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

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })

    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden rechazar transacciones PENDIENTES' })
    }

    await prisma.transacciones.update({
      where: { id },
      data: { estado: 'RECHAZADO' },
    })

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'PAGO_RECHAZADO',
        mensaje: `Transacción ${id} rechazada por el administrador`,
      },
    })

    return res.json({ mensaje: 'Pago rechazado correctamente' })
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
