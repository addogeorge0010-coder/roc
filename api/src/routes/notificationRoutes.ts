import { Router } from "express";
import {
  getNotificationPreferences,
  registerPushToken,
  unregisterPushToken,
  updateNotificationPreferences,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validate.js";
import {
  registerPushTokenSchema,
  unregisterPushTokenSchema,
  updateNotificationPreferencesSchema,
} from "../validators/notification.validators.js";

export const notificationRouter = Router();

notificationRouter.use(authMiddleware);
notificationRouter.get("/preferences", getNotificationPreferences);
notificationRouter.patch(
  "/preferences",
  validateBody(updateNotificationPreferencesSchema),
  updateNotificationPreferences,
);
notificationRouter.post(
  "/push-token",
  validateBody(registerPushTokenSchema),
  registerPushToken,
);
notificationRouter.delete(
  "/push-token",
  validateBody(unregisterPushTokenSchema),
  unregisterPushToken,
);
