import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { PostCard } from "@/components/PostCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Announcement, Department, Post } from "@/types";

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

export default function DepartmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isAdmin = useAuthStore((state) => state.user?.role === "admin");

  const [department, setDepartment] = useState<Department | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const loadDepartment = useCallback(async () => {
    if (!id) {
      return;
    }

    const [departmentResult, feedResult] = await Promise.allSettled([
      apiRequest<Department>(`/api/departments/${id}`),
      apiRequest<Announcement[]>(`/api/announcements?departmentId=${id}`),
    ]);

    try {
      if (departmentResult.status === "rejected") {
        const reason = departmentResult.reason;

        if (reason instanceof ApiError && reason.status === 404) {
          setNotFound(true);
        } else {
          setError(
            reason instanceof ApiError
              ? reason.message
              : "Couldn't load this department. Please try again.",
          );
        }

        return;
      }

      setDepartment(departmentResult.value);
      setNotFound(false);
      setError(null);

      if (feedResult.status === "fulfilled") {
        setAnnouncements(feedResult.value);
        setFeedError(null);
      } else {
        const reason = feedResult.reason;

        setFeedError(
          reason instanceof ApiError
            ? reason.message
            : "Couldn't load the department feed.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadDepartment();
    }, [loadDepartment]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDepartment();
    setRefreshing(false);
  }, [loadDepartment]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    void loadDepartment();
  };

  const handleRetryFeed = () => {
    void loadDepartment();
  };

  const likingIds = useRef(new Set<string>());

  const handleLike = async (announcement: Announcement) => {
    if (likingIds.current.has(announcement.id)) {
      return;
    }

    likingIds.current.add(announcement.id);

    const previousLiked = announcement.isLiked ?? false;
    const previousLikes = announcement._count?.likes ?? 0;
    const nextLiked = !previousLiked;
    const nextLikes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));

    const applyLike = (liked: boolean, likes: number) => {
      setAnnouncements((current) =>
        current.map((item) =>
          item.id === announcement.id
            ? {
                ...item,
                isLiked: liked,
                _count: {
                  likes,
                  comments: item._count?.comments ?? 0,
                },
              }
            : item,
        ),
      );
    };

    applyLike(nextLiked, nextLikes);

    try {
      const result = await apiRequest<{ liked: boolean; likes: number }>(
        `/api/announcements/${announcement.id}/like`,
        { method: "POST" },
      );

      applyLike(result.liked, result.likes);
    } catch (err) {
      applyLike(previousLiked, previousLikes);

      Alert.alert(
        "Couldn't update like",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      likingIds.current.delete(announcement.id);
    }
  };

  const handleShare = (announcement: Announcement) => {
    void Share.share({
      message: `${announcement.title}\n\n${announcement.content}`,
    }).catch(() => undefined);
  };

  const handleComment = (announcement: Announcement) => {
    router.push({
      pathname: "/announcement/[id]",
      params: { id: announcement.id },
    });
  };

  const handleToggleMembership = async () => {
    if (!id || !department || isToggling) {
      return;
    }

    const joining = !department.isMember;
    setIsToggling(true);

    try {
      const updated = await apiRequest<Department>(
        `/api/departments/${id}/${joining ? "join" : "leave"}`,
        { method: "POST" },
      );

      setDepartment((current) =>
        current
          ? {
              ...current,
              isMember: updated.isMember,
              _count: updated._count,
            }
          : current,
      );
    } catch (err) {
      Alert.alert(
        joining ? "Couldn't join" : "Couldn't leave",
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsToggling(false);
    }
  };

  if (!id || notFound) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Ionicons
          name="people-outline"
          size={42}
          color={theme.colors.muted}
        />
        <Text className="mt-3 text-lg font-bold text-slate-900">
          Department not found
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500">
          This department may have been moved or removed.
        </Text>
      </SafeAreaView>
    );
  }

  if (loading && !department) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color={theme.colors.brand} />
        <Text className="mt-3 text-sm text-slate-500">
          Loading department...
        </Text>
      </SafeAreaView>
    );
  }

  if (error && !department) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Ionicons
          name="cloud-offline-outline"
          size={42}
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
          <Text className="text-sm font-semibold text-white">Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!department) {
    return null;
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
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
            <View className="mt-2 rounded-3xl border border-slate-100 bg-white p-5">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-2xl font-bold leading-8 text-slate-900">
                    {department.name}
                  </Text>
                  {department.description ? (
                    <Text className="mt-2 text-sm leading-6 text-slate-600">
                      {department.description}
                    </Text>
                  ) : null}
                </View>

                {department.isMember ? (
                  <View className="rounded-full bg-brand-50 px-2.5 py-1">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      Joined
                    </Text>
                  </View>
                ) : null}
              </View>

              <View className="mt-4 flex-row gap-5">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={theme.colors.muted}
                  />
                  <Text className="text-xs font-medium text-slate-500">
                    {department._count.members}{" "}
                    {department._count.members === 1 ? "member" : "members"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="megaphone-outline"
                    size={16}
                    color={theme.colors.muted}
                  />
                  <Text className="text-xs font-medium text-slate-500">
                    {department._count.announcements}{" "}
                    {department._count.announcements === 1
                      ? "update"
                      : "updates"}
                  </Text>
                </View>
              </View>

              <PrimaryButton
                label={
                  department.isMember ? "Leave department" : "Join department"
                }
                icon={
                  department.isMember
                    ? "exit-outline"
                    : "add-circle-outline"
                }
                variant={department.isMember ? "secondary" : "primary"}
                loading={isToggling}
                onPress={handleToggleMembership}
                className="mt-5"
              />
            </View>

            <View className="mb-3 mt-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900">
                Department updates
              </Text>
              {announcements.length > 0 ? (
                <Text className="text-xs text-slate-400">
                  {announcements.length}{" "}
                  {announcements.length === 1 ? "post" : "posts"}
                </Text>
              ) : null}
            </View>

            {feedError && announcements.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry loading department updates"
                onPress={handleRetryFeed}
                className="mb-3 flex-row items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5"
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={theme.colors.gold}
                />
                <Text className="flex-1 text-xs font-medium text-amber-700">
                  {feedError} Tap to retry.
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={toPost(item)}
            onLike={() => void handleLike(item)}
            onComment={() => handleComment(item)}
            onShare={() => handleShare(item)}
          />
        )}
        ListEmptyComponent={
          feedError ? (
            <View className="items-center rounded-3xl border border-slate-100 bg-white px-6 py-10">
              <Ionicons
                name="cloud-offline-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-center text-sm leading-5 text-slate-500">
                {feedError}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Try again"
                onPress={handleRetryFeed}
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
                {isAdmin
                  ? "Tap the + button to share the first update with this department."
                  : "Check back soon for news from this department."}
              </Text>
            </View>
          )
        }
      />

      {isAdmin ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create department announcement"
          onPress={() =>
            router.push({
              pathname: "/create-announcement",
              params: { departmentId: department.id },
            })
          }
          className="absolute right-5 h-14 w-14 items-center justify-center rounded-full bg-brand-600"
          style={({ pressed }) => ({
            bottom: Math.max(insets.bottom, 24),
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
