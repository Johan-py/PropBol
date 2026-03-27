import { NextApiRequest, NextApiResponse } from 'next'
import { UbicacionesService } from '../../src/modules/ubicaciones/ubicaciones.service.js'

const ubicacionesService = new UbicacionesService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //El sistema debe procesar la entrada correctamente
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  try {
    const { id } = req.body

    // Validación de la tarea: Cálculo de popularidad por consulta
    if (!id) {
      return res.status(400).json({ error: 'ID de ubicación requerido' })
    }

    //Incrementar popularidad al seleccionar sugerencia
    await ubicacionesService.registrarConsulta(Number(id))

    return res.status(200).json({ success: true, message: 'Popularidad actualizada' })
  } catch (error: any) {
    console.error('Error en API Popularidad:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
