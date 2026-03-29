import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });
  

// Validar sesión
export const validarSesion = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.id });
  } catch {
    res.status(401).json({ valid: false });
  }
};

// Publicaciones gratuitas restantes
export const publicacionesGratis = async (req, res) => {
  const userId = parseInt(req.params.id);
  const count = await prisma.publicacion.count({ where: { userId } });

  const limiteGratis = 3;
  const restantes = Math.max(limiteGratis - count, 0);

  res.json({ restantes });
};

// Crear publicación
export const crearPublicacion = async (req, res) => {
  try {
    const nueva = await prisma.publicacion.create({
      data: {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        userId: req.body.userId,
      },
    });
    res.json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};