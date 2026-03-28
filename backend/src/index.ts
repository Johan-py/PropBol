import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import {
  deleteMultimediaController,
  getPublicationMultimediaController,
  publishPublicationController,
  registerVideoFileController,
  registerVideoLinkController
} from './modules/multimedia/multimedia.controller.js'

const app = express()

app.use(express.json())

const uploadsBaseDir = path.join(process.cwd(), 'uploads')
const uploadsVideosDir = path.join(uploadsBaseDir, 'videos')
fs.mkdirSync(uploadsVideosDir, { recursive: true })

app.use('/uploads', express.static(uploadsBaseDir))

const uploadVideo = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsVideosDir),
    filename: (_req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
      cb(null, safeName)
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExt = ['.mp4', '.mkv', '.avi']
    if (!allowedExt.includes(ext)) {
      return cb(new Error('Formato no permitido. Solo MP4, MKV o AVI'))
    }
    cb(null, true)
  }
})

const isAccepted = (v: any) =>
  v === true || v === 'true' || v === 1 || v === '1' || v === 'on'

// ===== Rutas que ya existían =====
app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})

app.get('/api/publicaciones/:id_publicacion/multimedia', async (req, res) => {
  try {
    const id_publicacion = Number(req.params.id_publicacion)
    const usuario_id = Number(req.query.usuario_id)

    const result = await getPublicationMultimediaController({
      id_publicacion,
      usuario_id
    })

    res.json({
      message: 'Multimedia obtenida correctamente',
      data: result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'
    res.status(400).json({ message })
  }
})

app.post('/api/publicaciones/:id_publicacion/multimedia/video-link', async (req, res) => {
  try {
    const id_publicacion = Number(req.params.id_publicacion)
    const { usuario_id, videoUrl } = req.body

    const result = await registerVideoLinkController({
      id_publicacion,
      usuario_id: Number(usuario_id),
      videoUrl
    })

    res.json({
      message: 'Video registrado correctamente',
      data: result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'
    res.status(400).json({ message })
  }
})

// ===== ✅ Tus 3 tareas =====

// TAREA 6: Publicar inmueble
app.post('/api/publicaciones/:id_publicacion/publicar', async (req, res) => {
  try {
    const id_publicacion = Number(req.params.id_publicacion)
    const { usuario_id, confirmacion_publicacion } = req.body

    const result = await publishPublicationController({
      id_publicacion,
      usuario_id: Number(usuario_id),
      confirmacion_publicacion: isAccepted(confirmacion_publicacion)
    })

    res.json({ message: '¡Inmueble publicado con éxito!', data: result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'

    if (message === 'LIMITE_GRATUITO_ALCANZADO') {
      return res.status(403).json({
        message: 'Límite de publicaciones gratuitas alcanzado',
        requiere_plan: true,
        motivo: 'LIMITE_GRATUITO_ALCANZADO'
      })
    }

    res.status(400).json({ message })
  }
})

// TAREA 5: Eliminar multimedia
app.delete('/api/multimedia/:id_multimedia', async (req, res) => {
  try {
    const id_multimedia = Number(req.params.id_multimedia)
    const usuario_id = Number(req.query.usuario_id ?? req.body?.usuario_id)

    const result = await deleteMultimediaController({ id_multimedia, usuario_id })

    res.json({ message: 'Multimedia eliminado correctamente', data: result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'
    res.status(400).json({ message })
  }
})

// TAREA 4: Subir video archivo
app.post('/api/publicaciones/:id_publicacion/multimedia/videos', (req, res) => {
  uploadVideo.single('video')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message ?? 'Error al subir video' })
    }

    try {
      const id_publicacion = Number(req.params.id_publicacion)
      const usuario_id = Number((req as any).body.usuario_id)

      const file = (req as any).file
      if (!file) throw new Error('Video es obligatorio')

      const formato = path.extname(file.originalname).replace('.', '').toLowerCase()
      const peso_mb = Number((file.size / (1024 * 1024)).toFixed(2))
      const url = `/uploads/videos/${file.filename}`

      const result = await registerVideoFileController({
        id_publicacion,
        usuario_id,
        url,
        formato,
        peso_mb
      })

      res.json({ message: 'Video subido correctamente', data: result })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error interno del servidor'
      res.status(400).json({ message })
    }
  })
})

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})