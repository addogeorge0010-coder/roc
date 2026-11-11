import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { theme } from "@/constants/theme";

const tabIcons = {
  index: { active: "home", inactive: "home-outline" },
  media: { active: "play-circle", inactive: "play-circle-outline" },
  departments: { active: "people", inactive: "people-outline" },
  give: { active: "heart", inactive: "heart-outline" },
  profile: { active: "person-circle", inactive: "person-circle-outline" },
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons =
            tabIcons[route.name as keyof typeof tabIcons] ?? tabIcons.index;

          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={typeof color === "string" ? color : theme.colors.muted}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="media" options={{ title: "Sermons" }} />
      <Tabs.Screen name="departments" options={{ title: "Departments" }} />
      <Tabs.Screen name="give" options={{ title: "Give" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
