import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Announcement, Post } from "@/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function toPost(announcement: Announcement): Post {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.content,
    category: "Announcement",
    author: announcement.author?.name ?? "Church Admin",
    authorRole: "Church Admin",
    publishedAt: announcement.createdAt,
    likes: announcement._count?.likes ?? 0,
    comments: announcement._count?.comments ?? 0,
    liked: announcement.isLiked ?? false,
  };
}

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setError(null);

      const announcements = await apiRequest<Announcement[]>(
        "/api/announcements",
      );

      setPosts(announcements.map(toPost));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load the feed. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAnnouncements();
    }, [loadAnnouncements]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  }, [loadAnnouncements]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const likingIds = useRef(new Set<string>());

  const handleLike = useCallback(async (post: Post) => {
    if (likingIds.current.has(post.id)) {
      return;
    }

    likingIds.current.add(post.id);

    const nextLiked = !post.liked;
    const nextLikes = Math.max(0, post.likes + (nextLiked ? 1 : -1));

    setPosts((current) =>
      current.map((item) =>
        item.id === post.id
          ? { ...item, liked: nextLiked, likes: nextLikes }
          : item,
      ),
    );

    try {
      const result = await apiRequest<{ liked: boolean; likes: number }>(
        `/api/announcements/${post.id}/like`,
        { method: "POST" },
      );

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, liked: result.liked, likes: result.likes }
            : item,
        ),
      );
    } catch (error) {
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, liked: post.liked, likes: post.likes }
            : item,
        ),
      );

      Alert.alert(
        "Couldn't update like",
        error instanceof ApiError ? error.message : "Please try again.",
      );
    } finally {
      likingIds.current.delete(post.id);
    }
  }, []);

  const handleComment = useCallback((post: Post) => {
    router.push({
      pathname: "/announcement/[id]",
      params: { id: post.id },
    });
  }, []);

  const handleShare = useCallback((post: Post) => {
    void Share.share({
      message: `${post.title}\n\n${post.body}`,
    }).catch(() => undefined);
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "friend";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => void handleLike(item)}
            onComment={() => handleComment(item)}
            onShare={() => handleShare(item)}
          />
        )}
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
          <View className="pb-4 pt-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium text-slate-500">
                  {getGreeting()}
                </Text>
                <Text className="mt-0.5 text-2xl font-bold text-slate-900">
                  {firstName}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  onPress={() =>
                    Alert.alert(
                      "Notifications",
                      "You're all caught up. New updates will appear here.",
                    )
                  }
                  className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white"
                >
                  <Ionicons
                    name="notifications-outline"
                    size={21}
                    color={theme.colors.text}
                  />
                  <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold-500" />
                </Pressable>

                <Avatar name={user?.name ?? "Guest"} size={44} />
              </View>
            </View>

            <View className="mt-5 overflow-hidden rounded-3xl">
              <LinearGradient
                colors={[theme.gradients.hero[0], theme.gradients.hero[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 20 }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="rounded-full bg-white/15 px-3 py-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-wider text-white">
                      This Sunday
                    </Text>
                  </View>
                  <Ionicons name="sunny-outline" size={22} color="#FDE68A" />
                </View>

                <Text className="mt-4 text-2xl font-bold text-white">
                  Join us for worship
                </Text>
                <Text className="mt-1 max-w-xs text-sm leading-5 text-indigo-100">
                  Sunday service · 9:00 AM{"\n"}Main Sanctuary & online
                </Text>

                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Directions",
                      "Directions and live-stream links will be available once the backend is connected.",
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Get directions to Sunday service"
                  className="mt-4 flex-row items-center gap-2 self-start rounded-full bg-white px-4 py-2"
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <Text className="text-sm font-semibold text-brand-700">
                    Get directions
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={theme.colors.brandDark}
                  />
                </Pressable>
              </LinearGradient>
            </View>

            {error && posts.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry loading the feed"
                onPress={handleRetry}
                className="mt-4 flex-row items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5"
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

            <View className="mt-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900">
                Latest updates
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See all updates"
                onPress={() =>
                  Alert.alert(
                    "All updates",
                    "The full announcements archive will be available soon.",
                  )
                }
              >
                <Text className="text-sm font-semibold text-brand-600">
                  See all
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={theme.colors.brand} />
              <Text className="mt-3 text-sm text-slate-500">
                Loading announcements...
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
                name="megaphone-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-base font-semibold text-slate-800">
                No announcements yet
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                {isAdmin
                  ? "Tap the + button to publish the first announcement."
                  : "Check back soon for updates from the church."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          posts.length > 0 ? (
            <Text className="mt-5 text-center text-xs text-slate-400">
              {"You're all caught up · Pull to refresh"}
            </Text>
          ) : undefined
        }
      />

      {isAdmin ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create announcement"
          onPress={() => router.push("/create-announcement")}
          className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-brand-600"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
