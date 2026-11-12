import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import { parseLimit } from "../utils/query.js";
import { isUuid } from "../utils/uuid.js";
import { sendPushNotification } from "../services/push.js";
import type {
  CreateAnnouncementInput,
  CreateCommentInput,
} from "../validators/announcement.validators.js";

const ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000000";

function buildAnnouncementInclude(userId?: string) {
  return {
    author: {
      select: {
        id: true,
        name: true,
      },
    },
    department: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    likes: {
      where: {
        userId: userId ?? ANONYMOUS_USER_ID,
      },
      select: {
        id: true,
      },
      take: 1,
    },
  } as const;
}

function withLiked<T extends { likes: { id: string }[] }>(record: T) {
  const { likes, ...rest } = record;

  return {
    ...rest,
    isLiked: likes.length > 0,
  };
}

function requireAnnouncementId(value: unknown): string {
  if (!isUuid(value)) {
    throw new HttpError(404, "Announcement not found");
  }

  return value;
}

export async function listAnnouncements(
  req: Request,
  res: Response,
): Promise<void> {
  const limit = parseLimit(req.query.limit, 20, 50);
  const rawDepartmentId = req.query.departmentId;

  let departmentId: string | undefined;

  if (rawDepartmentId !== undefined) {
    if (!isUuid(rawDepartmentId)) {
      throw new HttpError(400, "Invalid departmentId");
    }

    departmentId = rawDepartmentId;
  }

  const announcements = await prisma.announcement.findMany({
    take: limit,
    where: departmentId ? { departmentId } : undefined,
    orderBy: { createdAt: "desc" },
    include: buildAnnouncementInclude(req.user?.id),
  });

  res.json(announcements.map(withLiked));
}

export async function getAnnouncement(
  req: Request,
  res: Response,
): Promise<void> {
  const id = requireAnnouncementId(req.params.id);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: buildAnnouncementInclude(req.user?.id),
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }

  res.json(withLiked(announcement));
}

export async function createAnnouncement(
  req: Request,
  res: Response,
): Promise<void> {
  const author = req.user;

  if (!author) {
    throw new HttpError(401, "Authentication required");
  }

  const { title, content, departmentId } =
    req.body as CreateAnnouncementInput;

  if (departmentId) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true },
    });

    if (!department) {
      throw new HttpError(404, "Department not found");
    }
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      authorId: author.id,
      departmentId: departmentId ?? null,
    },
    include: buildAnnouncementInclude(author.id),
  });

  void sendPushNotification({
    title: "New announcement",
    body: announcement.title,
    url: `/announcement/${announcement.id}`,
    preference: "notifyAnnouncements",
  }).catch(() => undefined);

  res.status(201).json(withLiked(announcement));
}

export async function deleteAnnouncement(
  req: Request,
  res: Response,
): Promise<void> {
  const id = requireAnnouncementId(req.params.id);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }

  await prisma.announcement.delete({ where: { id } });

  res.status(204).send();
}

export async function deleteAnnouncementComment(
  req: Request,
  res: Response,
): Promise<void> {
  const announcementId = requireAnnouncementId(req.params.id);
  const commentId = req.params.commentId;

  if (!isUuid(commentId)) {
    throw new HttpError(404, "Comment not found");
  }

  const comment = await prisma.announcementComment.findFirst({
    where: {
      id: commentId,
      announcementId,
    },
    select: { id: true },
  });

  if (!comment) {
    throw new HttpError(404, "Comment not found");
  }

  await prisma.announcementComment.delete({ where: { id: commentId } });

  res.status(204).send();
}

export async function toggleAnnouncementLike(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user;

  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  const id = requireAnnouncementId(req.params.id);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }

  const existing = await prisma.announcementLike.findUnique({
    where: {
      userId_announcementId: {
        userId: user.id,
        announcementId: id,
      },
    },
  });

  if (existing) {
    await prisma.announcementLike.delete({
      where: {
        userId_announcementId: {
          userId: user.id,
          announcementId: id,
        },
      },
    });
  } else {
    await prisma.announcementLike.create({
      data: {
        userId: user.id,
        announcementId: id,
      },
    });
  }

  const likes = await prisma.announcementLike.count({
    where: { announcementId: id },
  });

  res.json({
    liked: !existing,
    likes,
  });
}

export async function listAnnouncementComments(
  req: Request,
  res: Response,
): Promise<void> {
  const id = requireAnnouncementId(req.params.id);
  const limit = parseLimit(req.query.limit, 50, 100);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }

  const comments = await prisma.announcementComment.findMany({
    where: { announcementId: id },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(comments);
}

export async function createAnnouncementComment(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user;

  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  const id = requireAnnouncementId(req.params.id);
  const { content } = req.body as CreateCommentInput;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }

  const comment = await prisma.announcementComment.create({
    data: {
      content,
      userId: user.id,
      announcementId: id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json(comment);
}
