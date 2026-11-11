import { Router } from "express";
import {
  createSermon,
  getSermon,
  listSermons,
} from "../controllers/sermonController.js";
import { authMiddleware, requireAdmin } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import { createSermonSchema } from "../validators/sermon.validators.js";

export const sermonRouter = Router();

sermonRouter.get("/", listSermons);
sermonRouter.get("/:id", getSermon);
sermonRouter.post(
  "/",
  authMiddleware,
  requireAdmin,
  validateBody(createSermonSchema),
  createSermon,
);
