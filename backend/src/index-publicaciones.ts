import express from "express"
import publicacionesRoutes from "./modules/publicaciones/publicaciones.routes.js"

const app = express()
app.use(express.json())
app.use("/api", publicacionesRoutes)

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Servidor de publicaciones en http://localhost:${PORT}`)
})
