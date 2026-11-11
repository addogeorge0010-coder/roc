import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env, neonAuthIssuer } from "../config/env.js";
import { Role } from "../generated/prisma/enums.js";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";

const jwks = createRemoteJWKSet(new URL(env.NEON_AUTH_JWKS_URL));

async function loadUserFromToken(token: string) {
  let payload;

  try {
    ({ payload } = await jwtVerify(token, jwks, {
      issuer: neonAuthIssuer,
      audience: neonAuthIssuer,
    }));
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }

  const neonAuthId = payload.sub;
  const email =
    typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;

  if (!neonAuthId || !email) {
    throw new HttpError(401, "Invalid token payload");
  }

  const name =
    typeof payload.name === "string" && payload.name.trim()
      ? payload.name
      : email.split("@")[0];

  const user = await prisma.user.upsert({
    where: { email },
    update: { neonAuthId },
    create: { neonAuthId, email, name, role: Role.MEMBER },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid Authorization header");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new HttpError(401, "Missing bearer token");
  }

  req.user = await loadUserFromToken(token);
  next();
}

export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    next();
    return;
  }

  try {
    req.user = await loadUserFromToken(token);
  } catch (error) {
    if (!(error instanceof HttpError)) {
      throw error;
    }
  }

  next();
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== Role.ADMIN) {
    throw new HttpError(403, "Admin access required");
  }

  next();
}
