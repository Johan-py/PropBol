import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.client.js';

export const getAdminTestimonios = async (req: Request, res: Response) => {
  try {
    const data = await prisma.testimonio.findMany({
      where: { eliminado: false },
      include: {
        usuario: {
          select: { nombre: true, avatar: true } 
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });


    const testimonios = data.map(t => ({
      id: t.id,
      nombreUsuario: t.usuario?.nombre || "Usuario Anónimo",
      departamento: t.ciudad || "No especificado",
      zonaBarrio: t.zona || "",
      categoria: t.categoria || "General",
      texto: t.comentario,
      avatar: t.usuario?.avatar || null,
      likes: 0, 
      activo: t.visible
    }));

    res.json(testimonios);
  } catch (error) {
    console.error("Error al obtener testimonios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};