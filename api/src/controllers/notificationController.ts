import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import type {
  RegisterPushTokenInput,
  UnregisterPushTokenInput,
  UpdateNotificationPreferencesInput,
} from "../validators/notification.validators.js";

function requireUser(req: Request) {
  if (!req.user) {
    throw new HttpError(401, "Authentication required");
  }

  return req.user;
}

const preferenceSelect = {
  notifyAnnouncements: true,
  notifySermons: true,
} as const;

export async function getNotificationPreferences(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);

  const preferences = await prisma.user.findUnique({
    where: { id: user.id },
    select: preferenceSelect,
  });

  if (!preferences) {
    throw new HttpError(404, "Account not found");
  }

  res.json(preferences);
}

export async function updateNotificationPreferences(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { notifyAnnouncements, notifySermons } =
    req.body as UpdateNotificationPreferencesInput;

  const preferences = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(notifyAnnouncements !== undefined ? { notifyAnnouncements } : {}),
      ...(notifySermons !== undefined ? { notifySermons } : {}),
    },
    select: preferenceSelect,
  });

  res.json(preferences);
}

export async function registerPushToken(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { token, platform } = req.body as RegisterPushTokenInput;

  await prisma.pushToken.upsert({
    where: { token },
    update: {
      userId: user.id,
      platform,
    },
    create: {
      userId: user.id,
      token,
      platform,
    },
  });

  res.status(201).json({ registered: true });
}

export async function unregisterPushToken(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { token } = req.body as UnregisterPushTokenInput;

  await prisma.pushToken.deleteMany({
    where: {
      token,
      userId: user.id,
    },
  });

  res.json({ registered: false });
}
