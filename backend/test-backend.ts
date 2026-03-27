// backend/test-backend.ts
import { UbicacionesService } from './src/modules/ubicaciones/ubicaciones.service.js'

async function testPopularidad() {
  const service = new UbicacionesService()
  const idPrueba = 3 // El ID de Sacaba que queremos subir

  console.log(`🚀 Iniciando prueba de popularidad para ID: ${idPrueba}...`)

  try {
    // 1. Llamada directa al servicio (esto prueba Service -> Repository -> Prisma)
    await service.registrarConsulta(idPrueba)

    console.log('✅ ÉXITO: La base de datos debería haber incrementado la popularidad.')
    console.log('👉 Ahora revisa Prisma Studio para confirmar el cambio.')
  } catch (error) {
    console.error('❌ ERROR en la prueba:', error)
  }
}

testPopularidad()
