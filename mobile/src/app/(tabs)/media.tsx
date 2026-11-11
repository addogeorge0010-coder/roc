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
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { VideoPlayer } from "@/components/VideoPlayer";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import type { SermonRecord } from "@/types";

interface SermonVideoCardProps {
  sermon: SermonRecord;
  width: number;
  onPress: () => void;
}

function SermonVideoCard({ sermon, width, onPress }: SermonVideoCardProps) {
  const playerHeight = (width * 9) / 16;

  return (
    <View className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open sermon: ${sermon.title}`}
        onPress={onPress}
        className="flex-row items-start justify-between px-4 pb-3 pt-4"
      >
        <View className="flex-1 pr-3">
          <Text
            className="text-base font-bold leading-6 text-slate-900"
            numberOfLines={2}
          >
            {sermon.title}
          </Text>
          <Text className="mt-1 text-xs text-slate-500">
            {formatDate(sermon.datePreached)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </Pressable>

      <View className="bg-black">
        <VideoPlayer
          videoId={sermon.youtubeVideoId}
          width={width}
          height={playerHeight}
        />
      </View>
    </View>
  );
}

export default function MediaScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const { width } = useWindowDimensions();

  const [sermons, setSermons] = useState<SermonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSermons = useCallback(async () => {
    try {
      setError(null);

      const data = await apiRequest<SermonRecord[]>("/api/sermons");

      setSermons(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load sermons. Check your connection and try again.",
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSermons();
    setRefreshing(false);
  }, [loadSermons]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    void loadSermons();
  }, [loadSermons]);

  const cardWidth = Math.min(width, 720) - 40;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
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
          <View>
            <ScreenHeader
              eyebrow="Media"
              title="Sermons"
              subtitle="Catch up on recent messages and revisit the moments that shaped us."
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Search sermons"
                  onPress={() =>
                    Alert.alert(
                      "Search sermons",
                      "Search and filters will be connected to the backend soon.",
                    )
                  }
                  className="mt-1 h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white"
                >
                  <Ionicons
                    name="search"
                    size={20}
                    color={theme.colors.text}
                  />
                </Pressable>
              }
            />

            <View className="mb-4 mt-3 flex-row gap-2">
              <View className="rounded-full bg-brand-600 px-3 py-1.5">
                <Text className="text-xs font-semibold text-white">
                  All messages
                </Text>
              </View>
              <View className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                <Text className="text-xs font-semibold text-slate-500">
                  Series
                </Text>
              </View>
              <View className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                <Text className="text-xs font-semibold text-slate-500">
                  Speakers
                </Text>
              </View>
            </View>

            {error && sermons.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry loading sermons"
                onPress={handleRetry}
                className="mb-4 flex-row items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5"
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={theme.colors.gold}
                />
                <Text className="flex-1 text-xs font-medium text-amber-700">
                  {error} Tap to retry.
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <SermonVideoCard
            sermon={item}
            width={cardWidth}
            onPress={() =>
              router.push({
                pathname: "/sermon/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={theme.colors.brand} />
              <Text className="mt-3 text-sm text-slate-500">
                Loading sermons...
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
                onPress={handleRetry}
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
                name="videocam-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-base font-semibold text-slate-800">
                No sermons yet
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                {isAdmin
                  ? "Tap the + button to add the first message."
                  : "Check back soon for new messages."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          sermons.length > 0 ? (
            <Text className="mt-5 text-center text-xs text-slate-400">
              New messages are added every Sunday
            </Text>
          ) : undefined
        }
      />

      {isAdmin ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add sermon"
          onPress={() => router.push("/create-sermon")}
          className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-brand-600"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
