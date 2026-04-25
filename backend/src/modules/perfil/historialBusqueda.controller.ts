import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.client.js';

export const getHistorialBusqueda = async (req: Request, res: Response) => {
    try {
        const usuarioId = req.user?.id; // Extraído de la sesión del usuario

        if (!usuarioId) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const historial = await prisma.historial_busqueda.findMany({
            where: { usuarioid: usuarioId },
            orderBy: { creadoen: 'desc' },
            take: 10 
        });

        res.json(historial);
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "Error al obtener historial de búsqueda" });
    }
};

export const guardarBusqueda = async (req: Request, res: Response) => {
    try {
        const usuarioId = req.user?.id;
        const { termino } = req.body;

        if (!usuarioId || !termino) {
            return res.status(400).json({ message: "Usuario o término faltante" });
        }

        const nuevaBusqueda = await prisma.historial_busqueda.create({
            data: {
                usuarioid: usuarioId,
                termino: termino
            }
        });

        res.status(201).json(nuevaBusqueda);
    } catch (error) {
        console.error("Error al guardar búsqueda:", error);
        res.status(500).json({ error: "Error al registrar la búsqueda" });
    }
};

export const eliminarBusqueda = async (req: Request, res: Response) => {
    try {
        const usuarioId = req.user?.id;
        const termino = req.params.termino as string;

        if (!usuarioId || !termino) {
            return res.status(400).json({ message: "Usuario o término faltante" });
        }

        await prisma.historial_busqueda.deleteMany({
            where: {
                usuarioid: usuarioId,
                termino: termino
            }
        });

        res.json({ message: "Búsqueda eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar búsqueda:", error);
        res.status(500).json({ error: "Error al eliminar la búsqueda" });
    }
};