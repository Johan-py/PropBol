import { Router } from 'express'
import {
  getPublicationMultimediaController,
  registerVideoLinkController
} from './multimedia.controller.js'

const multimediaRoutes = Router()

multimediaRoutes.get('/:publicacionId/multimedia', getPublicationMultimediaController)
multimediaRoutes.post('/:publicacionId/multimedia/video-link', registerVideoLinkController)

export default multimediaRoutes