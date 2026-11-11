import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import type { CreateSermonInput } from "../validators/sermon.validators.js";
import { parseOptionalLimit } from "../utils/query.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function listSermons(
  req: Request,
  res: Response,
): Promise<void> {
  const limit = parseOptionalLimit(req.query.limit);

  const sermons = await prisma.sermon.findMany({
    orderBy: { datePreached: "desc" },
    ...(limit !== undefined ? { take: limit } : {}),
  });

  res.json(sermons);
}

export async function getSermon(
  req: Request,
  res: Response,
): Promise<void> {
  const id = req.params.id;

  if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
    throw new HttpError(404, "Sermon not found");
  }

  const sermon = await prisma.sermon.findUnique({ where: { id } });

  if (!sermon) {
    throw new HttpError(404, "Sermon not found");
  }

  res.json(sermon);
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

  res.status(201).json(sermon);
}
