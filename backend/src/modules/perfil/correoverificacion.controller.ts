// correoverificacion.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.client.js";
import { 
  enviarCodigoCambioEmail, 
  enviarNotificacionCambioPassword 
} from "../../lib/email.service.js";
import { invalidateOtherUserSessions } from "../auth/auth.repository.js";

interface AuthRequest extends Request {
  usuario?: {
    id: number;
    nombre?: string;
  };
}
const MAX_CAMBIOS_VALIDOS_EN_VENTANA = 5;
const MINUTOS_VENTANA_CAMBIOS_VALIDOS = 5;
const MINUTOS_BLOQUEO_CAMBIOS_FRECUENTES = 10;

export const cambiarPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;
    const usuarioId = req.usuario?.id;
    const authHeader = req.headers.authorization;
    const currentToken = authHeader && authHeader.split(" ")[1];

    if (!usuarioId || !currentToken) {
      return res.status(401).json({ ok: false, msg: "No autorizado" });
    }

    if (!passwordActual || !nuevaPassword) {
      return res.status(400).json({ ok: false, msg: "Datos incompletos" });
    }

    const usuario = await prisma.usuario.findUnique({
  where: { id: usuarioId },
});

if (!usuario) {
  return res.status(404).json({
    ok: false,
    msg: "Usuario no encontrado",
  });
}

const ahora = new Date();

if (
  usuario.bloqueo_cambio_password_hasta &&
  ahora >= usuario.bloqueo_cambio_password_hasta
) {
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      intentos_fallidos_cambio_password: 0,
      bloqueo_cambio_password_hasta: null,
    },
  });

  usuario.intentos_fallidos_cambio_password = 0;
  usuario.bloqueo_cambio_password_hasta = null;
}

if (
  usuario.bloqueo_cambio_password_hasta &&
  ahora < usuario.bloqueo_cambio_password_hasta
) {
  return res.status(423).json({
    ok: false,
    bloqueado: true,
    bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
    intentosFallidos: 5,
    msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
  });
}

if (usuario.intentos_fallidos_cambio_password >= 5) {
  return res.status(423).json({
    ok: false,
    bloqueado: true,
    bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
    intentosFallidos: 5,
    msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
  });
}

const passwordIncorrecta = usuario.password !== passwordActual;

if (passwordIncorrecta) {
  const nuevosIntentos = Math.min(
    usuario.intentos_fallidos_cambio_password + 1,
    5
  );

  if (nuevosIntentos >= 5) {
    const bloqueoHasta = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        intentos_fallidos_cambio_password: 5,
        bloqueo_cambio_password_hasta: bloqueoHasta,
      },
    });

    return res.status(423).json({
      ok: false,
      bloqueado: true,
      bloqueoHasta,
      intentosFallidos: 5,
      msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
    });
  }

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      intentos_fallidos_cambio_password: nuevosIntentos,
      bloqueo_cambio_password_hasta: null,
    },
  });

  return res.status(401).json({
    ok: false,
    bloqueado: false,
    intentosFallidos: nuevosIntentos,
    intentosRestantes: 5 - nuevosIntentos,
    msg: `La contraseña actual es incorrecta. Intento ${nuevosIntentos} de 5.`,
  });
}

    const haceCincoMinutos = new Date(
  ahora.getTime() - MINUTOS_VENTANA_CAMBIOS_VALIDOS * 60 * 1000
);

const cambiosValidosRecientes = await prisma.historial_password.count({
  where: {
    usuarioId,
    creadoEn: {
      gte: haceCincoMinutos,
    },
  },
});

