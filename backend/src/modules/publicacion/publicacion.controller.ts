import type { Request, Response } from 'express'
import {
  eliminarPublicacionService,
  listarMisPublicacionesService,
  editarPublicacionService,
  obtenerResumenFinalService,
  obtenerDetallePublicacionService,
  obtenerDetallePublicacionPorInmuebleService,
  confirmarPublicacionService,
  iniciarPublicidadService,
  confirmarPublicidadService,
  cancelarPublicidadService,
  obtenerEstadoPublicidadService
} from './publicacion.service.js'

interface AuthRequest extends Request {
  user?: {
    id: number
    correo?: string
    nombre?: string
    rol?: string
  }
}

export const listarMisPublicacionesController = async (req: AuthRequest, res: Response) => {
  const usuarioId = req.user?.id

  try {
    const publicaciones = await listarMisPublicacionesService(Number(usuarioId))

    return res.status(200).json({
      ok: true,
      data: publicaciones
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'USUARIO_INVALIDO') {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado'
      })
    }

    console.error('Error al listar mis publicaciones:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudieron obtener las publicaciones'
    })
  }
}

export const obtenerResumenFinalController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioSolicitanteId = req.user?.id

  try {
    const resumen = await obtenerResumenFinalService(publicacionId, Number(usuarioSolicitanteId))

    return res.status(200).json({
      ok: true,
      data: resumen
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })

        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })

        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })

        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede acceder al resumen final de una publicación de otro usuario'
          })

        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })
      }
    }

    console.error('Error al obtener resumen final de la publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo obtener el resumen final de la publicación'
    })
  }
}

export const editarPublicacionController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioSolicitanteId = req.user?.id

  try {
    const resultado = await editarPublicacionService(
      publicacionId,
      Number(usuarioSolicitanteId),
      req.body
    )

    return res.status(200).json({
      ok: true,
      message: 'Publicación actualizada correctamente',
      data: resultado
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })

        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })

        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })

        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede editar publicaciones de otros usuarios'
          })

        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })

        case 'TITULO_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El título ingresado es inválido'
          })

        case 'DESCRIPCION_INVALIDA':
          return res.status(400).json({
            ok: false,
            message: 'La descripción ingresada es inválida'
          })

        case 'TIPO_ACCION_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El tipo de operación ingresado es inválido'
          })

        case 'UBICACION_INVALIDA':
          return res.status(400).json({
            ok: false,
            message: 'La ubicación ingresada es inválida'
          })

        case 'PRECIO_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El precio ingresado es inválido'
          })
      }
    }

    console.error('Error al editar publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo actualizar la publicación'
    })
  }
}

export const eliminarPublicacionController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioSolicitanteId = req.user?.id

  try {
    const resultado = await eliminarPublicacionService(publicacionId, Number(usuarioSolicitanteId))

    return res.status(200).json({
      ok: true,
      message: 'Publicación eliminada correctamente',
      data: resultado
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })

        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })

        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })

        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede eliminar publicaciones de otros usuarios'
          })

        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })
      }
    }

    console.error('Error al eliminar publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se puede eliminar la publicación, intente nuevamente'
    })
  }
}

