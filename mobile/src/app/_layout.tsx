import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (isHydrating) {
    return null;
  }

  return (
    <SafeAreaProvider>
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
        </Stack.Protected>

        <Stack.Protected guard={!user} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
