import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Configura el transporter con datos sensibles desde variables de entorno
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // ej. smtp.gmail.com
  port: Number(process.env.SMTP_PORT), // ej. 587
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros
  auth: {
    user: process.env.SMTP_USER, // tu correo autenticado
    pass: process.env.SMTP_PASS, // contraseña de aplicación
  },
});

interface DetallesSuscripcion {
  plan: string;
  duracion: string;
  // otros campos que necesites
}

export async function enviarCorreoConfirmacion(
  compradorEmail: string,
  compradorNombre: string,
  detalles: DetallesSuscripcion,
): Promise<void> {
  const mailOptions = {
    from: '"Tu Inmobiliaria" <no-reply@tudominio.com>',
    to: compradorEmail, // destinatario principal
    bcc: process.env.BCC_ADMIN_EMAIL, // copia oculta para administración
    subject: "Confirmación de suscripción",
    html: `
      <h1>¡Gracias por suscribirte, ${compradorNombre}!</h1>
      <p>Has adquirido el plan: <strong>${detalles.plan}</strong></p>
      <p>Duración: ${detalles.duracion}</p>
      <p>Ahora puedes publicar y gestionar tus propiedades.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado: %s", info.messageId);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw new Error("No se pudo enviar el correo de confirmación");
  }
}
