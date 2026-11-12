import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { apiRequest } from "@/lib/api";

let registeredToken: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Church updates",
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4F46E5",
  });

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    status = requested.status;
  }

  if (status !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;

  registeredToken = token;

  await apiRequest("/api/notifications/push-token", {
    method: "POST",
    body: {
      token,
      platform: Platform.OS,
    },
  });

  return token;
}

export async function unregisterPushNotifications(): Promise<void> {
  const token = registeredToken;

  if (!token) {
    return;
  }

  registeredToken = null;

  await apiRequest("/api/notifications/push-token", {
    method: "DELETE",
    body: { token },
    retryOnUnauthorized: false,
  }).catch(() => undefined);
}

export function useNotificationObserver(): void {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;

      if (typeof url === "string") {
        router.push(url);
        Notifications.clearLastNotificationResponse();
      }
    }

    const response = Notifications.getLastNotificationResponse();

    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription =
      Notifications.addNotificationResponseReceivedListener((event) => {
        redirect(event.notification);
      });

    return () => {
      subscription.remove();
    };
  }, []);
}
