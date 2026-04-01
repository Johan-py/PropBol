import express from 'express'
import cors from 'cors'
import { BannersController } from './modules/banners/banners.controller.js'
import locationSearchHandler from '../api/locations/search.js'
import { registerController, loginController } from './modules/auth/auth.controller.js'
import router from './modules/publicacion/publicacion.routes.js' //sig-dev

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  })
)

app.use(express.json())

const bannersController = new BannersController()

app.post('/api/users', (req, res) => {
  const user = req.body

  res.json({
    message: 'User created',
    user
  })
})
//mis apis s-d
app.use('/api', router)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
