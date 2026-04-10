// 1. IMPORTS DE LIBRERÍAS (Standard & Third Party)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from "path";
import 'dotenv/config';
import type { Request, Response } from "express";

// 2. IMPORTS DE RUTAS Y HANDLERS
import publicacionesRouter from './modules/publicaciones/publicaciones.router.js';
import publicacionRoutes from './modules/publicacion/publicacion.routes.js';
import multimediaRoutes from './modules/multimedia/multimedia.routes.js';
import registroPublicacionRouter from './modules/registro-publicacion/publicacion.routes.js';
import locationSearchHandler from "./api/locations/search.js";
import correoverificacionRoutes from "./modules/perfil/correoverificacion.routes.js";
import perfilRoutes from "./modules/perfil/perfil.routes.js";
import authRoutes from "./routes/auth.routes.js";
import publicacionesLegacyRoutes from "./routes/publicaciones.js";

// 3. IMPORTS DE CONTROLADORES
import { propertiesController } from "./modules/properties/properties.controller.js";
import {
  archiveNotificationController,
  createNotificationController,
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller.js';

import {
  registerController,
  loginController,
  logoutController,
  verifyRegisterCodeController,
  getMeController
} from './modules/auth/auth.controller.js';

import {
  googleCallbackController,
  StratGoogleLoginController
} from './modules/auth/google/google.controller.js';

import { BannersController } from './modules/banners/banners.controller.js';
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller.js';

// 4. UTILS, MIDDLEWARES Y EVENTOS
import { verifyJwtToken } from './utils/jwt.js';
import { findActiveSessionByToken } from './modules/auth/auth.repository.js';
import { 
  subscribeToNotificationEvents, 
  type NotificationRealtimeEvent 
} from './modules/notificaciones/notificaciones.events.js';
import { requireAuth } from './middleware/auth.middleware.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { verifyNotificationEmailTransport } from "./modules/email/notification-email.service.js";

// 5. CONFIGURACIÓN DE LA APLICACIÓN
const app = express();
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://prop-bol-cicd.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

// 6. MIDDLEWARES GLOBALES
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy: Origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

app.use('/uploads', express.static(path.resolve('uploads')));

// 7. DEFINICIÓN DE RUTAS

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// --- Auth (Moderno) ---
app.post('/api/auth/register', registerController);
app.post('/api/auth/login', loginController);
app.post('/api/auth/logout', logoutController);
app.post('/api/auth/verify-register', verifyRegisterCodeController);
app.get('/api/auth/me', getMeController);
app.get('/api/auth/google/login', StratGoogleLoginController);
app.get('/api/auth/google/callback', googleCallbackController);

// --- Publicaciones (Tus módulos HU4) ---
app.use('/api/publicaciones', publicacionesRouter); 
app.use('/api/publicaciones-detalle', publicacionRoutes);
app.use('/api/multimedia', multimediaRoutes);
app.use('/api/registro', registroPublicacionRouter);

// --- Perfil y Usuarios ---
app.use('/api/perfil', correoverificacionRoutes);
app.use('/api/perfil/usuario', perfilRoutes);

// --- Notificaciones (REST) ---
app.post('/notificaciones', requireAuth, createNotificationController);
app.get('/notificaciones', requireAuth, getNotificationsController);
app.get('/notificaciones/unread-count', requireAuth, getUnreadCountController);
app.patch('/notificaciones/:id/read', requireAuth, markNotificationAsReadController);
app.patch('/notificaciones/read-all', requireAuth, markAllNotificationsAsReadController);
app.delete('/notificaciones/:id', requireAuth, deleteNotificationController);
app.patch('/notificaciones/:id/archivar', requireAuth, archiveNotificationController);

// --- Notificaciones (Real-time SSE) ---
app.get('/notificaciones/stream', async (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    verifyJwtToken(token);
    const session = await findActiveSessionByToken(token);
    if (!session) return res.status(401).json({ message: 'Sesión inválida' });

    const usuarioId = session.usuario.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const sendEvent = (payload: NotificationRealtimeEvent) => {
      const eventName = payload.type === 'connected' ? 'connected' : 'notifications-updated';
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    sendEvent({ type: 'connected', userId: usuarioId, timestamp: new Date().toISOString() });
    const unsubscribe = subscribeToNotificationEvents(usuarioId, sendEvent);

    const heartbeat = setInterval(() => {
      res.write(`event: ping\ndata: {"ok":true}\n\n`);
    }, 25000);

    req.on('close', () => { clearInterval(heartbeat); unsubscribe(); res.end(); });
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

// --- Banners, Filters & Properties ---
const bannersController = new BannersController();
const filtersController = new FiltersHomepageController();

app.get('/api/filters', (req, res) => filtersController.getFilters(req, res));
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res));
app.get('/api/properties/search', propertiesController.search);
app.get('/api/inmuebles', propertiesController.getAll);
app.get('/api/properties/inmuebles', propertiesController.getAll);

// --- Locations ---
app.get('/api/locations/search', async (req: Request, res: Response) => {
  await locationSearchHandler(req as any, res as any);
});

// --- Rutas Legacy (Mantener al final) ---
app.use('/api/auth-legacy', authRoutes);
app.use('/api/publicaciones-legacy', publicacionesLegacyRoutes);
app.get('/api/users/:id/publicaciones/free', authMiddleware, (_req, res) => {
  res.json({ restantes: 2 });
});

// 8. LÓGICA DE INICIO Y EXPORTACIÓN

// Desactivamos temporalmente el email en desarrollo para evitar errores de cierre si no hay credenciales
if (process.env.NODE_ENV !== 'production') {
  verifyNotificationEmailTransport()
    .then(() => console.log('✅ Email ready'))
    .catch((err) => console.error('❌ Email config error:', err.message));
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;