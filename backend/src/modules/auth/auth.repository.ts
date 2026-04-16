import { rol_nombre } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.client.js'

interface CreateUserInput {
  nombre: string
  apellido: string
  correo: string
  password: string
  telefono?: string
}

type PrismaLikeKnownError = {
  code?: string
  meta?: {
    target?: unknown
  }
  message?: string
}

const ensureVisitorRole = async () => {
  return await prisma.rol.upsert({
    where: { nombre: rol_nombre.VISITANTE },
    update: {},
    create: { nombre: rol_nombre.VISITANTE }
  })
}

const isUniqueConstraintError = (error: unknown): error is PrismaLikeKnownError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as PrismaLikeKnownError).code === 'P2002'
  )
}

const getUniqueConstraintMessage = (error: PrismaLikeKnownError) => {
  const rawTarget = error.meta?.target
  const targets = Array.isArray(rawTarget) ? rawTarget.map(String) : []
  const searchableText = `${targets.join(' ')} ${error.message ?? ''}`.toLowerCase()

  if (searchableText.includes('correo')) {
    return 'El correo ya está registrado'
  }

  return 'Ya existe un registro con esos datos'
}

export const createUser = async (data: CreateUserInput) => {
  const rol = await ensureVisitorRole()

  try {
    return await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        password: data.password,
        rol_id: rol.id,
        telefono: data.telefono
          ? {
              create: {
                codigo_pais: '+591',
                numero: data.telefono,
                principal: true
              }
            }
          : undefined
      },
      include: {
        telefono: true
      }
    })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error(getUniqueConstraintMessage(error))
    }

    throw error
  }
}

export const findUserByCorreo = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo }
  })
}

export const findUser = findUserByCorreo

export const findUserById = async (id: number) => {
  return await prisma.usuario.findUnique({
    where: { id },
    include: {
      rol: true,
      telefono: true
    }
  })
}

export const createSession = async ({
  token,
  usuarioId,
  fechaExpiracion
}: {
  token: string
  usuarioId: number
  fechaExpiracion: Date
}) => {
  return await prisma.sesion.create({
    data: {
      token,
      usuario_id: usuarioId,
      fecha_expiracion: fechaExpiracion,
      estado: true
    }
  })
}

export const findActiveSessionByToken = async (token: string) => {
  return await prisma.sesion.findFirst({
    where: {
      token,
      estado: true,
      fecha_expiracion: {
        gt: new Date()
      }
    },
    include: {
      usuario: {
        include: {
          rol: true,
          telefono: true
        }
      }
    }
  })
}

export const desactiveSessionByToken = async (token: string) => {
  return await prisma.sesion.updateMany({
    where: {
      token,
      estado: true
    },
    data: {
      estado: false
    }
  })
}