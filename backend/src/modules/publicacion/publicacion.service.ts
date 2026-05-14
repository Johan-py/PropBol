import { prisma } from '../../lib/prisma.client.js'
import {
  buscarPublicacionesPorUsuarioRepository,
  buscarPublicacionPorIdRepository,
  buscarResumenFinalPorIdRepository,
  actualizarPublicacionRepository,
  eliminarLogicamentePublicacionRepository,
  buscarDetallePublicacionPorIdRepository,
  confirmarPublicacionRepository,
  buscarDetallePublicacionPorInmuebleIdRepository,
  activarPublicidadRepository,
  cancelarPublicidadRepository,
  buscarPublicacionPorIdSimpleRepository,
  verificarPublicidadActivaRepository
} from './publicacion.repository.js'
import { cloudinary } from '../../config/cloudinary.js'

type TipoAccionPermitido = 'VENTA' | 'ALQUILER' | 'ANTICRETO'

type EditarPublicacionInput = {
  titulo?: unknown
  title?: unknown
  descripcion?: unknown
  details?: unknown
  tipoAccion?: unknown
  operationType?: unknown
  ubicacion?: unknown
  location?: unknown
  precio?: unknown
  price?: unknown
}

type ResumenFinalRepositoryResult = NonNullable<
  Awaited<ReturnType<typeof buscarResumenFinalPorIdRepository>>
>

type ParametroPersonalizadoDb = ResumenFinalRepositoryResult['inmueble'] extends {
  inmueble_etiqueta: Array<infer T>
}
  ? T
  : never

type MultimediaDb = ResumenFinalRepositoryResult['multimedia'] extends Array<infer T> ? T : never

type ParametroPersonalizadoResumen = {
  id: number
  nombre: string
}

type MultimediaResumen = {
  id: number
  url: string
  tipo: string
  pesoMb: number | null
}

type EstadisticaPublicacionResumen = {
  publicacion_id: number
  total_visualizaciones: number
  total_compartidos: number
}

const ESTADO_PUBLICACION_ELIMINADA = 'ELIMINADA'
const TIPO_MULTIMEDIA_IMAGEN = 'IMAGEN'
const TIPO_MULTIMEDIA_VIDEO = 'VIDEO'
const TIPOS_ACCION_VALIDOS: TipoAccionPermitido[] = ['VENTA', 'ALQUILER', 'ANTICRETO']

const normalizarTexto = (valor: unknown) => String(valor ?? '').trim()

const normalizarTipoMultimedia = (tipo: unknown) => normalizarTexto(tipo).toUpperCase()

const esNumeroPositivo = (valor: unknown) => {
  if (valor === undefined || valor === null || valor === '') {
    return false
  }

  const numero = Number(valor)
  return !Number.isNaN(numero) && numero > 0
}

const obtenerTipoAccionNormalizado = (valor: unknown): TipoAccionPermitido | null => {
  const tipoAccion = normalizarTexto(valor).toUpperCase()

  if (!tipoAccion) {
    return null
  }

  return TIPOS_ACCION_VALIDOS.includes(tipoAccion as TipoAccionPermitido)
    ? (tipoAccion as TipoAccionPermitido)
    : null
}

