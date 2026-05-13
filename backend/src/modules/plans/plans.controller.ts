import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

export const getPlanes = async (req: Request, res: Response) => {
  try {
    const rows = await prisma.plan_suscripcion.findMany({ orderBy: { id: 'asc' } })

    const planes = rows
      .filter(p => p.precio_plan !== null && Number(p.precio_plan) >= 0)
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
