import express from "express"
import cors from "cors"
import { propertiesController } from "./modules/properties_f/properties.controller.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/properties/search", propertiesController.search)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})