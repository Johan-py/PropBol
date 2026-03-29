import 'dotenv/config'
import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express();
const prisma = new PrismaClient();

app.use(express.json())

// Endpoint de búsqueda de propiedades
app.get('/api/properties/search', async (req, res) => {

  const { categoria, tipoAccion } = req.query

  const whereClause: any = {}

  if (categoria) {
    const categorias = Array.isArray(categoria) ? categoria : [categoria]
    whereClause.categoria = { in: categorias }
  }

  if (tipoAccion) {
    whereClause.tipoAccion = tipoAccion
  }

  whereClause.estado = 'ACTIVO'

  try {
    const startTime = Date.now()
    const properties = await prisma.inmueble.findMany({
      where: whereClause,
      include: {
        ubicacion: true
      },
      orderBy: {
        fechaPublicacion: 'desc'
      }
    })

    const responseTime = Date.now() - startTime
    console.log(` Búsqueda completada en ${responseTime}ms - ${properties.length} resultados`)
    console.log(` Filtros aplicados:`, { categoria, tipoAccion })

    if (properties.length === 0) {
      return res.json({
        resultados: [],
        mensaje: "No se encontraron propiedades con esos criterios",
        total: 0
      })
    }

    res.json({
      resultados: properties,
      total: properties.length,
      tiempoRespuesta: `${responseTime}ms`
    })

  } catch (error) {
    console.error('Error en búsqueda:', error)
    res.status(500).json({
      error: 'Error al buscar propiedades'
    })
  }
})

app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({
    message: 'User created',
    user
  })
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Endpoint de búsqueda: http://localhost:${PORT}/api/properties/search?categoria=CASA&tipoAccion=VENTA`)
})