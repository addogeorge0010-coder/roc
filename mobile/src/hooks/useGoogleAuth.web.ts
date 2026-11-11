import * as Google from "expo-auth-session/providers/google";
import { useCallback, useMemo } from "react";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

const FALLBACK_CLIENT_ID = "unconfigured.apps.googleusercontent.com";

export function useGoogleAuth() {
  const config = useMemo(
    () => ({
      webClientId: webClientId ?? FALLBACK_CLIENT_ID,
      scopes: ["openid", "email", "profile"],
    }),
    [],
  );

  const [, , promptAsync] = Google.useIdTokenAuthRequest(config);

  const signIn = useCallback(async () => {
    const result = await promptAsync();

    if (result.type !== "success") {
      return null;
    }

    return result.params.id_token ?? null;
  }, [promptAsync]);

  const unavailableReason = webClientId
    ? null
    : "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to enable Google sign-in.";

  return { signIn, unavailableReason };
}
