export const USER_STORAGE_KEY = 'propbol_user'

type SessionUserInput = {
  correo?: string
  nombre?: string
  apellido?: string
  avatar?: string | null
}

export type SessionUser = {
  name: string
  email: string
  avatar: string | null
}

export function buildSessionUser(user?: SessionUserInput): SessionUser {
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(' ').trim()

  return {
    name: fullName || user?.correo || 'Usuario',
    email: user?.correo ?? '',
    avatar: user?.avatar ?? null
  }
}
