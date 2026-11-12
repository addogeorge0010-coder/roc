import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SettingsRow } from "@/components/SettingsRow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { theme } from "@/constants/theme";
import { adminTools } from "@/data/mock";
import { useAuthStore } from "@/store/authStore";

const adminToolRoutes: Record<string, string> = {
  "admin-announcements": "/create-announcement",
  "admin-sermons": "/create-sermon",
  "admin-moderation": "/admin/moderation",
  "admin-members": "/admin/members",
  "admin-giving": "/admin/giving",
};

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [showAdminTools, setShowAdminTools] = useState(false);

  const isAdmin = user?.role === "admin";
  const joinedYear = user
    ? new Date(user.joinedAt).getFullYear().toString()
    : "—";

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          maxWidth: 720,
          width: "100%",
          alignSelf: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Account"
          title="Profile"
          subtitle="Manage your account and church settings."
        />

        <View className="mt-4 overflow-hidden rounded-3xl">
          <LinearGradient
            colors={[theme.gradients.hero[0], theme.gradients.hero[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            <View className="flex-row items-center">
              <View className="rounded-full border-2 border-white/30 p-0.5">
                <Avatar
                  name={user?.name ?? "Guest"}
                  uri={user?.avatarUrl}
                  size={64}
                />
              </View>

              <View className="ml-4 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="text-xl font-bold text-white"
                    numberOfLines={1}
                  >
                    {user?.name ?? "Guest"}
                  </Text>
                  {isAdmin ? (
                    <View className="rounded-full bg-white/20 px-2 py-0.5">
                      <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
                        Admin
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  className="mt-1 text-sm text-indigo-100"
                  numberOfLines={1}
                >
                  {user?.email ?? "Not signed in"}
                </Text>
                <Text className="mt-1 text-[11px] text-indigo-200">
                  Member since {joinedYear}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text className="mb-2 mt-6 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Preferences
        </Text>

        <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <SettingsRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Announcements and new sermons"
            onPress={() => router.push("/notifications")}
          />
          <View className="ml-16 h-px bg-slate-100" />
          <SettingsRow
            icon="bookmark-outline"
            title="Saved messages"
            subtitle="Your bookmarked sermons"
            onPress={() => router.push("/saved-sermons")}
          />
          <View className="ml-16 h-px bg-slate-100" />
          <SettingsRow
            icon="help-circle-outline"
            title="Help & support"
            subtitle="Get in touch with the church office"
            onPress={() =>
              Alert.alert(
                "Help & support",
                "Contact the church office at hello@rpc.church.",
              )
            }
          />
          <View className="ml-16 h-px bg-slate-100" />
          <SettingsRow
            icon="information-circle-outline"
            title="About Us"
            subtitle="Version 1.0.0"
            onPress={() =>
              Alert.alert(
                "About Royal Palace Chapel",
                "Royal Palace Chapel Assemblies of God mobile app · MVP build for the Christmas launch.",
              )
            }
          />
        </View>

        {isAdmin ? (
          <>
            <Text className="mb-2 mt-6 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Leadership
            </Text>

            <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
              <SettingsRow
                icon="shield-checkmark-outline"
                title="Admin controls"
                subtitle={
                  showAdminTools
                    ? "Manage the church app"
                    : "Tap to reveal leadership tools"
                }
                showChevron={false}
                right={
                  <Switch
                    value={showAdminTools}
                    onValueChange={setShowAdminTools}
                    trackColor={{ false: "#CBD5E1", true: "#A5B4FC" }}
                    thumbColor={
                      showAdminTools ? theme.colors.brand : "#FFFFFF"
                    }
                    accessibilityLabel="Show admin controls"
                  />
                }
              />

              {showAdminTools ? (
                <View className="border-t border-slate-100 bg-slate-50/70 px-2 py-2">
                  {adminTools.map((tool) => (
                    <Pressable
                      key={tool.id}
                      onPress={() => {
                        const route = adminToolRoutes[tool.id];

                        if (route) {
                          router.push(route);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={tool.title}
                      className="flex-row items-center rounded-xl px-3 py-3"
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? "#F1F5F9" : "transparent",
                      })}
                    >
                      <Ionicons
                        name={tool.icon}
                        size={18}
                        color={theme.colors.brand}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-semibold text-slate-800">
                          {tool.title}
                        </Text>
                        <Text className="mt-0.5 text-xs text-slate-500">
                          {tool.description}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.muted}
                      />
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <PrimaryButton
          label="Log out"
          onPress={handleLogout}
          variant="danger"
          icon="log-out-outline"
          className="mt-8"
        />

        <Text className="mt-6 text-center text-[11px] text-slate-400">
          Royal Palace Chapel Assemblies of God · Made with love for our
          community
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
