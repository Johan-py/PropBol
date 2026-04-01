import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Poblando base de datos unificada...');

  const roles = ['ADMIN', 'PROPIETARIO', 'AGENTE', 'VISITANTE'];

  for (const nombreRol of roles) {
    await prisma.rol.upsert({
      where: { nombre: nombreRol as any },
      update: {},
      create: { nombre: nombreRol as any }
    });
  }

  // Obtenemos el ID del rol PROPIETARIO dinámicamente
  const rolPropietario = await prisma.rol.findFirst({
    where: { nombre: 'PROPIETARIO' }
  });

  if (!rolPropietario) throw new Error("No se pudo crear el rol PROPIETARIO");

  console.log(`✅ Roles listos. ID de Propietario: ${rolPropietario.id}`);
  // 1. Crear un Usuario Propietario (necesario para los inmuebles)
  const propietario = await prisma.usuario.upsert({
    where: { correo: 'jorge.test@bitpro.com' },
    update: {},
    create: {
      nombre: 'Jorge',
      apellido: 'Dev',
      correo: 'jorge.test@bitpro.com',
      password: 'hash_seguro_aca', // En la vida real usa bcrypt
      rolId: 2 // Asumiendo que 2 es PROPIETARIO
    }
  });

  // 2. Poblar Ubicaciones Maestras (Zonas de Cochabamba)
  const zonasCochabamba = [
    { nombre: 'Cala Cala', municipio: 'Cochabamba', popularidad: 150, lat: -17.373, lng: -66.158 },
    { nombre: 'El Prado', municipio: 'Cochabamba', popularidad: 90, lat: -17.393, lng: -66.157 },
    { nombre: 'Quillacollo Central', municipio: 'Quillacollo', popularidad: 45, lat: -17.398, lng: -66.281 },
    { nombre: 'Sacaba - Zona Central', municipio: 'Sacaba', popularidad: 20, lat: -17.403, lng: -66.040 }
  ];

  for (const z of zonasCochabamba) {
    const maestra = await prisma.ubicacion_maestra.create({
      data: {
        nombre: z.nombre,
        municipio: z.municipio,
        departamento: 'Cochabamba',
        popularidad: z.popularidad,
        latitud: z.lat,
        longitud: z.lng
      }
    });

    // 3. Crear un Inmueble de prueba vinculado a esta zona
    await prisma.inmueble.create({
      data: {
        titulo: `Hermoso Inmueble en ${z.nombre}`,
        tipoAccion: 'VENTA',
        categoria: 'CASA',
        precio: 125000,
        propietarioId: propietario.id,
        ubicacion: {
          create: {
            latitud: z.lat + 0.001, 
            longitud: z.lng + 0.001,
            direccion: `Calle Principal s/n, ${z.nombre}`,
            ubicacionMaestraId: maestra.id 
          }
        }
      }
    });
  }

  console.log('✅ Base de datos poblada con éxito.');
  console.log('💡 Ahora puedes buscar "Cala Cala" y verás un solo resultado con popularidad 150.');
}

main()
 .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });