import path from 'path'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import type { Request, Response } from 'express'
<<<<<<< HEAD
import zonaRoutes from "./modules/perfil/zonaUsario.routes.js";
=======
import zonaRoutes from './modules/perfil/zonaUsario.routes.js'
import telemetriaRouter from "./modules/perfil/telemetria.routes.js";
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
// --------------------
// CONTROLLERS
// --------------------
import { propertiesController } from "./modules/properties/properties.controller.js";

import {
  createNotificationController,
  deleteNotificationController,
  getNotificationsController,
  getNotificationByIdController,
  archiveNotificationController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "./modules/notificaciones/notificaciones.controller.js";
import { BannersController } from "./modules/banners/banners.controller.js";
import { FiltersHomepageController } from "./modules/filtershomepage/filtershomepage.controller.js";
import { CityController } from "./modules/city/city.controller.js";
// --------------------
// AUTH
// --------------------
import {
  registerController,
  loginController,
  logoutController,
  verifyRegisterCodeController,
<<<<<<< HEAD
  getMeController,
  forgotPasswordController,
  resetPasswordController
} from './modules/auth/auth.controller.js'
import { requireAuth } from './middleware/auth.middleware.js'
=======
  verify2FAController,
  getMeController,
  activate2FAController,
  deactivate2FAController,
  get2FAStatusController,
  forgotPasswordController,
  resetPasswordController,
} from "./modules/auth/auth.controller.js";
import { requireAuth } from "./middleware/auth.middleware.js";
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

// --------------------
// ROUTES / HANDLERS
// --------------------
<<<<<<< HEAD
import locationSearchHandler from './api/locations/search.js'
import { getZonasController } from './modules/zonas/zonas.controller.js'

import correoverificacionRoutes from './modules/perfil/correoverificacion.routes.js'
import perfilRoutes from './modules/perfil/perfil.routes.js'
=======
import locationSearchHandler from "./api/locations/search.js";
import { getZonasController } from "./modules/zonas/zonas.controller.js";
import correoverificacionRoutes from "./modules/perfil/correoverificacion.routes.js";
import perfilRoutes from "./modules/perfil/perfil.routes.js";
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

import {
  googleCallbackController,
  StratGoogleLoginController,
<<<<<<< HEAD
  StartGoogleRegisterController
} from './modules/auth/google/google.controller.js'
 


import multimediaRoutes from './modules/multimedia/multimedia.routes.js'
import publicacionRoutes from './modules/publicacion/publicacion.routes.js'
import router from './modules/registro-publicacion/publicacion.routes.js'
=======
  StartGoogleRegisterController,
} from "./modules/auth/google/google.controller.js";

import {
  discordCallbackController,
  startDiscordLoginController,
  startDiscordRegisterController
} from './modules/auth/discord/discord.controller.js'

import multimediaRoutes from "./modules/multimedia/multimedia.routes.js";
import publicacionRoutes from "./modules/publicacion/publicacion.routes.js";
import router from "./modules/registro-publicacion/publicacion.routes.js";
import parametrosRoutes from "./modules/parametros-publicacion/parametros.routes.js";

>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
import securityRoutes from "./routes/security.routes.js";
// --------------------
// LEGACY
// --------------------
import authRoutes from "./routes/auth.routes.js";
import publicacionesRoutes from "./routes/publicaciones.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import blogsRoutes from './modules/blogs/blogs.routes.js'
// --------------------
// LEGACY
// --------------------
// Borra la línea 66 y pon esta:
import historialRoutes from './modules/perfil/historial.routes.js'

// --------------------
// SERVICES
// --------------------
<<<<<<< HEAD
import { verifyEmailTransport } from './lib/email.service.js'

// FAVORITES

import favoritesRoutes from "./modules/favorites/favorites.routes.js";
=======
import { verifyEmailTransport } from "./lib/email.service.js";

