import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { theme } from "@/constants/theme";
import {
  registerPushNotifications,
  useNotificationObserver,
} from "@/lib/push";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hydrate = useAuthStore((state) => state.hydrate);
  const userId = user?.id;

  useNotificationObserver();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (userId) {
      void registerPushNotifications().catch(() => undefined);
    }
  }, [userId]);

  if (isHydrating) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Protected guard={!!user} redirectTo="/login">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="sermon/[id]"
            options={{
              headerShown: true,
              presentation: "modal",
              title: "Sermon",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="department/[id]"
            options={{
              headerShown: true,
              title: "Department",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="announcement/[id]"
            options={{
              headerShown: true,
              title: "Update",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="create-announcement"
            options={{
              headerShown: true,
              presentation: "modal",
              title: "New announcement",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="create-sermon"
            options={{
              headerShown: true,
              presentation: "modal",
              title: "Add sermon",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="saved-sermons"
            options={{
              headerShown: true,
              title: "Saved messages",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              headerShown: true,
              title: "Notifications",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="announcements"
            options={{
              headerShown: true,
              title: "All updates",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="admin/members"
            options={{
              headerShown: true,
              title: "Member directory",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="admin/giving"
            options={{
              headerShown: true,
              title: "Giving reports",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="admin/moderation"
            options={{
              headerShown: true,
              title: "Moderate the feed",
              headerTintColor: theme.colors.text,
              headerStyle: { backgroundColor: theme.colors.surface },
              headerShadowVisible: false,
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!user} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
