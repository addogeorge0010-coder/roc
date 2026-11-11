import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  useCallback,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import type { Announcement, AnnouncementComment, Post } from "@/types";

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

function CommentRow({ comment }: { comment: AnnouncementComment }) {
  const authorName = comment.author?.name ?? "Member";

  return (
    <View className="mt-3 flex-row gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <Avatar name={authorName} size={34} />
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-slate-800">
            {authorName}
          </Text>
          <Text className="text-[11px] text-slate-400">
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </View>
        <Text className="mt-1 text-sm leading-5 text-slate-600">
          {comment.content}
        </Text>
      </View>
    </View>
  );
}

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const loadAnnouncement = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!id) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      setNotFound(false);

      try {
        const [announcementResult, commentsResult] = await Promise.all([
          apiRequest<Announcement>(`/api/announcements/${id}`),
          apiRequest<AnnouncementComment[]>(
            `/api/announcements/${id}/comments`,
          ),
        ]);

        setAnnouncement(announcementResult);
        setComments(commentsResult);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError
              ? err.message
              : "Couldn't load this update. Please try again.",
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadAnnouncement();
    }, [loadAnnouncement]),
  );

  const handleLike = async () => {
    if (!announcement || likePending) {
      return;
    }

    const previousLiked = announcement.isLiked ?? false;
    const previousLikes = announcement._count?.likes ?? 0;
    const nextLiked = !previousLiked;
    const nextLikes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));

    const applyLike = (liked: boolean, likes: number) => {
      setAnnouncement((current) =>
        current
          ? {
              ...current,
              isLiked: liked,
              _count: {
                likes,
                comments: current._count?.comments ?? 0,
              },
            }
          : current,
      );
    };

    setLikePending(true);
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
      setLikePending(false);
    }
  };

  const handleShare = () => {
    if (!announcement) {
      return;
    }

    void Share.share({
      message: `${announcement.title}\n\n${announcement.content}`,
    }).catch(() => undefined);
  };

  const handleSubmitComment = async () => {
    const content = commentText.trim();

    if (!content || !id || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const created = await apiRequest<AnnouncementComment>(
        `/api/announcements/${id}/comments`,
        {
          method: "POST",
          body: { content },
        },
      );

      setComments((current) => [...current, created]);
      setCommentText("");
      setAnnouncement((current) =>
        current
          ? {
              ...current,
              _count: {
                likes: current._count?.likes ?? 0,
                comments: (current._count?.comments ?? 0) + 1,
              },
            }
          : current,
      );
    } catch (err) {
      Alert.alert(
        "Couldn't post comment",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color={theme.colors.brand} />
      </View>
    );
  }

  if (notFound) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Ionicons
          name="document-outline"
          size={36}
          color={theme.colors.muted}
        />
        <Text className="mt-3 text-base font-semibold text-slate-800">
          Update not found
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500">
          This update may have been removed.
        </Text>
      </View>
    );
  }

  if (error || !announcement) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Ionicons
          name="cloud-offline-outline"
          size={36}
          color={theme.colors.muted}
        />
        <Text className="mt-3 text-center text-base font-semibold text-slate-800">
          Could not load this update
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500">
          {error ?? "Please try again."}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void loadAnnouncement()}
          className="mt-5 rounded-full bg-brand-600 px-5 py-2.5"
        >
          <Text className="text-sm font-semibold text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const commentCount = announcement._count?.comments ?? comments.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-50"
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadAnnouncement("refresh")}
            tintColor={theme.colors.brand}
          />
        }
        ListHeaderComponent={
          <View className="gap-4">
            <PostCard
              post={toPost(announcement)}
              onLike={() => void handleLike()}
              onComment={() => inputRef.current?.focus()}
              onShare={handleShare}
              likePending={likePending}
            />
            <Text className="text-sm font-semibold text-slate-700">
              {commentCount === 1 ? "1 comment" : `${commentCount} comments`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-4 items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8">
            <Ionicons
              name="chatbubbles-outline"
              size={28}
              color={theme.colors.muted}
            />
            <Text className="mt-2 text-sm font-medium text-slate-600">
              No comments yet
            </Text>
            <Text className="mt-1 text-center text-xs text-slate-400">
              Be the first to share a thought.
            </Text>
          </View>
        }
        renderItem={({ item }) => <CommentRow comment={item} />}
      />

      <View
        className="border-t border-slate-200 bg-white px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row items-end gap-2">
          <TextInput
            ref={inputRef}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
            placeholder="Add a comment..."
            placeholderTextColor={theme.colors.muted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={2000}
            editable={!submitting}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post comment"
            accessibilityState={{
              disabled: submitting || !commentText.trim(),
            }}
            disabled={submitting || !commentText.trim()}
            onPress={() => void handleSubmitComment()}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              submitting || !commentText.trim() ? "bg-slate-200" : "bg-brand-600"
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.muted} />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={
                  commentText.trim() ? theme.colors.surface : theme.colors.muted
                }
              />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
