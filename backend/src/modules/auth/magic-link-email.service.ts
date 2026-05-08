import { env } from "../../config/env.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type MagicLinkEmailParams = {
  emailDestino: string;
  magicLink: string;
  nombreUsuario?: string;
  minutosExpiracion: number;
};

type EmailSendResult = {
  success: boolean;
  messageId?: string;
  error?: unknown;
};

export const sendMagicLinkEmail = async ({
  emailDestino,
  magicLink,
  nombreUsuario,
  minutosExpiracion,
}: MagicLinkEmailParams): Promise<EmailSendResult> => {
  const saludo = nombreUsuario ? `Hola ${nombreUsuario},` : "Hola,";
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error("❌ BREVO_API_KEY no está configurado");
    return {
      success: false,
      error: "BREVO_API_KEY no está configurado",
    };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "PropBol",
          email: env.EMAIL_USER,
        },
        to: [
          {
            email: emailDestino,
          },
        ],
        subject: "Tu link mágico de acceso - PropBol",
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
            </head>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden;">
                <div style="background: #f97316; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                    Acceso sin contraseña
                  </h1>
                </div>

                <div style="padding: 30px;">
                  <p style="font-size: 16px; color: #333333;">
                    ${saludo}
                  </p>

                  <p style="font-size: 16px; color: #333333;">
                    Solicitaste ingresar a PropBol usando un link mágico.
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${magicLink}"
                      style="background: #f97316; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                      Ingresar a PropBol
                    </a>
                  </div>

                  <p style="font-size: 14px; color: #666666;">
                    Este enlace expirará en <strong style="color: #f97316;">${minutosExpiracion} minutos</strong>
                    y solo podrá usarse una vez.
                  </p>

                  <div style="background: #fffbeb; border-left: 4px solid #f97316; padding: 12px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 13px; color: #78350f;">
                      Si no solicitaste este acceso, ignora este mensaje.
                    </p>
                  </div>
                </div>

                <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                    Mensaje automático, por favor no responder.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        textContent: `${saludo}

Solicitaste ingresar a PropBol usando un link mágico.

Ingresa con este enlace:
${magicLink}

Este enlace expirará en ${minutosExpiracion} minutos y solo podrá usarse una vez.

Si no solicitaste este acceso, ignora este mensaje.`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      console.error("❌ Error al enviar Magic Link:", errorData);

      return {
        success: false,
        error: errorData,
      };
    }

    const data = (await response.json()) as { messageId?: string };

    console.log(
      `✅ Magic Link enviado a ${emailDestino} - ID: ${data.messageId}`,
    );

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("❌ Error al enviar Magic Link:", error);

    return {
      success: false,
      error,
    };
  }
};
