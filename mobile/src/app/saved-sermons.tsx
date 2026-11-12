import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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
import { formatDate } from "@/lib/format";
import type { SermonRecord } from "@/types";

export default function SavedSermonsScreen() {
  const [sermons, setSermons] = useState<SermonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSermons = useCallback(async () => {
    try {
      setError(null);
      const data = await apiRequest<SermonRecord[]>("/api/sermons/saved");
      setSermons(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load your saved messages.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSermons();
    }, [loadSermons]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSermons();
    setRefreshing(false);
  };

  const handleRemove = (sermon: SermonRecord) => {
    Alert.alert(
      "Remove saved message",
      `Remove "${sermon.title}" from your saved messages?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingId(sermon.id);

            try {
              await apiRequest(`/api/sermons/${sermon.id}/save`, {
                method: "DELETE",
              });
              setSermons((current) =>
                current.filter((item) => item.id !== sermon.id),
              );
            } catch (err) {
              Alert.alert(
                "Couldn't remove",
                err instanceof ApiError ? err.message : "Please try again.",
              );
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <FlatList
        data={sermons}
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
            Messages you bookmarked for later. Tap a message to watch it again.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center rounded-2xl border border-slate-100 bg-white p-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open sermon: ${item.title}`}
              onPress={() =>
                router.push({
                  pathname: "/sermon/[id]",
                  params: { id: item.id },
                })
              }
              className="flex-1 flex-row items-center"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                <Ionicons
                  name="play"
                  size={20}
                  color={theme.colors.brand}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className="text-sm font-semibold text-slate-900"
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  {formatDate(item.datePreached)}
                </Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.title} from saved messages`}
              accessibilityState={{ disabled: removingId === item.id }}
              disabled={removingId === item.id}
              onPress={() => handleRemove(item)}
              className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-slate-100"
            >
              {removingId === item.id ? (
                <ActivityIndicator size="small" color={theme.colors.muted} />
              ) : (
                <Ionicons
                  name="bookmark"
                  size={18}
                  color={theme.colors.brand}
                />
              )}
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={theme.colors.brand} />
              <Text className="mt-3 text-sm text-slate-500">
                Loading saved messages...
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
                  void loadSermons();
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
                name="bookmark-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-base font-semibold text-slate-800">
                No saved messages yet
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                Open a sermon and tap Save to keep it here.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Browse sermons"
                onPress={() => router.push("/media")}
                className="mt-4 rounded-full bg-brand-600 px-5 py-2.5"
              >
                <Text className="text-sm font-semibold text-white">
                  Browse sermons
                </Text>
              </Pressable>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
