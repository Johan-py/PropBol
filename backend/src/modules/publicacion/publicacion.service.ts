import {
  buscarPublicacionesPorUsuarioRepository,
  buscarPublicacionPorIdRepository,
  buscarResumenFinalPorIdRepository,
  actualizarPublicacionRepository,
  eliminarLogicamentePublicacionRepository
} from './publicacion.repository.js'

type PublicacionesPorUsuario = Awaited<ReturnType<typeof buscarPublicacionesPorUsuarioRepository>>
type ResumenFinalRecord = NonNullable<
  Awaited<ReturnType<typeof buscarResumenFinalPorIdRepository>>
>
type ResumenEtiquetaItem = ResumenFinalRecord['inmueble']['inmueble_etiqueta'][number]
type ResumenMultimediaItem = ResumenFinalRecord['multimedia'][number]

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

export const listarMisPublicacionesService = async (usuarioId: number) => {
  if (Number.isNaN(usuarioId) || usuarioId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicaciones = await buscarPublicacionesPorUsuarioRepository(usuarioId)

  return publicaciones.map((publicacion: PublicacionesPorUsuario[number]) => ({
    id: publicacion.id,
    titulo: publicacion.titulo,
    precio: Number(publicacion.inmueble.precio),
    ubicacion: publicacion.inmueble.ubicacion?.direccion || 'Ubicación no disponible',
    nroBanos: publicacion.inmueble.nroBanos,
    nroCuartos: publicacion.inmueble.nroCuartos,
    superficieM2: publicacion.inmueble.superficieM2
      ? Number(publicacion.inmueble.superficieM2)
      : null,
    imagenUrl: publicacion.multimedia?.[0]?.url ?? null
  }))
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

  if (resumen.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  const parametrosPersonalizados = resumen.inmueble.inmueble_etiqueta.map(
    (item: ResumenEtiquetaItem) => item.etiqueta.nombre
  )

  const imagenes = resumen.multimedia
    .filter((item: ResumenMultimediaItem) => item.tipo === 'IMAGEN')
    .map((item: ResumenMultimediaItem) => ({
      id: item.id,
      url: item.url,
      pesoMb: item.pesoMb === null || item.pesoMb === undefined ? null : Number(item.pesoMb)
    }))

  const videos = resumen.multimedia
    .filter((item: ResumenMultimediaItem) => item.tipo === 'VIDEO')
    .map((item: ResumenMultimediaItem) => ({
      id: item.id,
      url: item.url,
      pesoMb: item.pesoMb === null || item.pesoMb === undefined ? null : Number(item.pesoMb)
    }))

  return {
    publicacion: {
      id: resumen.id,
      titulo: resumen.titulo,
      descripcion: resumen.descripcion,
      estado: resumen.estado,
      fechaPublicacion: resumen.fechaPublicacion
    },
    datosGenerales: {
      tipoOperacion: resumen.inmueble.tipoAccion,
      tipoInmueble: resumen.inmueble.categoria,
      precio: Number(resumen.inmueble.precio),
      areaM2:
        resumen.inmueble.superficieM2 === null || resumen.inmueble.superficieM2 === undefined
          ? null
          : Number(resumen.inmueble.superficieM2)
    },
    ubicacion: {
      direccion: resumen.inmueble.ubicacion?.direccion ?? 'No especificado',
      ciudad: resumen.inmueble.ubicacion?.ciudad ?? 'No especificado',
      zona: resumen.inmueble.ubicacion?.zona ?? 'No especificado',
      latitud:
        resumen.inmueble.ubicacion?.latitud === null ||
        resumen.inmueble.ubicacion?.latitud === undefined
          ? null
          : Number(resumen.inmueble.ubicacion.latitud),
      longitud:
        resumen.inmueble.ubicacion?.longitud === null ||
        resumen.inmueble.ubicacion?.longitud === undefined
          ? null
          : Number(resumen.inmueble.ubicacion.longitud)
    },
    caracteristicas: {
      habitaciones: resumen.inmueble.nroCuartos ?? null,
      banos: resumen.inmueble.nroBanos ?? null,
      estacionamiento: 'No especificado'
    },
    parametrosPersonalizados,
    multimedia: {
      imagenes,
      videos
    },
    soloLectura: true
  }
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

  const titulo = data?.titulo ?? data?.title
  const descripcion = data?.descripcion ?? data?.details
  const tipoAccion = data?.tipoAccion ?? data?.operationType
  const ubicacion = data?.ubicacion ?? data?.location
  const precioRaw = data?.precio ?? data?.price

  if (titulo !== undefined && !String(titulo).trim()) {
    throw new Error('TITULO_INVALIDO')
  }

  if (descripcion !== undefined && !String(descripcion).trim()) {
    throw new Error('DESCRIPCION_INVALIDA')
  }

  if (tipoAccion !== undefined && !String(tipoAccion).trim()) {
    throw new Error('TIPO_ACCION_INVALIDO')
  }

  if (ubicacion !== undefined && !String(ubicacion).trim()) {
    throw new Error('UBICACION_INVALIDA')
  }

  if (
    precioRaw !== undefined &&
    precioRaw !== null &&
    precioRaw !== '' &&
    (Number.isNaN(Number(precioRaw)) || Number(precioRaw) <= 0)
  ) {
    throw new Error('PRECIO_INVALIDO')
  }

  const actualizada = await actualizarPublicacionRepository(publicacionId, data)

  return {
    id: actualizada.id,
    titulo: actualizada.titulo,
    descripcion: actualizada.descripcion,
    precio: Number(actualizada.inmueble.precio),
    tipoAccion: actualizada.inmueble.tipoAccion,
    ubicacion: actualizada.inmueble.ubicacion?.direccion || 'Ubicación no disponible',
    imagenUrl: actualizada.multimedia?.[0]?.url ?? null
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

  if (publicacion.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  await eliminarLogicamentePublicacionRepository(publicacion.id, publicacion.inmuebleId)

  return {
    id: publicacion.id,
    estado: 'ELIMINADA'
  }
}
