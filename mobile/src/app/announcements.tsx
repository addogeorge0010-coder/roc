import { Ionicons } from "@expo/vector-icons";
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

import { PostCard } from "@/components/PostCard";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import type { Announcement, Post } from "@/types";

function toPost(announcement: Announcement): Post {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.content,
    category: "Announcement",
    author: announcement.author?.name ?? "Church Admin",
    authorRole: announcement.department?.name ?? "Church Admin",
    publishedAt: announcement.createdAt,
    likes: announcement._count?.likes ?? 0,
    comments: announcement._count?.comments ?? 0,
    liked: announcement.isLiked ?? false,
  };
}

export default function AnnouncementsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const likingIds = useRef(new Set<string>());

  const loadAnnouncements = useCallback(async () => {
    try {
      setError(null);
      const data = await apiRequest<Announcement[]>(
        "/api/announcements?limit=50",
      );
      setPosts(data.map(toPost));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load the announcements archive.",
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleLike = async (post: Post) => {
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
    } catch (err) {
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, liked: post.liked, likes: post.likes }
            : item,
        ),
      );
      Alert.alert(
        "Couldn't update like",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      likingIds.current.delete(post.id);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <FlatList
        data={posts}
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
            Every update from the church, newest first.
          </Text>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => void handleLike(item)}
            onComment={() =>
              router.push({
                pathname: "/announcement/[id]",
                params: { id: item.id },
              })
            }
            onShare={() => {
              void Share.share({
                message: `${item.title}\n\n${item.body}`,
              }).catch(() => undefined);
            }}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={theme.colors.brand} />
              <Text className="mt-3 text-sm text-slate-500">
                Loading updates...
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
                name="megaphone-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-base font-semibold text-slate-800">
                No updates yet
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                Check back soon for news from the church.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
