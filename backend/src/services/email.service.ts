import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

export const enviarCorreo = async (para: string, asunto: string, texto: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: para,
      subject: asunto,
      text: texto
    })
    console.log(`📧 Correo enviado a ${para}`)
  } catch (error) {
    console.error('Error al enviar correo:', error)
  }
}

export const notificarVencimiento = async (email: string, planNombre: string, fechaFin: Date) => {
  const fecha = fechaFin.toLocaleDateString()
  const asunto = '⚠️ Tu suscripción está por vencer'
  const texto = `Hola,\n\nTu suscripción al plan "${planNombre}" vencerá el ${fecha}. Renueva ahora para no perder tus beneficios.\n\n¡Gracias por confiar en PropBol!`
  await enviarCorreo(email, asunto, texto)
}
