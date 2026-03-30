import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Extendemos la interfaz de Express para que TypeScript reconozca 'usuario'.
 * Esto asume que tu middleware de JWT inyecta el objeto usuario en el request.
 */
interface AuthRequest extends Request {
  usuario?: {
    id: number;
    // añade más propiedades si tu JWT las incluye
  };
}

// 1. Validar contraseña actual para habilitar edición
export const verificarPassword = async (req: AuthRequest, res: Response) => {
  const { passwordActual } = req.body;
  const usuarioId = req.usuario?.id;

  if (!usuarioId) return res.status(401).json({ ok: false, msg: 'No hay token válido' });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

    if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });

    const validPassword = bcrypt.compareSync(passwordActual, usuario.password);

    if (!validPassword) {
      return res.status(401).json({ ok: false, msg: 'Contraseña incorrecta' });
    }

    return res.json({ ok: true, msg: 'Identidad verificada' });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error al verificar identidad' });
  }
};

// 2. Validar nuevo email y enviar OTP
export const solicitarCambioEmail = async (req: AuthRequest, res: Response) => {
  const { emailNuevo } = req.body;
  const usuarioId = req.usuario?.id;

  if (!usuarioId) return res.status(401).json({ ok: false, msg: 'No autorizado' });

  try {
    // Criterio: Verificar si el correo ya existe
    const existeEmail = await prisma.usuario.findUnique({ where: { correo: emailNuevo } });
    if (existeEmail) {
      return res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
    }

    // Generar OTP de 4 dígitos y expiración de 5 min
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiraEn = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.cambioEmail.create({
      data: {
        token: otp,
        emailNuevo,
        expiraEn,
        usuarioId
      }
    });

    // TODO: Llamar servicio de correos aquí
    return res.json({ ok: true, msg: 'Código enviado al nuevo correo' });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error al solicitar cambio' });
  }
};

// 3. Validar OTP y ejecutar cambio en DB
export const confirmarCambioEmail = async (req: AuthRequest, res: Response) => {
  const { otp } = req.body;
  const usuarioId = req.usuario?.id;

  if (!usuarioId) return res.status(401).json({ ok: false, msg: 'No autorizado' });

  try {
    const solicitud = await prisma.cambioEmail.findFirst({
      where: { usuarioId, completadoEn: null },
      orderBy: { creadoEn: 'desc' }
    });

    if (!solicitud) {
      return res.status(404).json({ ok: false, msg: 'No hay solicitudes pendientes' });
    }

    // Criterios de aceptación: Expiración
    if (new Date() > solicitud.expiraEn) {
      return res.status(410).json({ ok: false, msg: 'Código expirado' });
    }

    if (solicitud.token !== otp) {
      return res.status(400).json({ ok: false, msg: 'Código incorrecto' });
    }

    // Transacción de Prisma: Actualiza usuario y marca la solicitud como completada
    const [usuarioActualizado] = await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { correo: solicitud.emailNuevo }
      }),
      prisma.cambioEmail.update({
        where: { id: solicitud.id },
        data: { completadoEn: new Date() }
      })
    ]);

    return res.json({
      ok: true,
      msg: 'Correo actualizado exitosamente',
      nuevoCorreo: usuarioActualizado.correo
    });

  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error al confirmar cambio' });
  }
};