import { Router } from "express";
import {
  createSermon,
  getSermon,
  listSavedSermons,
  listSermons,
  saveSermon,
  unsaveSermon,
} from "../controllers/sermonController.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
} from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import { createSermonSchema } from "../validators/sermon.validators.js";

export const sermonRouter = Router();

sermonRouter.get("/saved", authMiddleware, listSavedSermons);
sermonRouter.get("/", optionalAuthMiddleware, listSermons);
sermonRouter.get("/:id", optionalAuthMiddleware, getSermon);
sermonRouter.post("/:id/save", authMiddleware, saveSermon);
sermonRouter.delete("/:id/save", authMiddleware, unsaveSermon);
sermonRouter.post(
  "/",
  authMiddleware,
  requireAdmin,
  validateBody(createSermonSchema),
  createSermon,
);
