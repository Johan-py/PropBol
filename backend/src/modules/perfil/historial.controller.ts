import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

export const getHistorialVistas = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id

    if (!usuarioId) return res.status(401).json({ message: 'No autorizado' })

    const historial = await prisma.propiedad_vista.findMany({
      where: { usuarioId: usuarioId },
      include: {
        inmueble: {
          include: {
            ubicacion: true,
            publicaciones: {
              include: { multimedia: true },
              take: 1
            }
          }
        }
      },
      orderBy: { vistaEn: 'desc' },
      take: 10
    })

    const cardsData = historial.map((item) => ({
      id: item.id,
      inmuebleId: item.inmuebleId, // ← AGREGADO
      title: item.inmueble.titulo,
      price: item.inmueble.precio,
      location: `${item.inmueble.ubicacion?.ciudad || 'Cochabamba'}, Bolivia`,
      viewedDate: item.vistaEn,
      imageUrl: item.inmueble.publicaciones[0]?.multimedia[0]?.url || null
    }))

    if (cardsData.length === 0) {
      return res.json([
        {
          id: 1,
          inmuebleId: 1, // ← AGREGADO
          title: 'casa en Alalay (Prueba QA)',
          price: 188586,
          location: 'Cochabamba, Bolivia',
          viewedDate: new Date(),
          imageUrl: 'https://via.placeholder.com/400x300.png?text=Imagen+de+la+Casa'
        }
      ])
    }

    res.json(cardsData)
  } catch (error) {
    console.error('Error en historial:', error)
    res.status(500).json({ error: 'Error al obtener historial para la card' })
  }
}