const obtenerPrimeraImagenUrl = (
  multimedia:
    | Array<{
        url: string
        tipo?: unknown
      }>
    | null
    | undefined
) => {
  if (!multimedia || multimedia.length === 0) {
    return null
  }

  const primeraImagen = multimedia.find(
    (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN
  )

  return primeraImagen?.url ?? null
}

export const listarMisPublicacionesService = async (usuarioId: number) => {
  if (Number.isNaN(usuarioId) || usuarioId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicaciones = await buscarPublicacionesPorUsuarioRepository(usuarioId)

  type PublicacionesPorUsuario = Awaited<ReturnType<typeof buscarPublicacionesPorUsuarioRepository>>

  return publicaciones.map((publicacion: PublicacionesPorUsuario[number]) => ({
    id: publicacion.id,
    titulo: publicacion.titulo,
    precio: Number(publicacion.inmueble.precio),
    ubicacion: publicacion.inmueble.ubicacion?.direccion || 'Ubicación no disponible',
    nroBanos: publicacion.inmueble.nroBanos,
    nroCuartos: publicacion.inmueble.nroCuartos,
    superficieM2:
      publicacion.inmueble.superficieM2 !== null && publicacion.inmueble.superficieM2 !== undefined
        ? Number(publicacion.inmueble.superficieM2)
        : null,
    imagenUrl: obtenerPrimeraImagenUrl(publicacion.multimedia),
    promoted: publicacion.promoted ?? false
  }))
}

export const editarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
  data: EditarPublicacionInput
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (publicacion.usuarioId !== usuarioSolicitanteId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  const titulo = data?.titulo ?? data?.title
  const descripcion = data?.descripcion ?? data?.details
  const tipoAccion = data?.tipoAccion ?? data?.operationType
  const ubicacion = data?.ubicacion ?? data?.location
  const precioRaw = data?.precio ?? data?.price

  if (titulo !== undefined && !normalizarTexto(titulo)) {
    throw new Error('TITULO_INVALIDO')
  }

  if (descripcion !== undefined && !normalizarTexto(descripcion)) {
    throw new Error('DESCRIPCION_INVALIDA')
  }

  if (ubicacion !== undefined && !normalizarTexto(ubicacion)) {
    throw new Error('UBICACION_INVALIDA')
  }

  if (tipoAccion !== undefined) {
    const tipoAccionNormalizado = obtenerTipoAccionNormalizado(tipoAccion)

    if (!tipoAccionNormalizado) {
      throw new Error('TIPO_ACCION_INVALIDO')
    }
  }

  if (
    precioRaw !== undefined &&
    precioRaw !== null &&
    precioRaw !== '' &&
    !esNumeroPositivo(precioRaw)
  ) {
    throw new Error('PRECIO_INVALIDO')
  }

  const payloadNormalizado: Record<string, unknown> = {
    ...(data as Record<string, unknown>)
  }

  if (titulo !== undefined) {
    payloadNormalizado.titulo = normalizarTexto(titulo)
  }

  if (descripcion !== undefined) {
    payloadNormalizado.descripcion = normalizarTexto(descripcion)
  }

  if (ubicacion !== undefined) {
    payloadNormalizado.ubicacion = normalizarTexto(ubicacion)
  }

  if (tipoAccion !== undefined) {
    payloadNormalizado.tipoAccion = obtenerTipoAccionNormalizado(tipoAccion)
  }

  if (
    precioRaw !== undefined &&
    precioRaw !== null &&
    precioRaw !== '' &&
    esNumeroPositivo(precioRaw)
  ) {
    payloadNormalizado.precio = Number(precioRaw)
  }

  const actualizada = await actualizarPublicacionRepository(publicacionId, payloadNormalizado)

  return {
    id: actualizada.id,
    titulo: actualizada.titulo,
    descripcion: actualizada.descripcion,
    precio: Number(actualizada.inmueble.precio),
    tipoAccion: actualizada.inmueble.tipoAccion,
    ubicacion: actualizada.inmueble.ubicacion?.direccion || 'Ubicación no disponible',
    imagenUrl: obtenerPrimeraImagenUrl(actualizada.multimedia)
  }
}

export const eliminarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (publicacion.usuarioId !== usuarioSolicitanteId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  await eliminarLogicamentePublicacionRepository(publicacion.id, publicacion.inmuebleId)

  return {
    id: publicacion.id,
    estado: ESTADO_PUBLICACION_ELIMINADA
  }
}

export const obtenerResumenFinalService = async (
  publicacionId: number,
  usuarioSolicitanteId: number
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const resumen = await buscarResumenFinalPorIdRepository(publicacionId)

  if (!resumen) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (resumen.usuarioId !== usuarioSolicitanteId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (resumen.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  const parametrosPersonalizados: ParametroPersonalizadoResumen[] = (
    resumen.inmueble?.inmueble_etiqueta ?? []
  ).map((item: ParametroPersonalizadoDb) => ({
    id: item.etiqueta.id,
    nombre: item.etiqueta.nombre
  }))

  const parametrosUnicos = parametrosPersonalizados.filter(
    (
      parametro: ParametroPersonalizadoResumen,
      index: number,
      array: ParametroPersonalizadoResumen[]
    ) => array.findIndex((item) => item.id === parametro.id) === index
  )

  const multimedia: MultimediaResumen[] = (resumen.multimedia ?? []).map((item: MultimediaDb) => ({
    id: item.id,
    url: item.url,
    tipo: normalizarTipoMultimedia(item.tipo),
    pesoMb: item.pesoMb !== null && item.pesoMb !== undefined ? Number(item.pesoMb) : null
  }))

  const imagenes = multimedia.filter(
    (item: MultimediaResumen) => item.tipo === TIPO_MULTIMEDIA_IMAGEN
  )

  const videos = multimedia.filter((item: MultimediaResumen) => item.tipo === TIPO_MULTIMEDIA_VIDEO)

  return {
    id: resumen.id,
    publicacionId: resumen.id,
    inmuebleId: resumen.inmuebleId,

    publicacion: {
      titulo: resumen.titulo ?? resumen.inmueble?.titulo ?? null,
      descripcion: resumen.descripcion ?? resumen.inmueble?.descripcion ?? null,
      estado: resumen.estado,
      fechaPublicacion: resumen.fechaPublicacion
    },

    datosGenerales: {
      tipoOperacion: resumen.inmueble?.tipoAccion ?? null,
      tipoInmueble: resumen.inmueble?.categoria ?? null,
      direccion: resumen.inmueble?.ubicacion?.direccion ?? 'No especificado',
      ciudad: resumen.inmueble?.ubicacion?.ciudad ?? 'No especificado',
      zona: resumen.inmueble?.ubicacion?.zona ?? 'No especificado',
      precio:
        resumen.inmueble?.precio !== null && resumen.inmueble?.precio !== undefined
          ? Number(resumen.inmueble.precio)
          : null,
      areaM2:
        resumen.inmueble?.superficieM2 !== null && resumen.inmueble?.superficieM2 !== undefined
          ? Number(resumen.inmueble.superficieM2)
          : null,
      coordenadas: {
        latitud: resumen.inmueble?.ubicacion?.latitud ?? null,
        longitud: resumen.inmueble?.ubicacion?.longitud ?? null
      }
    },

    caracteristicas: {
      habitaciones: resumen.inmueble?.nroCuartos ?? null,
      banos: resumen.inmueble?.nroBanos ?? null,
      estacionamiento: null
    },

    parametrosPersonalizados: parametrosUnicos,

    multimedia: {
      total: multimedia.length,
      imagenes,
      videos
    },

    soloLectura: true
  }
}

export const obtenerDetallePublicacionService = async (publicacionId: number) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  const publicacion = await buscarDetallePublicacionPorIdRepository(publicacionId)

  if (!publicacion || publicacion.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  const telefonoPrincipal =
    publicacion.usuario.telefonos.find((item) => item.principal) ?? publicacion.usuario.telefonos[0]

  return {
    id: publicacion.id,
    titulo: publicacion.titulo,
    precio: Number(publicacion.inmueble.precio),
    tipoInmueble: publicacion.inmueble.categoria ?? null,
    tipoOperacion: publicacion.inmueble.tipoAccion,
    ubicacionTexto: publicacion.inmueble.ubicacion?.direccion || 'Ubicación no disponible',
    descripcion:
      publicacion.descripcion || publicacion.inmueble.descripcion || 'Sin descripción disponible',
    imagenes: publicacion.multimedia
      .filter((item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN)
      .map((item) => ({
        id: item.id,
        url: item.url,
        tipo: item.tipo,
        pesoMb: item.pesoMb ? Number(item.pesoMb) : null
      })),
    videoUrl:
      publicacion.multimedia.find(
        (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_VIDEO
      )?.url ?? null,
    detalles: {
      habitaciones: publicacion.inmueble.nroCuartos ?? null,
      banos: publicacion.inmueble.nroBanos ?? null,
      superficieUtil: publicacion.inmueble.superficieM2
        ? Number(publicacion.inmueble.superficieM2)
        : null
    },
    caracteristicasAdicionales:
      publicacion.inmueble.inmueble_etiqueta?.map((item) => item.etiqueta.nombre) ?? [],
    mapa: {
      latitud: publicacion.inmueble.ubicacion?.latitud
        ? Number(publicacion.inmueble.ubicacion.latitud)
        : null,
      longitud: publicacion.inmueble.ubicacion?.longitud
        ? Number(publicacion.inmueble.ubicacion.longitud)
        : null,
      direccion: publicacion.inmueble.ubicacion?.direccion || null
    },
    contacto: {
      nombre: `${publicacion.usuario.nombre} ${publicacion.usuario.apellido}`,
      correo: publicacion.usuario.correo ?? null,
      telefono: telefonoPrincipal
        ? `${telefonoPrincipal.codigoPais} ${telefonoPrincipal.numero}`
        : null
    }
  }
}

export const obtenerDetallePublicacionPorInmuebleService = async (inmuebleId: number) => {
  if (Number.isNaN(inmuebleId) || inmuebleId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  const publicacion = await buscarDetallePublicacionPorInmuebleIdRepository(inmuebleId)

  if (!publicacion || publicacion.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  const telefonoPrincipal =
    publicacion.usuario.telefonos.find((item) => item.principal) ?? publicacion.usuario.telefonos[0]

  return {
    id: publicacion.id,
    inmuebleId: publicacion.inmueble.id,
    titulo: publicacion.titulo,
    precio: Number(publicacion.inmueble.precio),
    //HU6-precio Anterior
    precio_anterior: publicacion.inmueble.precio_anterior ? Number(publicacion.inmueble.precio_anterior) : undefined,
    tipoInmueble: publicacion.inmueble.categoria ?? null,
    tipoOperacion: publicacion.inmueble.tipoAccion,
    ubicacionTexto: publicacion.inmueble.ubicacion?.direccion || 'Ubicación no disponible',
    descripcion:
      publicacion.descripcion || publicacion.inmueble.descripcion || 'Sin descripción disponible',
    imagenes: publicacion.multimedia
      .filter((item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_IMAGEN)
      .map((item) => ({
        id: item.id,
        url: item.url,
        tipo: item.tipo,
        pesoMb: item.pesoMb ? Number(item.pesoMb) : null
      })),
    videoUrl:
      publicacion.multimedia.find(
        (item) => normalizarTipoMultimedia(item.tipo) === TIPO_MULTIMEDIA_VIDEO
      )?.url ?? null,
    detalles: {
      habitaciones: publicacion.inmueble.nroCuartos ?? null,
      banos: publicacion.inmueble.nroBanos ?? null,
      superficieUtil: publicacion.inmueble.superficieM2
        ? Number(publicacion.inmueble.superficieM2)
        : null
    },
    caracteristicasAdicionales:
      publicacion.inmueble.inmueble_etiqueta?.map((item) => item.etiqueta.nombre) ?? [],
    mapa: {
      latitud: publicacion.inmueble.ubicacion?.latitud
        ? Number(publicacion.inmueble.ubicacion.latitud)
        : null,
      longitud: publicacion.inmueble.ubicacion?.longitud
        ? Number(publicacion.inmueble.ubicacion.longitud)
        : null,
      direccion: publicacion.inmueble.ubicacion?.direccion || null
    },
    contacto: {
      nombre: `${publicacion.usuario.nombre} ${publicacion.usuario.apellido}`,
      correo: publicacion.usuario.correo ?? null,
      telefono: telefonoPrincipal
        ? `${telefonoPrincipal.codigoPais} ${telefonoPrincipal.numero}`
        : null
    }
  }
}

export const confirmarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (publicacion.usuarioId !== usuarioSolicitanteId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (publicacion.estado === ESTADO_PUBLICACION_ELIMINADA) {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  if (!publicacion.multimedia || publicacion.multimedia.length === 0) {
    throw new Error('MULTIMEDIA_REQUERIDA')
  }

  const publicacionConfirmada = await confirmarPublicacionRepository(publicacion.id)

  return {
    id: publicacionConfirmada.id,
    estado: publicacionConfirmada.estado,
    fechaPublicacion: publicacionConfirmada.fechaPublicacion,
    multimediaTotal: publicacionConfirmada.multimedia.length
  }
}

export const iniciarPublicidadService = async (
  publicacionId: number,
  usuarioId: number
): Promise<{ checkoutUrl: string }> => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioId) || usuarioId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (publicacion.usuarioId !== usuarioId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (publicacion.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  
  const yaPublicitada = await verificarPublicidadActivaRepository(publicacionId)
  if (yaPublicitada) {
    throw new Error('PUBLICACION_YA_PUBLICITADA')
  }

 
  // SIMULACIÓN (reemplazar con integración real)
  const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago?publicacion=${publicacionId}&monto=9.99`

  return { checkoutUrl }
}

export const confirmarPublicidadService = async (
  publicacionId: number,
  usuarioId: number,
  paymentIntentId: string
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioId) || usuarioId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (publicacion.usuarioId !== usuarioId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (publicacion.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  const publicacionActualizada = await activarPublicidadRepository(
    publicacionId,
    usuarioId,
    paymentIntentId
  )

  return {
    id: publicacionActualizada.id,
    promoted: publicacionActualizada.promoted,
    promotedAt: publicacionActualizada.promotedAt,
    promotedExpiresAt: publicacionActualizada.promotedExpiresAt,
    message: 'Publicidad activada correctamente por 30 días'
  }
}


export const cancelarPublicidadService = async (
  publicacionId: number,
  usuarioId: number
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioId) || usuarioId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (publicacion.usuarioId !== usuarioId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (publicacion.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  if (!publicacion.promoted) {
    throw new Error('PUBLICACION_NO_PUBLICITADA')
  }

  const publicacionActualizada = await cancelarPublicidadRepository(publicacionId, usuarioId)

  return {
    id: publicacionActualizada.id,
    promoted: false,
    message: 'Publicidad cancelada correctamente'
  }
}

export const obtenerEstadoPublicidadService = async (publicacionId: number) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdSimpleRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  const activa = await verificarPublicidadActivaRepository(publicacionId)

  return {
    id: publicacion.id,
    promoted: activa,
    promotedAt: activa ? publicacion.promotedAt : null,
    promotedExpiresAt: activa ? publicacion.promotedExpiresAt : null
  }
}
