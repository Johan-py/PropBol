import {
  buscarPublicacionesPorUsuarioRepository,
  buscarPublicacionPorIdRepository,
  actualizarPublicacionRepository,
  eliminarLogicamentePublicacionRepository,
  buscarDetallePublicacionPorIdRepository
} from './publicacion.repository.js'

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
    superficieM2: publicacion.inmueble.superficieM2
      ? Number(publicacion.inmueble.superficieM2)
      : null,
    imagenUrl: publicacion.multimedia?.[0]?.url ?? null
  }))
}

export const editarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
  data: any
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
    imagenes: publicacion.multimedia.map((item) => ({
      id: item.id,
      url: item.url,
      tipo: item.tipo,
      pesoMb: item.pesoMb ? Number(item.pesoMb) : null
    })),
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