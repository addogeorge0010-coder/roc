import { Router } from "express";
import {
  createAnnouncement,
  createAnnouncementComment,
  getAnnouncement,
  listAnnouncementComments,
  listAnnouncements,
  toggleAnnouncementLike,
} from "../controllers/announcementController.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
} from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import {
  createAnnouncementSchema,
  createCommentSchema,
} from "../validators/announcement.validators.js";

export const announcementRouter = Router();

announcementRouter.get("/", optionalAuthMiddleware, listAnnouncements);
announcementRouter.get("/:id", optionalAuthMiddleware, getAnnouncement);
announcementRouter.get(
  "/:id/comments",
  optionalAuthMiddleware,
  listAnnouncementComments,
);
announcementRouter.post(
  "/:id/like",
  authMiddleware,
  toggleAnnouncementLike,
);
announcementRouter.post(
  "/:id/comments",
  authMiddleware,
  validateBody(createCommentSchema),
  createAnnouncementComment,
);
announcementRouter.post(
  "/",
  authMiddleware,
  requireAdmin,
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);
