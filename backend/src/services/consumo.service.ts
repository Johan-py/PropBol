import { prisma } from '../lib/prisma.client.js'

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
    return {
      usadas: 0,
      limite: 0,
      plan: 'Sin suscripción activa'
    }
  }

  const plan = suscripcion.plan_suscripcion

  return {
    usadas: 0, // luego puedes calcular real
    limite: plan?.nro_publicaciones_plan ?? 0,
    plan: plan?.nombre_plan ?? 'Sin plan'
  }
}
