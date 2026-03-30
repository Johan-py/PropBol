import * as dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"

// Importar solo después de que dotenv esté cargado
import { propertiesController } from "./modules/properties_f/properties.controller"

const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" })
})

app.get("/api/properties/search", propertiesController.search)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})