import express from 'express'
import cors from 'cors'
import { BannersController } from './modules/banners/banners.controller.js'
import locationSearchHandler from '../api/locations/search.js'
// Importamos el manejador de popularidad -- BitPro 
import popularidadHandler from '../api/locations/popularidad.js'
import {registerController,loginController,} from "./modules/auth/auth.controller.js";
import * as dotenv from "dotenv"
dotenv.config()

// Importar solo después de que dotenv esté cargado
import { propertiesController } from "./modules/properties_f/properties.controller"

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}))

app.use(cors())
app.use(express.json())

const bannersController = new BannersController()

app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})
app.post("/api/auth/register", registerController);
app.post("/api/auth/login", loginController);

app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))

app.get('/api/locations/search', async (req, res) => {
  await locationSearchHandler(req as any, res as any)
})

// Usamos POST porque así lo definimos en tu Hook del frontend
app.post('/api/locations/popularidad', async (req, res) => {
  await popularidadHandler(req as any, res as any)
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" })
})

app.get("/api/properties/search", propertiesController.search)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})})