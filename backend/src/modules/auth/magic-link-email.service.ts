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

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export const sendMagicLinkEmail = async ({
  emailDestino,
  magicLink,
  nombreUsuario,
  minutosExpiracion,
}: MagicLinkEmailParams): Promise<EmailSendResult> => {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error("❌ BREVO_API_KEY no está configurado");

    return {
      success: false,
      error: "BREVO_API_KEY no está configurado",
    };
  }

  const safeNombre = nombreUsuario ? escapeHtml(nombreUsuario) : "";
  const safeMagicLink = escapeHtml(magicLink);
  const saludo = safeNombre ? `Hola ${safeNombre},` : "Hola,";

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
        subject: "Ingresa a PropBol con tu link mágico",
        htmlContent: `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Magic Link PropBol</title>
            </head>

            <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: Arial, Helvetica, sans-serif;">
              <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
                Usa este enlace único para ingresar a PropBol sin contraseña.
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 32px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 24px rgba(41, 37, 36, 0.10);">
                      
                      <tr>
                        <td style="background-color: #ff5a00; padding: 28px 24px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; line-height: 1.3;">
                            Acceso sin contraseña
                          </h1>
                          <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; line-height: 1.5;">
                            Ingresa a tu cuenta de PropBol usando un enlace seguro.
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 32px 28px;">
                          <p style="margin: 0 0 18px; color: #292524; font-size: 16px; line-height: 1.6;">
                            ${saludo}
                          </p>

                          <p style="margin: 0 0 18px; color: #44403c; font-size: 15px; line-height: 1.7;">
                            Recibimos una solicitud para iniciar sesión en PropBol mediante un
                            <strong style="color: #292524;">link mágico</strong>. 
                            Haz clic en el botón de abajo para ingresar al sistema.
                          </p>

                          <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${safeMagicLink}"
                                  style="display: inline-block; background-color: #ff5a00; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 6px 14px rgba(255, 90, 0, 0.35);"
                                  Ingresar a PropBol
                                </a>
                              </td>
                            </tr>
                          </table>

                          <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; margin: 24px 0;">
                            <p style="margin: 0; color: #9a3412; font-size: 14px; line-height: 1.6;">
                              Este enlace expirará en 
                              <strong>${minutosExpiracion} minutos</strong> 
                              y solo podrá usarse una vez.
                            </p>
                          </div>

                          <p style="margin: 0 0 10px; color: #57534e; font-size: 13px; line-height: 1.6;">
                            Si el botón no funciona, copia y pega este enlace en tu navegador:
                          </p>

                          <p style="margin: 0; word-break: break-all; color: #ff5a00; font-size: 12px; line-height: 1.6;">
                            ${safeMagicLink}
                          </p>

                          <div style="margin-top: 26px; padding-top: 20px; border-top: 1px solid #e7e5e4;">
                            <p style="margin: 0; color: #78716c; font-size: 13px; line-height: 1.6;">
                              Si no solicitaste este acceso, puedes ignorar este correo. 
                              Tu cuenta seguirá protegida.
                            </p>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td style="background-color: #fafaf9; padding: 20px 24px; text-align: center; border-top: 1px solid #e7e5e4;">
                          <p style="margin: 0; color: #a8a29e; font-size: 12px; line-height: 1.5;">
                            PropBol · Mensaje automático, por favor no responder.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        textContent: `${saludo}

Recibimos una solicitud para iniciar sesión en PropBol mediante un link mágico.

Ingresa a PropBol usando este enlace:
${magicLink}

Este enlace expirará en ${minutosExpiracion} minutos y solo podrá usarse una vez.

Si no solicitaste este acceso, ignora este correo. Tu cuenta seguirá protegida.

PropBol · Mensaje automático, por favor no responder.`,
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
