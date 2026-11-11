import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";
import {
  NEON_AUTH_SESSION_COOKIE_NAME,
  createAuthServer,
  serializeSetCookie,
  type CookieOptions,
  type RequestContext,
} from "@neon/auth/server";
import { env } from "../config/env.js";

interface AuthContext extends RequestContext {
  setSessionToken(token: string): void;
  getSessionToken(): string | undefined;
}

function serializeCookies(jar: Map<string, string>): string {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function buildContext(req?: Request, res?: Response): AuthContext {
  const jar = new Map<string, string>();

  const setCookie = (name: string, value: string, options: CookieOptions) => {
    jar.set(name, value);
    if (res) {
      res.append("Set-Cookie", serializeSetCookie({ name, value, ...options }));
    }
  };

  return {
    getCookies: () => {
      const parts: string[] = [];
      if (req?.headers.cookie) {
        parts.push(req.headers.cookie);
      }
      if (jar.size > 0) {
        parts.push(serializeCookies(jar));
      }
      return parts.join("; ");
    },
    setCookie,
    getHeader: (name) => (req ? (req.get(name) ?? null) : null),
    getOrigin: () => req?.get("origin") ?? "http://localhost:8081",
    getFramework: () => "express",
    setSessionToken: (token) =>
      setCookie(NEON_AUTH_SESSION_COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      }),
    getSessionToken: () => {
      const fromJar = jar.get(NEON_AUTH_SESSION_COOKIE_NAME);
      if (fromJar) {
        return fromJar;
      }

      const header = req?.headers.cookie;
      if (!header) {
        return undefined;
      }

      for (const part of header.split(";")) {
        const [name, ...rest] = part.trim().split("=");
        if (name === NEON_AUTH_SESSION_COOKIE_NAME) {
          return rest.join("=");
        }
      }

      return undefined;
    },
  };
}

const storage = new AsyncLocalStorage<AuthContext>();
const memoryContext = buildContext();

export const neonAuth = createAuthServer({
  baseUrl: env.NEON_AUTH_BASE_URL,
  context: () => storage.getStore() ?? memoryContext,
  cookieSecret: env.NEON_AUTH_COOKIE_SECRET,
  sameSite: "lax",
});

export function neonAuthContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  storage.run(buildContext(req, res), next);
}

export function useSessionToken(token: string): void {
  (storage.getStore() ?? memoryContext).setSessionToken(token);
}

export function currentSessionToken(): string | undefined {
  return (storage.getStore() ?? memoryContext).getSessionToken();
}
