import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { registerPushNotifications } from "@/lib/push";
import type { NotificationPreferences } from "@/types";

type PreferenceKey = keyof NotificationPreferences;

const preferenceRows: {
  key: PreferenceKey;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}[] = [
  {
    key: "notifyAnnouncements",
    icon: "megaphone-outline",
    title: "Announcements",
    description: "Church updates, events, and urgent notices",
  },
  {
    key: "notifySermons",
    icon: "videocam-outline",
    title: "New sermons",
    description: "Be notified when a new message is published",
  },
];

export default function NotificationsScreen() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<PreferenceKey | null>(null);
  const [registering, setRegistering] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      setError(null);
      const data = await apiRequest<NotificationPreferences>(
        "/api/notifications/preferences",
      );
      setPreferences(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load notification settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPreferences();
    }, [loadPreferences]),
  );

  const updatePreference = async (key: PreferenceKey, value: boolean) => {
    if (!preferences || savingKey) {
      return;
    }

    const previous = preferences;
    setPreferences({ ...preferences, [key]: value });
    setSavingKey(key);

    try {
      const updated = await apiRequest<NotificationPreferences>(
        "/api/notifications/preferences",
        {
          method: "PATCH",
          body: { [key]: value },
        },
      );
      setPreferences(updated);
    } catch (err) {
      setPreferences(previous);
      Alert.alert(
        "Couldn't save",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  const handleEnableDevice = async () => {
    setRegistering(true);

    try {
      const token = await registerPushNotifications();

      if (token) {
        Alert.alert(
          "Notifications enabled",
          "This device is now registered for church updates.",
        );
      } else {
        Alert.alert(
          "Notifications not enabled",
          "Allow notifications for this app in your device settings, then try again.",
        );
      }
    } catch (err) {
      Alert.alert(
        "Couldn't enable notifications",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
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
        <Text className="mb-2 mt-5 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Push notifications
        </Text>

        {loading ? (
          <View className="items-center rounded-2xl border border-slate-100 bg-white py-10">
            <ActivityIndicator color={theme.colors.brand} />
            <Text className="mt-3 text-sm text-slate-500">
              Loading settings...
            </Text>
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl border border-slate-100 bg-white px-6 py-10">
            <Ionicons
              name="cloud-offline-outline"
              size={30}
              color={theme.colors.muted}
            />
            <Text className="mt-3 text-center text-sm leading-5 text-slate-500">
              {error}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try again"
              onPress={() => {
                setLoading(true);
                void loadPreferences();
              }}
              className="mt-4 rounded-full bg-brand-600 px-5 py-2.5"
            >
              <Text className="text-sm font-semibold text-white">Try again</Text>
            </Pressable>
          </View>
        ) : preferences ? (
          <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            {preferenceRows.map((row, index) => (
              <View key={row.key}>
                {index > 0 ? <View className="ml-16 h-px bg-slate-100" /> : null}
                <View className="flex-row items-center px-4 py-3.5">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                    <Ionicons
                      name={row.icon}
                      size={19}
                      color={theme.colors.brand}
                    />
                  </View>
                  <View className="ml-3 flex-1 pr-3">
                    <Text className="text-sm font-semibold text-slate-800">
                      {row.title}
                    </Text>
                    <Text className="mt-0.5 text-xs leading-4 text-slate-500">
                      {row.description}
                    </Text>
                  </View>
                  <Switch
                    value={preferences[row.key]}
                    onValueChange={(value) =>
                      void updatePreference(row.key, value)
                    }
                    disabled={savingKey !== null}
                    trackColor={{ false: "#CBD5E1", true: "#A5B4FC" }}
                    thumbColor={
                      preferences[row.key]
                        ? theme.colors.brand
                        : "#FFFFFF"
                    }
                    accessibilityLabel={`Toggle ${row.title}`}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="phone-portrait-outline"
              size={17}
              color={theme.colors.brand}
            />
            <Text className="text-sm font-semibold text-slate-800">
              This device
            </Text>
          </View>
          <Text className="mt-2 text-xs leading-5 text-slate-500">
            Push notifications are delivered to this phone. If you are not
            receiving them, check that notifications are allowed for the app in
            your device settings.
          </Text>
          <PrimaryButton
            label="Register this device"
            icon="notifications-outline"
            variant="secondary"
            loading={registering}
            onPress={() => void handleEnableDevice()}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
