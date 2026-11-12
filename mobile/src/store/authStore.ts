import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

import { apiRequest, configureAuthBridge } from "@/lib/api";
import { unregisterPushNotifications } from "@/lib/push";
import type { User, UserRole } from "@/types";

const SESSION_KEY = "rpc.session";

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
}

interface AuthResponse {
  token: string;
  sessionToken: string;
  user: ApiUser;
}

interface StoredSession {
  token: string;
  sessionToken: string;
  user: User;
}

function mapUser(user: ApiUser): User {
  const role: UserRole = user.role === "ADMIN" ? "admin" : "member";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    joinedAt: user.createdAt,
  };
}

async function readStoredSession(): Promise<StoredSession | null> {
  try {
    const raw =
      Platform.OS === "web"
        ? globalThis.localStorage?.getItem(SESSION_KEY)
        : await SecureStore.getItemAsync(SESSION_KEY);

    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

async function persistSession(session: StoredSession | null): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (session) {
        globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        globalThis.localStorage?.removeItem(SESSION_KEY);
      }
      return;
    }

    if (session) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
  } catch {
    // Persistence is best-effort; the in-memory session still works.
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  sessionToken: string | null;
  isHydrating: boolean;
  isSubmitting: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  sessionToken: null,
  isHydrating: true,
  isSubmitting: false,

  hydrate: async () => {
    const stored = await readStoredSession();

    set({
      user: stored?.user ?? null,
      token: stored?.token ?? null,
      sessionToken: stored?.sessionToken ?? null,
      isHydrating: false,
    });
  },

  signIn: async (email, password) => {
    set({ isSubmitting: true });

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
        retryOnUnauthorized: false,
      });

      const user = mapUser(result.user);
      const session = {
        token: result.token,
        sessionToken: result.sessionToken,
        user,
      };

      await persistSession(session);
      set({ ...session, isSubmitting: false });
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  signUp: async (name, email, password) => {
    set({ isSubmitting: true });

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: { name: name.trim(), email: email.trim().toLowerCase(), password },
        retryOnUnauthorized: false,
      });

      const user = mapUser(result.user);
      const session = {
        token: result.token,
        sessionToken: result.sessionToken,
        user,
      };

      await persistSession(session);
      set({ ...session, isSubmitting: false });
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  signInWithGoogle: async (idToken) => {
    set({ isSubmitting: true });

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/google", {
        method: "POST",
        body: { idToken },
        retryOnUnauthorized: false,
      });

      const user = mapUser(result.user);
      const session = {
        token: result.token,
        sessionToken: result.sessionToken,
        user,
      };

      await persistSession(session);
      set({ ...session, isSubmitting: false });
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  signOut: async () => {
    const { sessionToken } = get();

    await unregisterPushNotifications();

    if (sessionToken) {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        body: { sessionToken },
        retryOnUnauthorized: false,
      }).catch(() => undefined);
    }

    await persistSession(null);
    set({ user: null, token: null, sessionToken: null });
  },
}));

configureAuthBridge({
  getSession: () => {
    const { token, sessionToken } = useAuthStore.getState();

    return token && sessionToken ? { token, sessionToken } : null;
  },

  onTokenRefreshed: async (token) => {
    const { user, sessionToken } = useAuthStore.getState();

    if (!user || !sessionToken) {
      return;
    }

    await persistSession({ token, sessionToken, user });
    useAuthStore.setState({ token });
  },

  onUnauthenticated: async () => {
    await persistSession(null);
    useAuthStore.setState({ user: null, token: null, sessionToken: null });
  },
});
