import 'dotenv/config';
import { prisma } from '../src/lib/prisma.client.js';
import { public_Categoria, public_TipoAccion } from '@prisma/client';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('🌱 Iniciando motor de siembra para PropBol...');

  // 1. Limpieza segura (Respeta tu esquema exacto)
  await prisma.inmuebleEtiqueta.deleteMany();
  await prisma.ubicacionInmueble.deleteMany();
  await prisma.inmueble.deleteMany();
  await prisma.barrio.deleteMany();
  await prisma.zona_geografica.deleteMany();
  await prisma.municipio.deleteMany();
  await prisma.provincia.deleteMany();
  await prisma.departamento.deleteMany();
  await prisma.etiqueta.deleteMany();

  // 2. Usuario Propietario de Prueba
  let propietario = await prisma.usuario.findUnique({ where: { correo: 'propietario@propbol.com' } });
  
  if (!propietario) {
    // Si no existe, creamos un Rol temporal y luego el Usuario
    const rol = await prisma.rol.upsert({
      where: { nombre: 'PROPIETARIO' },
      update: {},
      create: { nombre: 'PROPIETARIO' }
    });

    propietario = await prisma.usuario.create({
      data: {
        nombre: 'Propietario',
        apellido: 'Prueba',
        correo: 'propietario@propbol.com',
        password: 'hash_seguro',
        rol_id: rol.id,
        updated_at: new Date()
      }
    });
  }

  // 3. Crear Etiquetas (Filtros extra solicitados por el PO)
  const etiquetasBase = ['Por Inversión', 'Proyecto en Construcción', 'Piscina', 'Acepta Mascotas', 'Baño Compartido'];
  for (const nombre of etiquetasBase) {
    await prisma.etiqueta.create({ data: { nombre } });
  }
  const etiquetasGuardadas = await prisma.etiqueta.findMany();

  // 4. Jerarquía Geográfica Cochabamba
  const deptoCbba = await prisma.departamento.create({ data: { nombre: 'Cochabamba' } });
  
  const provQuillacollo = await prisma.provincia.create({ data: { nombre: 'Quillacollo', departamento_id: deptoCbba.id } });
  const provChapare = await prisma.provincia.create({ data: { nombre: 'Chapare', departamento_id: deptoCbba.id } });

  const muniQuilla = await prisma.municipio.create({ data: { nombre: 'Quillacollo', provincia_id: provQuillacollo.id } });
  const muniSacaba = await prisma.municipio.create({ data: { nombre: 'Sacaba', provincia_id: provChapare.id } });

  const zonaCentroQuilla = await prisma.zona_geografica.create({ data: { nombre: 'Centro', municipio_id: muniQuilla.id } });
  const barrioPlaza = await prisma.barrio.create({ data: { nombre: 'Inmediaciones Plaza', zona_id: zonaCentroQuilla.id } });

  const zonaNorteSacaba = await prisma.zona_geografica.create({ data: { nombre: 'Zona Norte', municipio_id: muniSacaba.id } });
  const barrioPacata = await prisma.barrio.create({ data: { nombre: 'Pacata Alta', zona_id: zonaNorteSacaba.id } });

  // 5. Generador de Inmuebles con Reglas de Negocio
  const sembrarPropiedades = async (cantidad: number, barrioId: number, nombreLugar: string) => {
    const categorias = Object.values(public_Categoria);
    const acciones = Object.values(public_TipoAccion);

    for (let i = 0; i < cantidad; i++) {
      let categoria = categorias[randomInt(0, categorias.length - 1)];
      let accion = acciones[randomInt(0, acciones.length - 1)];

      // --- REGLAS ESTRICTAS ---
      // Los terrenos solo pueden ser venta
      if (categoria === 'TERRENO' || categoria === 'TERRENO_MORTUORIO') {
        accion = 'VENTA';
      }

      let nroCuartos: number | null = null;
      let nroBanos: number | null = null;
      let banoCompartido = false;

      if (categoria === 'CASA' || categoria === 'DEPARTAMENTO') {
        nroCuartos = randomInt(1, 5);
        nroBanos = randomInt(1, 3);
      } else if (categoria === 'CUARTO') {
        nroCuartos = 1;
        nroBanos = 1;
        banoCompartido = Math.random() > 0.5; // 50% probabilidad
      }

      // 6. Inserción Transaccional
      await prisma.$transaction(async (tx) => {
        const inmueble = await tx.inmueble.create({
          data: {
            titulo: `${categoria} en ${accion} - ${nombreLugar} #${i + 1}`,
            descripcion: `Propiedad disponible para ${accion}. Excelente oportunidad.`,
            precio: randomInt(1000, 150000),
            categoria,
            tipoAccion: accion,
            nroCuartos,
            nroBanos,
            banoCompartido,
            propietarioId: propietario!.id,
            estado: 'ACTIVO',
            updatedAt: new Date()
          }
        });

        await tx.ubicacionInmueble.create({
          data: {
            inmuebleId: inmueble.id,
            barrio_id: barrioId,
            latitud: -17.3935 + (Math.random() * 0.1),
            longitud: -66.1570 + (Math.random() * 0.1),
            ciudad: 'Cochabamba'
          }
        });

        // Asignar 1 a 3 etiquetas
        const cantEtiquetas = randomInt(1, 3);
        const tags = etiquetasGuardadas.sort(() => 0.5 - Math.random()).slice(0, cantEtiquetas);
        for (const t of tags) {
          await tx.inmuebleEtiqueta.create({
            data: { inmuebleId: inmueble.id, etiquetaId: t.id }
          });
        }
      });
    }
  };

  console.log('Construyendo 10 propiedades en Sacaba...');
  await sembrarPropiedades(10, barrioPacata.id, 'Sacaba');

  console.log('Construyendo 34 propiedades en Quillacollo...');
  await sembrarPropiedades(34, barrioPlaza.id, 'Quillacollo');

  console.log('✅ Base de datos sembrada con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });