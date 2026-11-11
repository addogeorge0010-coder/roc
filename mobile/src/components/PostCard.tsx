import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { theme } from "@/constants/theme";
import { formatRelativeTime } from "@/lib/format";
import type { Post, PostCategory } from "@/types";

const categoryStyles: Record<
  PostCategory,
  { pill: string; text: string }
> = {
  Announcement: { pill: "bg-brand-50", text: "text-brand-700" },
  Event: { pill: "bg-amber-50", text: "text-amber-700" },
  Prayer: { pill: "bg-emerald-50", text: "text-emerald-700" },
  Ministry: { pill: "bg-rose-50", text: "text-rose-700" },
};

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  likePending?: boolean;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  likePending = false,
}: PostCardProps) {
  const category = categoryStyles[post.category];

  return (
    <View className="rounded-3xl border border-slate-100 bg-white p-5">
      {post.pinned ? (
        <View className="mb-3 flex-row items-center gap-1.5">
          <Ionicons name="pin" size={13} color={theme.colors.gold} />
          <Text className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
            Pinned announcement
          </Text>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2.5 pr-3">
          <Avatar name={post.author} size={38} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-800">
              {post.author}
            </Text>
            <Text className="text-xs text-slate-500" numberOfLines={1}>
              {post.authorRole} · {formatRelativeTime(post.publishedAt)}
            </Text>
          </View>
        </View>

        <View className={`rounded-full px-2.5 py-1 ${category.pill}`}>
          <Text className={`text-[11px] font-semibold ${category.text}`}>
            {post.category}
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-lg font-bold leading-6 text-slate-900">
        {post.title}
      </Text>
      <Text className="mt-1.5 text-sm leading-6 text-slate-600">
        {post.body}
      </Text>

      <View className="mt-4 flex-row items-center gap-5 border-t border-slate-100 pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={post.liked ? "Unlike update" : "Like update"}
          accessibilityState={{
            disabled: !onLike || likePending,
            selected: !!post.liked,
          }}
          disabled={!onLike || likePending}
          onPress={onLike}
          className="flex-row items-center gap-1.5"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons
            name={post.liked ? "heart" : "heart-outline"}
            size={17}
            color={post.liked ? theme.colors.danger : theme.colors.muted}
          />
          <Text
            className={`text-xs font-medium ${
              post.liked ? "text-red-600" : "text-slate-500"
            }`}
          >
            {post.likes}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View comments"
          disabled={!onComment}
          onPress={onComment}
          className="flex-row items-center gap-1.5"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={theme.colors.muted}
          />
          <Text className="text-xs font-medium text-slate-500">
            {post.comments}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share update"
          disabled={!onShare}
          onPress={onShare}
          className="ml-auto flex-row items-center gap-1.5"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons
            name="share-social-outline"
            size={17}
            color={theme.colors.muted}
          />
          <Text className="text-xs font-medium text-slate-500">Share</Text>
        </Pressable>
      </View>
    </View>
  );
}
