import { env } from "../config/env.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface EnviarCodigoParams {
  emailDestino: string;
  codigo: string;
  nombreUsuario?: string;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: unknown;
}

const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}): Promise<EmailSendResult> => {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.EMAIL_PASSWORD,
      },
      body: JSON.stringify({
        sender: { name: "PropBol", email: env.EMAIL_USER },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error al enviar email:", errorData);
      return { success: false, error: errorData };
    }

    const data = (await response.json()) as { messageId?: string };
    console.log(`✅ Email enviado a ${to} - ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    return { success: false, error };
  }
};

export const verifyEmailTransport = async (): Promise<void> => {
  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    throw new Error("Credenciales de email no configuradas");
  }
  console.log("✅ Servicio de email listo (Brevo API)");
};

export const enviarCodigoCambioEmail = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Código de verificación - Cambio de email",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Verificación de Email</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Has solicitado cambiar el email de tu cuenta. Ingresa el siguiente código:</p>
            <div style="background:#fef3c7;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #fde68a;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#92400e;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#d97706;">5 minutos</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#78350f;">Si no solicitaste este cambio, ignora este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código de verificación es: ${codigo}\n\nExpira en 5 minutos.`,
  });
};

export const enviarCodigoRegistro = async ({
  emailDestino,
  codigo,
  nombreUsuario,
}: EnviarCodigoParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Código de verificación - Registro PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Verifica tu cuenta</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Usa este código para completar tu registro en PropBol:</p>
            <div style="background:#fef3c7;padding:20px;text-align:center;margin:25px 0;border-radius:8px;border:1px solid #fde68a;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#92400e;">${codigo}</span>
            </div>
            <p style="font-size:14px;color:#666;">Este código expirará en <strong style="color:#d97706;">5 minutos</strong>.</p>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Mensaje automático, por favor no responder.</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu código de verificación es: ${codigo}\n\nExpira en 5 minutos.`,
  });
};

export const enviarCorreoRecuperacionPassword = async ({
  emailDestino,
  nombreUsuario,
  resetLink,
  minutosExpiracion
}: {
  emailDestino: string
  nombreUsuario?: string
  resetLink: string
  minutosExpiracion: number
}): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : 'Hola,'

  return sendBrevoEmail({
    to: emailDestino,
    subject: 'Restablece tu contraseña - PropBol',
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Restablecer contraseña</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <div style="text-align:center;margin:25px 0;">
              <a href="${resetLink}" style="background-color:#f59e0b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-size:16px;font-weight:bold;">
                Cambiar mi contraseña
              </a>
            </div>
            <p style="font-size:14px;color:#666;">Este enlace estará disponible durante <strong style="color:#d97706;">${minutosExpiracion} minutos</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#78350f;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">© 2026 PropBol Inmobiliaria · Todos los derechos reservados</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nRestablece tu contraseña desde este enlace: ${resetLink}\n\nExpira en ${minutosExpiracion} minutos.`
  })
}

export const enviarNotificacionCambioPassword = async ({
  emailDestino,
  nombreUsuario,
}: {
  emailDestino: string;
  nombreUsuario?: string;
}): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";
  const fecha = new Date().toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return sendBrevoEmail({
    to: emailDestino,
    subject: "Tu contraseña ha sido cambiada - PropBol",
    htmlContent: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
          <div style="background:#d97706;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Seguridad de la cuenta</h1>
          </div>
          <div style="padding:30px;">
            <p style="font-size:16px;color:#333;">${saludo}</p>
            <p style="font-size:16px;color:#333;">Te informamos que la contraseña de tu cuenta en <strong>PropBol</strong> ha sido actualizada correctamente.</p>
            <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #e5e7eb;">
              <p style="margin:0;font-size:14px;color:#666;"><strong>Fecha del cambio:</strong> ${fecha}</p>
            </div>
            <p style="font-size:14px;color:#666;">Si fuiste tú quien realizó este cambio, puedes ignorar este mensaje.</p>
            <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:12px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#991b1b;"><strong>¿No reconoces esta actividad?</strong></p>
              <p style="margin:5px 0 0 0;font-size:13px;color:#b91c1c;">Si no realizaste este cambio, por favor ponte en contacto con nuestro equipo de soporte de inmediato para proteger tu cuenta.</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">© 2026 PropBol Inmobiliaria · Seguridad</p>
          </div>
        </div>
      </body></html>
    `,
    textContent: `${saludo}\n\nTu contraseña ha sido cambiada correctamente el ${fecha}.\n\nSi no realizaste este cambio, contacta con soporte.`,
  });
};