// FAVORITES
import favoritesRoutes from './modules/favorites/favorites.routes.js'
import telemetriaRoutes from './modules/telemetria/telemetria.routes.js'
import recomendacionesRoutes from './modules/recomendaciones/recomendaciones.routes.js'
import transaccionesRoutes from './modules/transacciones/transacciones.routes.js'
import plansRoutes from './modules/plans/plans.routes.js'
import historialBusquedaRoutes from './modules/perfil/historialBusqueda.routes.js'
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
// --------------------
// SERVER
// --------------------
const app = express();

// --------------------
// MIDDLEWARES
// --------------------
<<<<<<< HEAD
const normalizedFrontendOrigin = env.FRONTEND_URL.replace(/\/$/, '')
const allowedOrigins = [
  normalizedFrontendOrigin,
  'https://prop-bol-cicd.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:2000'

]
=======
const normalizedFrontendOrigin = env.FRONTEND_URL.replace(/\/$/, "");
const allowedOrigins = [
  normalizedFrontendOrigin,
  "https://prop-bol-cicd.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:2000",
];
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

// Middleware CORS global
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
<<<<<<< HEAD
        return callback(null, true)
      }
      return callback(new Error(`CORS policy: Origin not allowed: ${origin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)
=======
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin not allowed: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

// --------------------
// RUTAS LEGACY
// --------------------
<<<<<<< HEAD
app.post("/api/auth/forgot-password", forgotPasswordController);
app.post("/api/auth/reset-password", resetPasswordController);
=======
app.post('/api/auth/forgot-password', forgotPasswordController)
app.post('/api/auth/reset-password', resetPasswordController)
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
app.use('/api/auth-legacy', authRoutes)
app.get('/api/users/:id/publicaciones/free', authMiddleware, (_req, res) => {
  res.json({ restantes: 2 })
})
app.use('/api/publicaciones-legacy', publicacionesRoutes)

// --------------------
// RUTAS PRINCIPALES
// --------------------
app.use("/api/publicaciones", publicacionRoutes);
app.use("/api/publicaciones", multimediaRoutes);
app.use("/api/perfil", correoverificacionRoutes);
app.use("/api/perfil/usuario", perfilRoutes);
app.use("/api/perfil/zonas", zonaRoutes);
app.use("/api", router);
<<<<<<< HEAD
app.use("/api/security", securityRoutes);
app.use("/api/favorites", favoritesRoutes);
// --------------------
// MOCK / TEST
// --------------------
app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})
app.use('/api/perfil/zonas', zonaRoutes);
=======
app.use("/api", parametrosRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/telemetria", telemetriaRoutes);
app.use("/api/recomendaciones", recomendacionesRoutes);
app.use('/api/publicaciones', publicacionRoutes)
app.use('/api/publicaciones', multimediaRoutes)
app.use('/api/perfil', correoverificacionRoutes)
app.use('/api/perfil/usuario', perfilRoutes)
app.use('/api/perfil/zonas', zonaRoutes)
app.use('/api/perfil/historial', historialRoutes)
app.use('/api/perfil/historial-busqueda', historialBusquedaRoutes)
app.use('/api', router)
app.use('/api', parametrosRoutes)
app.use('/api/security', securityRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/telemetria', telemetriaRoutes)
app.use('/api/recomendaciones', recomendacionesRoutes)
app.use('/api/blogs', blogsRoutes)
app.use("/api/telemetria", telemetriaRouter);

app.use('/api/transacciones', transaccionesRoutes)
app.use('/api/planes', plansRoutes)
// --------------------
// MOCK / TEST
// --------------------
app.post("/api/users", (req, res) => {
  const user = req.body;
  res.json({ message: "User created", user });
});
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

// --------------------
// AUTH
// --------------------
app.post("/api/auth/register", registerController);
app.post("/api/auth/login", loginController);
<<<<<<< HEAD
=======
app.post("/api/auth/verify-2fa", verify2FAController);
app.post("/api/auth/activate-2fa", requireAuth, activate2FAController);
app.post("/api/auth/deactivate-2fa", requireAuth, deactivate2FAController);
app.get("/api/auth/2fa-status", requireAuth, get2FAStatusController);
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
app.post("/api/auth/logout", logoutController);
app.post("/api/auth/verify-register", verifyRegisterCodeController);
app.get("/api/auth/me", getMeController);
app.get("/api/auth/google/login", StratGoogleLoginController);
app.get("/api/auth/google/register", StartGoogleRegisterController);
app.get("/api/auth/google/callback", googleCallbackController);
<<<<<<< HEAD
=======
app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)
app.post('/api/auth/logout', logoutController)
app.post('/api/auth/verify-register', verifyRegisterCodeController)
app.get('/api/auth/me', getMeController)
app.get('/api/auth/google/login', StratGoogleLoginController)
app.get('/api/auth/google/register', StartGoogleRegisterController)
app.get('/api/auth/google/callback', googleCallbackController)
app.get('/api/auth/discord/login', startDiscordLoginController)
app.get('/api/auth/discord/register', startDiscordRegisterController)
app.get('/api/auth/discord/callback', discordCallbackController)
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
//comentario

// --------------------
// BANNERS & FILTERS
// --------------------
<<<<<<< HEAD
const bannersController = new BannersController()
const filtersController = new FiltersHomepageController()
=======
const bannersController = new BannersController();
const filtersController = new FiltersHomepageController();

app.get("/api/filters", filtersController.getFilters);
app.get("/api/banners", (req, res) => bannersController.getBanners(req, res));
const cityController = new CityController()
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

app.get('/api/filters', filtersController.getFilters)
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))
app.get('/api/cities', (req, res) => cityController.getFeatured(req, res))

// --------------------
// LOCATIONS
// --------------------
<<<<<<< HEAD
app.get('/api/zonas', getZonasController)

=======
app.get("/api/zonas", getZonasController);

app.get("/api/locations/search", async (req: Request, res: Response) => {
  await locationSearchHandler(req as any, res as any);
});
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
app.get('/api/locations/search', async (req: Request, res: Response) => {
  // @ts-ignore
  await locationSearchHandler(req, res)
})

// --------------------
// HEALTH
// --------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// --------------------
// PROPERTIES
// --------------------
app.get("/api/properties/search", propertiesController.search);
app.get("/api/inmuebles", propertiesController.getAll);
app.get("/api/properties/inmuebles", propertiesController.getAll);

// --------------------
// NOTIFICACIONES
// --------------------
app.post("/notificaciones", requireAuth, createNotificationController);
app.get("/notificaciones", requireAuth, getNotificationsController);
app.get("/notificaciones/unread-count", requireAuth, getUnreadCountController);
app.get("/notificaciones/:id", requireAuth, getNotificationByIdController);
app.patch(
  "/notificaciones/:id/read",
  requireAuth,
  markNotificationAsReadController,
);
app.patch(
  "/notificaciones/read-all",
  requireAuth,
  markAllNotificationsAsReadController,
);
app.delete("/notificaciones/:id", requireAuth, deleteNotificationController);
app.patch(
  "/notificaciones/:id/archivar",
  requireAuth,
  archiveNotificationController,
);

// --------------------
// PUBLICACIONES MOCK
// --------------------
app.post("/api/publicaciones", (req, res) => {
  const nuevaPublicacion = req.body;
  res.json({ message: "Publicación creada", publicacion: nuevaPublicacion });
});

// --------------------
// LEVANTAR SERVIDOR
// --------------------
<<<<<<< HEAD
const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)

  try {
    await verifyEmailTransport()
    console.log('✅ Servicio de email de registro listo')
  } catch (error) {
    console.error('❌ Error en configuración de email de registro:', error)
  }
})

export default app
=======
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  try {
    await verifyEmailTransport();
    console.log("✅ Servicio de email de registro listo");
  } catch (error) {
    console.error("❌ Error en configuración de email de registro:", error);
  }
});

export default app;
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
