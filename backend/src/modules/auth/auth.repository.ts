import { RolNombre } from '@prisma/client'
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
    where: { nombre: RolNombre.VISITANTE },
    update: {},
    create: { nombre: RolNombre.VISITANTE }
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
        rolId: rol.id,
        telefonos: data.telefono
          ? {
              create: {
                codigoPais: '+591',
                numero: data.telefono,
                principal: true
              }
            }
          : undefined
      },
      include: {
        telefonos: true
      }
    })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error(getUniqueConstraintMessage(error))
    }

    throw error
  }
}

// Incluye el campo `activo` para que loginService pueda verificar si la cuenta está desactivada
export const findUser = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo },
    select: {
      id: true,
      correo: true,
      password: true,
      nombre: true,
      apellido: true,
      activo: true,
      two_factor_activo: true,
      rol: true
    }
  })
}
export const findUserByCorreo = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo },
    include: {
      rol: true
    }
  })
}

export const findUserById = async (id: number) => {
  return await prisma.usuario.findUnique({
    where: { id },
    include: {
      rol: true
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
      usuarioId,
      fechaExpiracion,
      estado: true
    }
  })
}

export const findActiveSessionByToken = async (token: string) => {
  return await prisma.sesion.findFirst({
    where: {
      token,
      estado: true,
      fechaExpiracion: {
        gt: new Date()
      }
    },
    include: {
      usuario: {
        include: {
          rol: true
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

export const invalidateActive2FACodesByUserId = async (usuarioId: number) => {
  return await prisma.codigo_2fa.updateMany({
    where: {
      usuarioId,
      activo: true,
      usadoEn: null
    },
    data: {
      activo: false
    }
  })
}

export const create2FACode = async ({
  usuarioId,
  codigoHash,
  expiraEn
}: {
  usuarioId: number
  codigoHash: string
  expiraEn: Date
}) => {
  return await prisma.codigo_2fa.create({
    data: {
      usuarioId,
      codigoHash,
      expiraEn,
      intentos: 0,
      activo: true
    }
  })
}
export const desactivarRecuperacionesPasswordActivas = async (usuarioId: number) => {
  return prisma.recuperacion_password.updateMany({
    where: {
      usuarioId,
      activo: true,
      usadoEn: null
    },
    data: {
      activo: false
    }
  })
}

export const createPasswordRecovery = async ({
  usuarioId,
  token,
  expiraEn
}: {
  usuarioId: number
  token: string
  expiraEn: Date
}) => {
  return prisma.recuperacion_password.create({
    data: {
      usuarioId,
      token,
      expiraEn,
      activo: true
    }
  })
}

export const findPasswordRecoveryByToken = async (token: string) => {
  return prisma.recuperacion_password.findUnique({
    where: { token },
    include: { usuario: true }
  })
}

export const markPasswordRecoveryAsUsed = async (id: number) => {
  return prisma.recuperacion_password.update({
    where: { id },
    data: { usadoEn: new Date(), activo: false }
  })
}

export const findActive2FACodeByUserId = async (usuarioId: number) => {
  return await prisma.codigo_2fa.findFirst({
    where: {
      usuarioId,
      activo: true,
      usadoEn: null
    },
    orderBy: {
      creadoEn: 'desc'
    }
  })
}

export const mark2FACodeAsUsed = async (id: number) => {
  return await prisma.codigo_2fa.update({
    where: { id },
    data: {
      usadoEn: new Date(),
      activo: false
    }
  })
}

export const increment2FACodeAttempts = async (id: number, intentosActuales: number) => {
  return await prisma.codigo_2fa.update({
    where: { id },
    data: {
      intentos: intentosActuales + 1
    }
  })
}

export const expire2FACode = async (id: number) => {
  return await prisma.codigo_2fa.update({
    where: { id },
    data: {
      activo: false
    }
  })
}

export const activate2FAByUserId = async (userId: number) => {
  return await prisma.usuario.update({
    where: { id: userId },
    data: {
      two_factor_activo: true,
      two_factor_activado_en: new Date(),
      two_factor_metodo: 'email'
    }
  })
}

export const deactivate2FAByUserId = async (userId: number) => {
  return await prisma.usuario.update({
    where: { id: userId },
    data: {
      two_factor_activo: false
    }
  })
}

export const updateUserPassword = async (usuarioId: number, password: string) => {
  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { password }
  })
}

export const invalidateAllUserSessions = async (usuarioId: number) => {
  return prisma.sesion.updateMany({
    where: { usuarioId, estado: true },
    data: { estado: false }
  })
}

export const invalidateOtherUserSessions = async (usuarioId: number, currentToken: string) => {
  return prisma.sesion.updateMany({
    where: {
      usuarioId,
      token: { not: currentToken },
      estado: true
    },
    data: { estado: false }
  })
}
