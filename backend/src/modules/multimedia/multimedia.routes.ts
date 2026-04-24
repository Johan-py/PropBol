import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  getPublicationMultimediaController,
  registerImagesController,
  registerVideoLinkController,
} from "./multimedia.controller.js";

const multimediaRoutes = Router();

const upload = multer({
  dest: "uploads/",
});

multimediaRoutes.get(
  "/:publicacionId/multimedia",
  requireAuth,
  getPublicationMultimediaController,
);

multimediaRoutes.post(
  "/:publicacionId/multimedia/video-link",
  requireAuth,
  registerVideoLinkController,
);

multimediaRoutes.post(
  "/:publicacionId/multimedia/images",
  requireAuth,
  upload.array("images", 5),
  registerImagesController,
);

export default multimediaRoutes;
