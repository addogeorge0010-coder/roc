import type { Request, Response } from "express";
import {
  currentSessionToken,
  neonAuth,
  useSessionToken,
} from "../auth/neonAuth.js";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import type {
  GoogleSignInInput,
  LoginInput,
  RegisterInput,
  SessionTokenInput,
} from "../validators/auth.validators.js";

interface AuthResult {
  data: { token?: string; user?: { id: string; name?: string; email?: string } } | null;
  error: { message?: string; status?: number } | null;
}

async function mintAccessToken(sessionToken?: string): Promise<string> {
  if (sessionToken) {
    useSessionToken(sessionToken);
  }

  const result = (await neonAuth.token()) as AuthResult;

  const token = result.data?.token;

  if (!token) {
    throw new HttpError(502, "Unable to issue an access token");
  }

  return token;
}

async function completeAuth(
  res: Response,
  raw: unknown,
  fallback: { email: string; name: string },
): Promise<void> {
  const result = raw as AuthResult;

  if (result.error || !result.data?.user) {
    throw new HttpError(
      result.error?.status ?? 400,
      result.error?.message ?? "Authentication failed",
    );
  }

  const neonAuthId = result.data.user.id;
  const email = (result.data.user.email ?? fallback.email).toLowerCase();
  const name = result.data.user.name?.trim() || fallback.name;

  if (!neonAuthId || !email) {
    throw new HttpError(502, "Neon Auth returned an incomplete response");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { neonAuthId, name },
    create: { neonAuthId, email, name },
  });

  const signedSession = currentSessionToken();
  const sessionToken = signedSession ?? result.data.token;

  const token = await mintAccessToken(signedSession ? undefined : result.data.token);

  if (!sessionToken) {
    throw new HttpError(502, "Neon Auth returned an incomplete response");
  }

  res.json({
    token,
    sessionToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as RegisterInput;

  const result = await neonAuth.signUp.email({ name, email, password });

  res.status(201);
  await completeAuth(res, result, { email, name });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const result = await neonAuth.signIn.email({ email, password });

  await completeAuth(res, result, { email, name: email.split("@")[0] });
}

export async function google(req: Request, res: Response): Promise<void> {
  const { idToken } = req.body as GoogleSignInInput;

  const signInSocial = neonAuth.signIn.social as unknown as (input: {
    provider: "google";
    idToken: { token: string };
  }) => Promise<unknown>;

  const result = await signInSocial({
    provider: "google",
    idToken: { token: idToken },
  });

  await completeAuth(res, result, { email: "", name: "Google User" });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { sessionToken } = req.body as SessionTokenInput;

  const token = await mintAccessToken(sessionToken);

  res.json({ token });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { sessionToken } = req.body as SessionTokenInput;

  useSessionToken(sessionToken);
  await neonAuth.signOut().catch(() => undefined);

  res.json({ success: true });
}

export async function session(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}
