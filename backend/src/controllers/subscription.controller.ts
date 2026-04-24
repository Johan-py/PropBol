import { Request, Response } from "express";
import { enviarCorreoConfirmacion } from "../services/emailService.js";

export const finalizarCompraSuscripcion = async (
  req: Request,
  res: Response,
) => {
  try {
    // 1. Procesar el pago (ej. validar webhook de Stripe o Mercado Pago)
    // 2. Guardar la suscripción en la base de datos
    // const nuevaSuscripcion = await db.crearSuscripcion(...);

    // 3. Datos de prueba (los obtendrías de la BD o del request validado)
    const compradorEmail = "cliente@ejemplo.com";
    const compradorNombre = "Juan Pérez";
    const detalles = {
      plan: "Premium",
      duracion: "1 año",
    };

    // 4. Enviar correo de confirmación (con BCC automático)
    await enviarCorreoConfirmacion(compradorEmail, compradorNombre, detalles);

    res
      .status(200)
      .json({ mensaje: "Suscripción activada. Revisa tu correo." });
  } catch (error) {
    console.error("Error en finalizarCompraSuscripcion:", error);
    res.status(500).json({ error: "Error al procesar la suscripción." });
  }
};
