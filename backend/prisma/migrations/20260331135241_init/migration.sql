-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoAccion" AS ENUM ('VENTA', 'ALQUILER', 'ANTICRETO');

-- CreateEnum
CREATE TYPE "EstadoInmueble" AS ENUM ('ACTIVO', 'INACTIVO', 'VENDIDO', 'ALQUILADO', 'RESERVADO');

-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('ACTIVA', 'PAUSADA', 'ELIMINADA');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('CASA', 'DEPARTAMENTO', 'TERRENO', 'OFICINA');

-- CreateEnum
CREATE TYPE "RolNombre" AS ENUM ('ADMIN', 'PROPIETARIO', 'AGENTE', 'VISITANTE');

-- CreateEnum
CREATE TYPE "TipoMultimedia" AS ENUM ('IMAGEN', 'VIDEO');

-- CreateEnum
CREATE TYPE "TipoMarcador" AS ENUM ('NORMAL', 'DESTACADO', 'CLUSTER');

-- CreateEnum
CREATE TYPE "TipoInteraccion" AS ENUM ('CLICK', 'HOVER', 'ZOOM', 'DRAG');

-- CreateTable
CREATE TABLE "rol" (
    "id" SERIAL NOT NULL,
    "nombre" "RolNombre" NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "pais" TEXT,
    "avatar" TEXT,
    "genero" "Genero",
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rolId" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telefono" (
    "id" SERIAL NOT NULL,
    "codigoPais" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "telefono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesion" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLectura" TIMESTAMP(3),
    "eliminada" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_email" (
    "id" SERIAL NOT NULL,
    "emailNuevo" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEn" TIMESTAMP(3),
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "cambio_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil" (
    "id" SERIAL NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "datos" JSONB,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inmueble" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipoAccion" "TipoAccion" NOT NULL,
    "categoria" "Categoria",
    "precio" DECIMAL(12,2) NOT NULL,
    "superficieM2" DECIMAL(10,2),
    "nroCuartos" INTEGER,
    "nroBanos" INTEGER,
    "descripcion" TEXT,
    "estado" "EstadoInmueble" NOT NULL DEFAULT 'ACTIVO',
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propietarioId" INTEGER NOT NULL,

    CONSTRAINT "inmueble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicacion_inmueble" (
    "id" SERIAL NOT NULL,
    "latitud" DECIMAL(10,7) NOT NULL,
    "longitud" DECIMAL(10,7) NOT NULL,
    "direccion" TEXT,
    "zona" TEXT,
    "ciudad" TEXT NOT NULL,
    "inmuebleId" INTEGER NOT NULL,

    CONSTRAINT "ubicacion_inmueble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiqueta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "etiqueta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inmueble_etiqueta" (
    "inmuebleId" INTEGER NOT NULL,
    "etiquetaId" INTEGER NOT NULL,

    CONSTRAINT "inmueble_etiqueta_pkey" PRIMARY KEY ("inmuebleId","etiquetaId")
);

-- CreateTable
CREATE TABLE "publicacion" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'ACTIVA',
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "inmuebleId" INTEGER NOT NULL,

    CONSTRAINT "publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multimedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "TipoMultimedia" NOT NULL,
    "pesoMb" DECIMAL(8,2),
    "publicacionId" INTEGER NOT NULL,

    CONSTRAINT "multimedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcador_mapa" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMarcador" NOT NULL,
    "esVisible" BOOLEAN NOT NULL DEFAULT true,
    "nivelZ" INTEGER,
    "inmuebleId" INTEGER NOT NULL,
    "ubicacionId" INTEGER NOT NULL,

    CONSTRAINT "marcador_mapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_marcadores" (
    "id" SERIAL NOT NULL,
    "latitudCentro" DECIMAL(10,7) NOT NULL,
    "longitudCentro" DECIMAL(10,7) NOT NULL,
    "cantidadInmuebles" INTEGER NOT NULL,
    "nivelColor" TEXT,
    "nivelZoom" INTEGER NOT NULL,
    "radioKm" DECIMAL(10,2),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupo_marcadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_grupo" (
    "grupoId" INTEGER NOT NULL,
    "marcadorId" INTEGER NOT NULL,

    CONSTRAINT "detalle_grupo_pkey" PRIMARY KEY ("grupoId","marcadorId")
);

-- CreateTable
CREATE TABLE "sesion_mapa" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "limiteNorte" DECIMAL(10,7),
    "limiteSur" DECIMAL(10,7),
    "limiteEste" DECIMAL(10,7),
    "limiteOeste" DECIMAL(10,7),
    "nivelZoom" INTEGER NOT NULL,
    "latitudCentro" DECIMAL(10,7),
    "longitudCentro" DECIMAL(10,7),
    "iniciadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaActividad" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesion_mapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaccion_mapa" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoInteraccion" NOT NULL,
    "latitudMomento" DECIMAL(10,7),
    "longitudMomento" DECIMAL(10,7),
    "zoomMomento" INTEGER,
    "ocurrioEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sesionId" INTEGER NOT NULL,
    "marcadorId" INTEGER NOT NULL,

    CONSTRAINT "interaccion_mapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_home" (
    "id" SERIAL NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titulo" TEXT,
    "subtitulo" TEXT,

    CONSTRAINT "banner_home_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "metaData" JSONB,
    "fechaVisita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,

    CONSTRAINT "visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE INDEX "usuario_correo_idx" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "sesion_token_key" ON "sesion"("token");

-- CreateIndex
CREATE UNIQUE INDEX "cambio_email_token_key" ON "cambio_email"("token");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_usuarioId_key" ON "perfil"("usuarioId");

-- CreateIndex
CREATE INDEX "inmueble_propietarioId_idx" ON "inmueble"("propietarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ubicacion_inmueble_inmuebleId_key" ON "ubicacion_inmueble"("inmuebleId");

-- CreateIndex
CREATE UNIQUE INDEX "etiqueta_nombre_key" ON "etiqueta"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "sesion_mapa_token_key" ON "sesion_mapa"("token");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefono" ADD CONSTRAINT "telefono_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion" ADD CONSTRAINT "sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_email" ADD CONSTRAINT "cambio_email_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil" ADD CONSTRAINT "perfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmueble" ADD CONSTRAINT "inmueble_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicacion_inmueble" ADD CONSTRAINT "ubicacion_inmueble_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmueble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmueble_etiqueta" ADD CONSTRAINT "inmueble_etiqueta_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmueble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmueble_etiqueta" ADD CONSTRAINT "inmueble_etiqueta_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "etiqueta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacion" ADD CONSTRAINT "publicacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacion" ADD CONSTRAINT "publicacion_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmueble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multimedia" ADD CONSTRAINT "multimedia_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcador_mapa" ADD CONSTRAINT "marcador_mapa_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmueble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcador_mapa" ADD CONSTRAINT "marcador_mapa_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicacion_inmueble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_grupo" ADD CONSTRAINT "detalle_grupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupo_marcadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_grupo" ADD CONSTRAINT "detalle_grupo_marcadorId_fkey" FOREIGN KEY ("marcadorId") REFERENCES "marcador_mapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaccion_mapa" ADD CONSTRAINT "interaccion_mapa_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesion_mapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaccion_mapa" ADD CONSTRAINT "interaccion_mapa_marcadorId_fkey" FOREIGN KEY ("marcadorId") REFERENCES "marcador_mapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor" ADD CONSTRAINT "visitor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
