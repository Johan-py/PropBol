import { Router } from 'express'
import { getAdminTestimonios } from '../testimonios/adminTestimonios.controller.js'

const router = Router()

router.get('/testimonios', getAdminTestimonios)

export default router