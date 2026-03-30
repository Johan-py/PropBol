import express from 'express'
import router from './routes/publicacion.routes.js' //sig-dev

const app = express()

app.use(express.json())

// ✅ ENDPOINT
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
