import type { Request, Response } from 'express'
import { env } from '../../../config/env.js'
import { loginWithDiscordCodeService, registerWithDiscordCodeService } from './discord.service.js'
import { DiscordAuthError } from './discord.types.js'

type DiscordFlowMode = 'login' | 'register'

const buildDiscordAuthUrl = (mode: DiscordFlowMode) => {
  return (
    'https://discord.com/oauth2/authorize?' +
    new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      redirect_uri: env.DISCORD_CALLBACK_URL,
      response_type: 'code',
      scope: 'identify email',
      state: mode
    }).toString()
  )
}

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const sendPopupResponse = (
  res: Response,
  payload:
    | {
        type: 'propbol:discord-login-success'
        message: string
        token: string
        user: {
          id: number
          correo: string
          nombre?: string
          apellido?: string
        }
      }
    | {
        type: 'propbol:discord-login-error'
        code: string
        message: string
      }
) => {
  const serializedPayload = JSON.stringify(payload).replace(/</g, '\\u003c')
  const targetOrigin = JSON.stringify(env.FRONTEND_URL)
  const fallbackMessage = payload.message

  return res.status(200).type('html').send(`<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Autenticación con Discord</title>
    </head>
    <body>
      <p>${escapeHtml(fallbackMessage)}</p>
      <script>
        (function () {
          const payload = ${serializedPayload};
          const targetOrigin = ${targetOrigin};

          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, targetOrigin);
          }

          window.close();
        })();
      </script>
    </body>
    </html>`)
}

export const startDiscordLoginController = (_req: Request, res: Response) => {
  return res.redirect(buildDiscordAuthUrl('login'))
}

export const startDiscordRegisterController = (_req: Request, res: Response) => {
  return res.redirect(buildDiscordAuthUrl('register'))
}

export const discordCallbackController = async (req: Request, res: Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : ''
  const error = typeof req.query.error === 'string' ? req.query.error : ''
  const state =
    typeof req.query.state === 'string' && req.query.state === 'register' ? 'register' : 'login'

  if (error) {
    return sendPopupResponse(res, {
      type: 'propbol:discord-login-error',
      code: 'DISCORD_AUTH_FAILED',
      message: 'La autenticación con Discord fue cancelada o falló.'
    })
  }

  if (!code) {
    return sendPopupResponse(res, {
      type: 'propbol:discord-login-error',
      code: 'DISCORD_AUTH_FAILED',
      message: 'Discord no devolvió un código válido.'
    })
  }

  try {
    const result =
      state === 'register'
        ? await registerWithDiscordCodeService(code)
        : await loginWithDiscordCodeService(code)

    return sendPopupResponse(res, {
      type: 'propbol:discord-login-success',
      message: result.message,
      token: result.token,
      user: result.user
    })
  } catch (error) {
    console.error('[Discord Auth Error]', error)

    if (error instanceof DiscordAuthError) {
      return sendPopupResponse(res, {
        type: 'propbol:discord-login-error',
        code: error.code,
        message: error.message
      })
    }

    return sendPopupResponse(res, {
      type: 'propbol:discord-login-error',
      code: 'DISCORD_AUTH_FAILED',
      message:
        state === 'register'
          ? 'No se pudo completar el registro con Discord.'
          : 'No se pudo completar el inicio de sesión con Discord.'
    })
  }
}
