import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import type { Announcement } from "@/types";

export default function AdminModerationScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role === "admin");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await apiRequest<Announcement[]>(
        "/api/announcements?limit=50",
      );
      setAnnouncements(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load the feed for moderation.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      void loadAnnouncements();
    }, [loadAnnouncements]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleDelete = (announcement: Announcement) => {
    Alert.alert(
      "Delete announcement",
      `Delete "${announcement.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(announcement.id);

            try {
              await apiRequest(`/api/announcements/${announcement.id}`, {
                method: "DELETE",
              });
              setAnnouncements((current) =>
                current.filter((item) => item.id !== announcement.id),
              );
            } catch (err) {
              Alert.alert(
                "Couldn't delete",
                err instanceof ApiError ? err.message : "Please try again.",
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        className="flex-1 items-center justify-center bg-slate-50 px-8"
      >
        <Ionicons
          name="lock-closed-outline"
          size={36}
          color={theme.colors.muted}
        />
        <Text className="mt-3 text-base font-semibold text-slate-800">
          Admin access required
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500">
          You do not have permission to moderate the feed.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          maxWidth: 720,
          width: "100%",
          alignSelf: "center",
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.brand}
            colors={[theme.colors.brand]}
          />
        }
        ListHeaderComponent={
          <Text className="mb-4 mt-5 text-sm leading-5 text-slate-500">
            Review church announcements and remove anything inappropriate or
            outdated.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="rounded-2xl border border-slate-100 bg-white p-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-sm font-semibold leading-5 text-slate-900">
                  {item.title}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  {item.author?.name ?? "Church Admin"} ·{" "}
                  {formatRelativeTime(item.createdAt)}
                </Text>
                <Text className="mt-2 text-xs text-slate-500">
                  {item._count?.likes ?? 0} likes ·{" "}
                  {item._count?.comments ?? 0} comments
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.title}`}
                accessibilityState={{ disabled: deletingId === item.id }}
                disabled={deletingId === item.id}
                onPress={() => handleDelete(item)}
                className="h-10 w-10 items-center justify-center rounded-full bg-red-50"
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color={theme.colors.danger} />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={theme.colors.danger}
                  />
                )}
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={theme.colors.brand} />
              <Text className="mt-3 text-sm text-slate-500">
                Loading feed...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center rounded-3xl border border-slate-100 bg-white px-6 py-10">
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
                  void loadAnnouncements();
                }}
                className="mt-4 rounded-full bg-brand-600 px-5 py-2.5"
              >
                <Text className="text-sm font-semibold text-white">
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center rounded-3xl border border-slate-100 bg-white px-6 py-10">
              <Ionicons
                name="shield-checkmark-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-base font-semibold text-slate-800">
                Nothing to moderate
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                The feed is clear.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
