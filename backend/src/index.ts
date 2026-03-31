import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import 'dotenv/config'
import publicacionesRouter from './modules/publicaciones/publicaciones.router.js'

const app = express()

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'PropBol API running' })
})

app.use('/api/publicaciones', publicacionesRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})