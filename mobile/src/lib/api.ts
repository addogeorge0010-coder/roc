import Constants from "expo-constants";

function resolveBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const host = Constants.expoConfig?.hostUri?.split(":")[0];

  if (host) {
    return `http://${host}:4000`;
  }

  return "http://localhost:4000";
}

export const API_URL = resolveBaseUrl();

interface ApiErrorBody {
  error?: string | { message?: string };
  message?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface AuthSession {
  token: string;
  sessionToken: string;
}

interface AuthBridge {
  getSession: () => AuthSession | null;
  onTokenRefreshed: (token: string) => Promise<void> | void;
  onUnauthenticated: () => Promise<void> | void;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  retryOnUnauthorized?: boolean;
}

let authBridge: AuthBridge | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function configureAuthBridge(bridge: AuthBridge): void {
  authBridge = bridge;
}

async function executeRequest(
  path: string,
  method: NonNullable<RequestOptions["method"]>,
  body: unknown,
  token?: string,
) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let data: unknown = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  return { response, data };
}

async function refreshAccessToken(): Promise<string | null> {
  if (!authBridge) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const session = authBridge?.getSession();

    if (!session?.sessionToken) {
      await authBridge?.onUnauthenticated();
      return null;
    }

    try {
      const result = await apiRequest<{ token: string }>("/api/auth/refresh", {
        method: "POST",
        body: { sessionToken: session.sessionToken },
        retryOnUnauthorized: false,
      });

      await authBridge?.onTokenRefreshed(result.token);
      return result.token;
    } catch {
      await authBridge?.onUnauthenticated();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    token,
    retryOnUnauthorized = true,
  }: RequestOptions = {},
): Promise<T> {
  const initialToken = token ?? authBridge?.getSession()?.token;
  let result = await executeRequest(path, method, body, initialToken);

  if (result.response.status === 401 && retryOnUnauthorized && authBridge) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      result = await executeRequest(path, method, body, refreshedToken);
    }
  }

  const data = result.data as T & ApiErrorBody;

  if (!result.response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : (data.error?.message ?? data.message ?? "Something went wrong");

    throw new ApiError(message, result.response.status);
  }

  return data as T;
}
