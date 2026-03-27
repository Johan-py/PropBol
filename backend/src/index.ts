import 'dotenv/config'                  // ← carga el .env PRIMERO
import express from 'express'
import { prisma } from './lib/prisma.js'

const app = express()
app.use(express.json())

// ✅ ENDPOINT DE PRUEBA
app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})

// ✅ ENDPOINT para verificar la conexión con la BD
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected ✅' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected ❌', error: String(error) })
  }
})

const PORT = process.env.PORT ?? 5000

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)

  // Verifica la conexión al arrancar
  try {
    await prisma.$connect()
    console.log('✅ Base de datos conectada correctamente')
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err)
  }
})
