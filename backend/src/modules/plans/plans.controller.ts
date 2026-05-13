import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

const DELETED_PREFIX = '[ELIMINADO] '
const isDeleted = (nombre: string | null) => (nombre ?? '').startsWith(DELETED_PREFIX)
const realName = (nombre: string | null) =>
  (nombre ?? '').replace(DELETED_PREFIX, '')

export const getPlanes = async (req: Request, res: Response) => {
  try {
    const rows = await prisma.plan_suscripcion.findMany({ orderBy: { id: 'asc' } })

    const planes = rows
      .filter(p => !isDeleted(p.nombre_plan) && p.precio_plan !== null && Number(p.precio_plan) >= 0)
      .map((p, i, arr) => ({
        id: p.id,
        name: p.nombre_plan ?? 'Plan',
        price: Number(p.precio_plan),
        description: p.descripcion_plan ?? '',
        nro_publicaciones: p.nro_publicaciones_plan,
        duracion_dias: p.duracion_plan_dias,
        popular: arr.length > 1 && i === 1,
      }))

    res.json(planes)
  } catch {
    res.status(500).json({
      error: 'Error del servidor',
      message: 'No se pudieron cargar los planes'
    })
  }
}

export const getAdminPlanes = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.plan_suscripcion.findMany({ orderBy: { id: 'asc' } })
    const planes = rows.map((p) => ({
      id: p.id,
      nombre: realName(p.nombre_plan),
      precio: p.precio_plan !== null ? Number(p.precio_plan) : null,
      nro_publicaciones: p.nro_publicaciones_plan,
      duracion_dias: p.duracion_plan_dias,
      descripcion: p.descripcion_plan ?? '',
      imagen_gr_url: p.imagen_gr_url ?? null,
      eliminado: isDeleted(p.nombre_plan),
    }))
    return res.json(planes)
  } catch {
    return res.status(500).json({ error: 'Error del servidor' })
  }
}

export const createPlan = async (req: Request, res: Response) => {
  try {
    const { nombre, precio, nro_publicaciones, duracion_dias, descripcion, imagen_gr_url } = req.body

    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })
    if (precio === undefined || precio === null || Number(precio) < 0)
      return res.status(400).json({ error: 'El precio no puede ser negativo' })

    const existe = await prisma.plan_suscripcion.findFirst({
      where: { nombre_plan: nombre.trim() },
    })
    if (existe) return res.status(409).json({ error: 'Ya existe un plan con ese nombre' })

    const plan = await prisma.plan_suscripcion.create({
      data: {
        nombre_plan: nombre.trim(),
        precio_plan: Number(precio),
        nro_publicaciones_plan: nro_publicaciones ? Number(nro_publicaciones) : null,
        duracion_plan_dias: duracion_dias ? Number(duracion_dias) : null,
        descripcion_plan: descripcion?.trim() ?? null,
        imagen_gr_url: imagen_gr_url?.trim() ?? null,
      },
    })

    return res.status(201).json({ mensaje: 'Plan creado', id: plan.id })
  } catch {
    return res.status(500).json({ error: 'Error del servidor' })
  }
}

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const { nombre, precio, nro_publicaciones, duracion_dias, descripcion, imagen_gr_url } = req.body

    if (nombre !== undefined && !String(nombre).trim())
      return res.status(400).json({ error: 'El nombre no puede estar vacío' })
    if (precio !== undefined && Number(precio) < 0)
      return res.status(400).json({ error: 'El precio no puede ser negativo' })

    if (nombre) {
      const duplicado = await prisma.plan_suscripcion.findFirst({
        where: { nombre_plan: nombre.trim(), NOT: { id } },
      })
      if (duplicado) return res.status(409).json({ error: 'Ya existe un plan con ese nombre' })
    }

    const data: Record<string, unknown> = {}
    if (nombre !== undefined) data.nombre_plan = nombre.trim()
    if (precio !== undefined) data.precio_plan = Number(precio)
    if (nro_publicaciones !== undefined)
      data.nro_publicaciones_plan = nro_publicaciones ? Number(nro_publicaciones) : null
    if (duracion_dias !== undefined)
      data.duracion_plan_dias = duracion_dias ? Number(duracion_dias) : null
    if (descripcion !== undefined) data.descripcion_plan = descripcion?.trim() ?? null
    if (imagen_gr_url !== undefined) data.imagen_gr_url = imagen_gr_url?.trim() ?? null

    await prisma.plan_suscripcion.update({ where: { id }, data })
    return res.json({ mensaje: 'Plan actualizado' })
  } catch {
    return res.status(500).json({ error: 'Error del servidor' })
  }
}

export const softDeletePlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const plan = await prisma.plan_suscripcion.findUnique({ where: { id } })
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' })
    if (isDeleted(plan.nombre_plan)) return res.status(409).json({ error: 'Plan ya eliminado' })

    await prisma.plan_suscripcion.update({
      where: { id },
      data: { nombre_plan: `${DELETED_PREFIX}${plan.nombre_plan ?? ''}` },
    })
    return res.json({ mensaje: 'Plan eliminado (conserva suscriptores activos)' })
  } catch {
    return res.status(500).json({ error: 'Error del servidor' })
  }
}

export const restorePlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const plan = await prisma.plan_suscripcion.findUnique({ where: { id } })
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' })
    if (!isDeleted(plan.nombre_plan)) return res.status(409).json({ error: 'El plan no está eliminado' })

    await prisma.plan_suscripcion.update({
      where: { id },
      data: { nombre_plan: realName(plan.nombre_plan) },
    })
    return res.json({ mensaje: 'Plan restaurado' })
  } catch {
    return res.status(500).json({ error: 'Error del servidor' })
  }
}

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const plan = await prisma.plan_suscripcion.findUnique({ where: { id } })
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' })

    return res.json({
      id: plan.id,
      nombre_plan: plan.nombre_plan,
      precio_plan: Number(plan.precio_plan),
      nro_publicaciones_plan: plan.nro_publicaciones_plan,
      duracion_plan_dias: plan.duracion_plan_dias,
      imagen_gr_url: plan.imagen_gr_url,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error interno',
    })
  }
}