if (cambiosValidosRecientes >= MAX_CAMBIOS_VALIDOS_EN_VENTANA) {
  const bloqueoHasta = new Date(
    ahora.getTime() + MINUTOS_BLOQUEO_CAMBIOS_FRECUENTES * 60 * 1000
  );

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      bloqueo_cambio_password_hasta: bloqueoHasta,
    },
  });

  return res.status(423).json({
    ok: false,
    bloqueado: true,
    bloqueoHasta,
    msg: `Has realizado ${MAX_CAMBIOS_VALIDOS_EN_VENTANA} cambios de contraseña en menos de ${MINUTOS_VENTANA_CAMBIOS_VALIDOS} minutos. Intenta nuevamente en ${MINUTOS_BLOQUEO_CAMBIOS_FRECUENTES} minutos.`,
  });
}

const historialUltimas = await prisma.historial_password.findMany({
  where: { usuarioId },
  orderBy: { creadoEn: "desc" },
  take: 3,
});

const esReutilizada = historialUltimas.some(
  (h) => h.passwordHash === nuevaPassword
);

if (esReutilizada) {
  return res.status(400).json({
    ok: false,
    msg: "No puedes usar ninguna de tus últimas 3 contraseñas anteriores.",
  });
}

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizacion = await tx.usuario.updateMany({
        where: {
          id: usuarioId,
          password_actualizado_en: usuario.password_actualizado_en,
        },
        data: {
          password: nuevaPassword,
          intentos_fallidos_cambio_password: 0,
          bloqueo_cambio_password_hasta: null,
          password_actualizado_en: ahora,
        },
      });

      if (actualizacion.count === 0) {
        return { conflicto: true as const };
      }

      await tx.historial_password.create({
        data: {
          usuarioId,
          passwordHash: nuevaPassword,
          creadoEn: ahora,
        },
      });

      return { conflicto: false as const };
    });

if (resultado.conflicto) {
  return res.status(409).json({
    ok: false,
    msg: "La contraseña ya fue modificada desde otra sesión. Recarga la página e intenta nuevamente.",
  });
}

    try {
      await invalidateOtherUserSessions(usuarioId, currentToken);
    } catch (sessionError) {
      console.error("Error no crítico al invalidar otras sesiones:", sessionError);
    }

    try {
      await enviarNotificacionCambioPassword({
        emailDestino: usuario.correo,
        nombreUsuario: usuario.nombre,
      });
    } catch (emailError) {
      console.error("Error no crítico al enviar notificación de cambio de password:", emailError);
    }

    return res.json({
      ok: true,
      msg: "Contraseña actualizada correctamente",
    });
  } catch (error: any) {
    console.error("Error en cambiarPassword:", error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        ok: false,
        msg: "Error de duplicidad en la base de datos.",
      });
    }

    const errorMsg = error instanceof Error ? error.message : "Error inesperado en el servidor";

    return res.status(500).json({
      ok: false,
      msg: errorMsg.includes("Prisma") 
        ? "Error de conexión con la base de datos" 
        : "No se pudo completar el cambio de contraseña. Intenta de nuevo.",
    });
  }
};

export const verificarPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { passwordActual } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No hay token válido" });
    }

    if (!passwordActual) {
      return res.status(400).json({ ok: false, msg: "Password requerido" });
    }

    const usuario = await prisma.usuario.findUnique({
  where: { id: usuarioId },
});

if (!usuario) {
  return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
}

const ahora = new Date();

if (
  usuario.bloqueo_cambio_password_hasta &&
  ahora >= usuario.bloqueo_cambio_password_hasta
) {
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      intentos_fallidos_cambio_password: 0,
      bloqueo_cambio_password_hasta: null,
    },
  });

  usuario.intentos_fallidos_cambio_password = 0;
  usuario.bloqueo_cambio_password_hasta = null;
}

if (
  usuario.bloqueo_cambio_password_hasta &&
  ahora < usuario.bloqueo_cambio_password_hasta
) {
  return res.status(423).json({
    ok: false,
    bloqueado: true,
    bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
    intentosFallidos: 5,
    msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
  });
}

