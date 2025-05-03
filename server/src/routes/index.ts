import { Router } from "express";
import { login, signup } from "../controllers";
import debugRouter from "./debug.routes";
import { config } from "../config";

const router = Router();

// Auth routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);

// Mount debug routes only in development
if (config.server.isDevelopment) {
  router.use("/debug", debugRouter);
}

export default router;
