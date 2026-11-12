import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import type { CreateSermonInput } from "../validators/sermon.validators.js";
import { parseOptionalLimit } from "../utils/query.js";
import { isUuid } from "../utils/uuid.js";
import { sendPushNotification } from "../services/push.js";

function requireSermonId(value: unknown): string {
  if (!isUuid(value)) {
    throw new HttpError(404, "Sermon not found");
  }

  return value;
}

function requireUser(req: Request) {
  if (!req.user) {
    throw new HttpError(401, "Authentication required");
  }

  return req.user;
}

function withSaved<T extends { saves: { id: string }[] }>(record: T) {
  const { saves, ...sermon } = record;

  return {
    ...sermon,
    isSaved: saves.length > 0,
  };
}

export async function listSermons(
  req: Request,
  res: Response,
): Promise<void> {
  const limit = parseOptionalLimit(req.query.limit);
  const userId = req.user?.id;

  const sermons = await prisma.sermon.findMany({
    orderBy: { datePreached: "desc" },
    ...(limit !== undefined ? { take: limit } : {}),
    include: {
      saves: {
        where: { userId: userId ?? "" },
        select: { id: true },
        take: 1,
      },
    },
  });

  res.json(sermons.map(withSaved));
}

export async function listSavedSermons(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);

  const saved = await prisma.sermonSave.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { sermon: true },
  });

  res.json(
    saved.map(({ sermon, createdAt }) => ({
      ...sermon,
      isSaved: true,
      savedAt: createdAt,
    })),
  );
}

export async function getSermon(
  req: Request,
  res: Response,
): Promise<void> {
  const id = requireSermonId(req.params.id);
  const userId = req.user?.id;

  const sermon = await prisma.sermon.findUnique({
    where: { id },
    include: {
      saves: {
        where: { userId: userId ?? "" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!sermon) {
    throw new HttpError(404, "Sermon not found");
  }

  res.json(withSaved(sermon));
}

export async function saveSermon(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const id = requireSermonId(req.params.id);

  const sermon = await prisma.sermon.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!sermon) {
    throw new HttpError(404, "Sermon not found");
  }

  await prisma.sermonSave.upsert({
    where: {
      userId_sermonId: {
        userId: user.id,
        sermonId: id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      sermonId: id,
    },
  });

  res.json({ saved: true });
}

export async function unsaveSermon(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const id = requireSermonId(req.params.id);

  await prisma.sermonSave.deleteMany({
    where: {
      userId: user.id,
      sermonId: id,
    },
  });

  res.json({ saved: false });
}

export async function createSermon(
  req: Request,
  res: Response,
): Promise<void> {
  const { title, youtubeVideoId, datePreached } =
    req.body as CreateSermonInput;

  const sermon = await prisma.sermon.create({
    data: {
      title,
      youtubeVideoId,
      datePreached: datePreached ?? new Date(),
    },
  });

  void sendPushNotification({
    title: "New sermon",
    body: sermon.title,
    url: `/sermon/${sermon.id}`,
    preference: "notifySermons",
  }).catch(() => undefined);

  res.status(201).json(sermon);
}
