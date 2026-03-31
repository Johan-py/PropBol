import { prisma } from '../db/prisma.js'

export const obtenerConsumo = async (userId: number) => {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: userId
    },
    include: {
      suscripciones_activas: {
        where: {
          estado: 'ACTIVA'
        },
        include: {
          plan_suscripcion: true
        }
      }
    }
  })

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  const suscripcion = usuario.suscripciones_activas[0]

  if (!suscripcion) {
    throw new Error('No tiene suscripción activa')
  }

  const plan = suscripcion.plan_suscripcion

  if (!plan) {
    throw new Error('La suscripción no tiene un plan asignado')
  }

  return {
    usadas: 0,
    limite: plan.nro_publicaciones_plan,
    plan: plan.nombre_plan
  }
}
