import { prisma } from '../../lib/prisma.js'

export class UbicacionesRepository {
  /**
   * Incrementa el contador de popularidad de una ubicación específica.
   * Ordenar por las más buscadas.
   * @param id - El ID de la UbicacionMaestra seleccionada por el usuario.
   */
  async incrementarPopularidad(id: number) {
    try {
      return await prisma.ubicacionMaestra.update({
        where: { id },
        data: {
          popularidad: {
            increment: 1 // Incremento atómico en PostgreSQL
          }
        }
      })
    } catch (error) {
      console.error('Error en UbicacionesRepository (incrementarPopularidad):', error)
      throw error
    }
  }

  /**
   * Obtiene sugerencias de ubicaciones filtradas por nombre.
   * Cumple con los Criterios de Aceptación #2, #3, #4, #6 y #7.
   * @param query - El texto ingresado por el usuario (mínimo 3 caracteres).
   */
  async buscarSugerencias(query: string) {
    try {
      return await prisma.ubicacionMaestra.findMany({
        where: {
          nombre: {
            contains: query,
            mode: 'insensitive' // Criterio #3 y #4: Ignora tildes y mayúsculas
          }
        },
        orderBy: [
          { popularidad: 'desc' } // Criterio #6: Primero las más populares
        ],
        take: 5 // Criterio #2 y #64: Máximo 5 sugerencias iniciales
      })
    } catch (error) {
      console.error('Error en UbicacionesRepository (buscarSugerencias):', error)
      throw error
    }
  }
}