export const obtenerDetallePublicacionController = async (req: Request, res: Response) => {
  const publicacionId = Number(req.params.id)

  try {
    const detalle = await obtenerDetallePublicacionService(publicacionId)

    return res.status(200).json({
      ok: true,
      data: detalle
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })

        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })
      }
    }

    console.error('Error al obtener detalle de publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo obtener el detalle de la publicación'
    })
  }
}
export const obtenerDetallePublicacionPorInmuebleController = async (
  req: Request,
  res: Response
) => {
  const inmuebleId = Number(req.params.inmuebleId)

  try {
    const detalle = await obtenerDetallePublicacionPorInmuebleService(inmuebleId)

    return res.status(200).json({
      ok: true,
      data: detalle
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id del inmueble es inválido'
          })

        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'No existe una publicación asociada a este inmueble'
          })
      }
    }

    console.error('Error al obtener detalle de publicación por inmueble:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo obtener el detalle de la publicación por inmueble'
    })
  }
}
export const confirmarPublicacionController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioSolicitanteId = req.user?.id

  try {
    const resultado = await confirmarPublicacionService(
      publicacionId,
      Number(usuarioSolicitanteId)
    )

    return res.status(200).json({
      ok: true,
      message: 'Publicación confirmada correctamente',
      data: resultado
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })

        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })

        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })

        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede confirmar publicaciones de otros usuarios'
          })

        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })

        case 'MULTIMEDIA_REQUERIDA':
          return res.status(400).json({
            ok: false,
            message: 'Debe agregar al menos una imagen o video antes de publicar'
          })
      }
    }

    console.error('Error al confirmar publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo confirmar la publicación'
    })
  }
}
export const iniciarPublicidadController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioId = req.user?.id

  try {
    const resultado = await iniciarPublicidadService(publicacionId, Number(usuarioId))

    return res.status(200).json({
      ok: true,
      checkoutUrl: resultado.checkoutUrl,
      message: 'Redirigiendo al pago...'
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })
        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })
        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })
        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede publicitar publicaciones de otros usuarios'
          })
        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })
        case 'PUBLICACION_YA_PUBLICITADA':
          return res.status(400).json({
            ok: false,
            message: 'La propiedad ya está publicitada'
          })
      }
    }

    console.error('Error al iniciar publicidad:', error)
    return res.status(500).json({
      ok: false,
      message: 'Error al iniciar publicidad'
    })
  }
}

/**
 * HU-11: Confirmar pago y activar publicidad
 * POST /api/publicaciones/:id/publicitar/confirmar
 * (Este endpoint puede ser llamado por webhook de pagos o confirmación manual)
 */
export const confirmarPublicidadController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioId = req.user?.id
  const { paymentIntentId } = req.body

  if (!paymentIntentId) {
    return res.status(400).json({
      ok: false,
      message: 'Se requiere el ID del pago'
    })
  }

  try {
    const resultado = await confirmarPublicidadService(
      publicacionId,
      Number(usuarioId),
      paymentIntentId
    )

    return res.status(200).json({
      ok: true,
      data: resultado,
      message: 'Publicidad activada correctamente'
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })
        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })
        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })
        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede publicitar publicaciones de otros usuarios'
          })
        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })
      }
    }

    console.error('Error al confirmar publicidad:', error)
    return res.status(500).json({
      ok: false,
      message: 'Error al confirmar publicidad'
    })
  }
}

/**
 * HU-11: Cancelar publicidad
 * DELETE /api/publicaciones/:id/publicitar/cancelar
 */
export const cancelarPublicidadController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)
  const usuarioId = req.user?.id

  try {
    const resultado = await cancelarPublicidadService(publicacionId, Number(usuarioId))

    return res.status(200).json({
      ok: true,
      data: resultado,
      message: 'Publicidad cancelada correctamente'
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })
        case 'USUARIO_INVALIDO':
          return res.status(401).json({
            ok: false,
            message: 'Usuario no autenticado'
          })
        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })
        case 'NO_AUTORIZADO':
          return res.status(403).json({
            ok: false,
            message: 'No puede cancelar publicidad de otros usuarios'
          })
        case 'PUBLICACION_YA_ELIMINADA':
          return res.status(409).json({
            ok: false,
            message: 'La publicación ya fue eliminada'
          })
        case 'PUBLICACION_NO_PUBLICITADA':
          return res.status(400).json({
            ok: false,
            message: 'La publicación no está publicitada'
          })
      }
    }

    console.error('Error al cancelar publicidad:', error)
    return res.status(500).json({
      ok: false,
      message: 'Error al cancelar publicidad'
    })
  }
}

/**
 * HU-11: Obtener estado de publicidad
 * GET /api/publicaciones/:id/publicitar/estado
 */
export const obtenerEstadoPublicidadController = async (req: AuthRequest, res: Response) => {
  const publicacionId = Number(req.params.id)

  try {
    const resultado = await obtenerEstadoPublicidadService(publicacionId)

    return res.status(200).json({
      ok: true,
      data: resultado
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'ID_INVALIDO':
          return res.status(400).json({
            ok: false,
            message: 'El id de la publicación es inválido'
          })
        case 'PUBLICACION_NO_EXISTE':
          return res.status(404).json({
            ok: false,
            message: 'La publicación no existe'
          })
      }
    }

    console.error('Error al obtener estado de publicidad:', error)
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener estado de publicidad'
    })
  }
}