if (usuario.intentos_fallidos_cambio_password >= 5) {
  return res.status(423).json({
    ok: false,
    bloqueado: true,
    bloqueoHasta: usuario.bloqueo_cambio_password_hasta,
    intentosFallidos: 5,
    msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
  });
}

const validPassword = passwordActual === usuario.password;

if (!validPassword) {
  const nuevosIntentos = Math.min(
    usuario.intentos_fallidos_cambio_password + 1,
    5
  );

  if (nuevosIntentos >= 5) {
    const bloqueoHasta = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        intentos_fallidos_cambio_password: 5,
        bloqueo_cambio_password_hasta: bloqueoHasta,
      },
    });

    return res.status(423).json({
      ok: false,
      bloqueado: true,
      bloqueoHasta,
      intentosFallidos: 5,
      msg: "Has superado los 5 intentos fallidos. Intenta más tarde.",
    });
  }

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      intentos_fallidos_cambio_password: nuevosIntentos,
      bloqueo_cambio_password_hasta: null,
    },
  });

  return res.status(401).json({
    ok: false,
    bloqueado: false,
    intentosFallidos: nuevosIntentos,
    intentosRestantes: 5 - nuevosIntentos,
    msg: `Contraseña incorrecta. Intento ${nuevosIntentos} de 5.`,
  });
}

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        intentos_fallidos_cambio_password: 0,
        bloqueo_cambio_password_hasta: null,
      },
    });

    return res.json({ ok: true, msg: "Identidad verificada" });
  } catch (error) {
    console.error("Error en verificarPassword:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al verificar identidad",
    });
  }
};

export const solicitarCambioEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { emailNuevo } = req.body;
    const usuarioId = req.usuario?.id;
    const nombreUsuario = req.usuario?.nombre;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No autorizado" });
    }

    if (!emailNuevo) {
      return res.status(400).json({ ok: false, msg: "Email requerido" });
    }

    const existeEmail = await prisma.usuario.findUnique({
      where: { correo: emailNuevo },
    });

    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya está registrado",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiraEn = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.cambioEmail.create({
      data: {
        token: otp,
        email_nuevo: emailNuevo,
        expira_en: expiraEn,
        usuario_id: usuarioId,
      },
    });

    const emailEnviado = await enviarCodigoCambioEmail({
      emailDestino: emailNuevo,
      codigo: otp,
      nombreUsuario,
    });

    if (!emailEnviado.success) {
      console.error(
        `❌ Error al enviar email a ${emailNuevo}, pero el OTP fue guardado`
      );
    }

    return res.json({
      ok: true,
      msg: "Código enviado al nuevo correo",
    });
  } catch (error) {
    console.error("Error en solicitarCambioEmail:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al solicitar cambio",
    });
  }
};

export const confirmarCambioEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, msg: "No autorizado" });
    }

    if (!otp) {
      return res.status(400).json({ ok: false, msg: "Código requerido" });
    }

    const solicitud = await prisma.cambioEmail.findFirst({
      where: {
        usuario_id: usuarioId,
        completado_en: null,
      },
      orderBy: { creado_en: "desc" },
    });

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        msg: "No hay solicitudes pendientes",
      });
    }

    if (new Date() > solicitud.expira_en) {
      return res.status(410).json({
        ok: false,
        msg: "Código expirado. Solicita un nuevo código",
      });
    }

    if (solicitud.token !== otp) {
      return res.status(400).json({
        ok: false,
        msg: "Código incorrecto",
      });
    }

    const [usuarioActualizado] = await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { correo: solicitud.email_nuevo },
      }),
      prisma.cambioEmail.update({
        where: { id: solicitud.id },
        data: { completado_en: new Date() },
      }),
    ]);

    return res.json({
      ok: true,
      msg: "Correo actualizado exitosamente",
      nuevoCorreo: usuarioActualizado.correo,
    });
  } catch (error) {
    console.error("Error en confirmarCambioEmail:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al confirmar cambio",
    });
  }
};