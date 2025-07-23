import { updateURL } from "./../controllers/image.controller";
import { Router } from "express";
import {
  createImage,
  deleteImage,
  getImage,
  getMyImages,
  updateImage,
  login,
  signup,
  deleteUser,
} from "../controllers";

import { requireAuth } from "../middleware";
import debugRouter from "./debug.routes";
import { config } from "../config";

const router = Router();

// Auth routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.delete("/auth/delete", requireAuth, deleteUser);

// Image routes
router.use("/images", requireAuth);
router.post("/images", createImage);
router.get("/images/me", getMyImages);
router.get("/images/:id", getImage);
router.put("/images/:id", updateImage);
router.delete("/images/:id", requireAuth, deleteImage);
router.patch("/images/addURL/:id", requireAuth, updateURL);

// Mount debug routes only in development
if (config.server.isDevelopment) {
  router.use("/debug", debugRouter);
}

export default router;
