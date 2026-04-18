import express from 'express'
import cors from 'cors'
import { registerController, loginController } from '../../modules/auth/auth.controller.js'
import perfilRoutes from '../../modules/perfil/perfil.routes.js'

const app = express()

app.use(express.json())
app.use(cors())

app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)
app.use('/api/perfil', perfilRoutes)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
