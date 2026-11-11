import type { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import { isUuid } from "../utils/uuid.js";
import type { CreateDepartmentInput } from "../validators/department.validators.js";

const departmentInclude = {
  _count: {
    select: {
      members: true,
      announcements: true,
    },
  },
} as const;

function requireUser(req: Request) {
  if (!req.user) {
    throw new HttpError(401, "Authentication required");
  }

  return req.user;
}

function requireDepartmentId(value: unknown): string {
  if (!isUuid(value)) {
    throw new HttpError(404, "Department not found");
  }

  return value;
}

export async function listDepartments(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      ...departmentInclude,
      members: {
        where: { id: user.id },
        select: { id: true },
      },
    },
  });

  res.json(
    departments.map(({ members, ...department }) => ({
      ...department,
      isMember: members.length > 0,
    })),
  );
}

export async function getDepartment(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const id = requireDepartmentId(req.params.id);

  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      ...departmentInclude,
      members: {
        where: { id: user.id },
        select: { id: true },
      },
    },
  });

  if (!department) {
    throw new HttpError(404, "Department not found");
  }

  const { members, ...rest } = department;

  res.json({ ...rest, isMember: members.length > 0 });
}

export async function createDepartment(
  req: Request,
  res: Response,
): Promise<void> {
  const { name, description } = req.body as CreateDepartmentInput;

  const department = await prisma.department.create({
    data: {
      name,
      description: description?.trim() ? description : null,
    },
    include: departmentInclude,
  });

  res.status(201).json({ ...department, isMember: false });
}

export async function joinDepartment(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const id = requireDepartmentId(req.params.id);

  const exists = await prisma.department.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!exists) {
    throw new HttpError(404, "Department not found");
  }

  const department = await prisma.department.update({
    where: { id },
    data: {
      members: {
        connect: { id: user.id },
      },
    },
    include: departmentInclude,
  });

  res.json({ ...department, isMember: true });
}

export async function leaveDepartment(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const id = requireDepartmentId(req.params.id);

  const exists = await prisma.department.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!exists) {
    throw new HttpError(404, "Department not found");
  }

  const department = await prisma.department.update({
    where: { id },
    data: {
      members: {
        disconnect: { id: user.id },
      },
    },
    include: departmentInclude,
  });

  res.json({ ...department, isMember: false });
}
