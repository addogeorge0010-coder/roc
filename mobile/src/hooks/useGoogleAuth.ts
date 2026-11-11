import Constants, { ExecutionEnvironment } from "expo-constants";
import { useCallback } from "react";
import { Platform } from "react-native";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

let googleModule: GoogleSigninModule | null = null;
let isConfigured = false;

function loadGoogleModule(): GoogleSigninModule {
  if (!googleModule) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    googleModule = require("@react-native-google-signin/google-signin") as GoogleSigninModule;
  }

  return googleModule;
}

function ensureConfigured() {
  if (isConfigured) {
    return;
  }

  const { GoogleSignin } = loadGoogleModule();

  GoogleSignin.configure({
    webClientId,
    ...(Platform.OS === "ios" && iosClientId ? { iosClientId } : {}),
    scopes: ["openid", "email", "profile"],
  });

  isConfigured = true;
}

export function useGoogleAuth() {
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const missingClientId =
    Platform.OS === "ios" ? !iosClientId && !webClientId : !webClientId;

  const signIn = useCallback(async () => {
    ensureConfigured();

    const { GoogleSignin, statusCodes } = loadGoogleModule();

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      if (response.type !== "success") {
        return null;
      }

      return response.data.idToken ?? null;
    } catch (error) {
      if ((error as { code?: string }).code === statusCodes.SIGN_IN_CANCELLED) {
        return null;
      }

      throw error;
    }
  }, []);

  let unavailableReason: string | null = null;

  if (isExpoGo) {
    unavailableReason =
      "Google sign-in needs a development build — Expo Go can't use your own OAuth client.";
  } else if (missingClientId) {
    unavailableReason = `Add EXPO_PUBLIC_GOOGLE_${Platform.OS.toUpperCase()}_CLIENT_ID to enable Google sign-in.`;
  }

  return { signIn, unavailableReason };
}
