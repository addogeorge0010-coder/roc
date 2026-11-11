import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VideoPlayer } from "@/components/VideoPlayer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { SermonRecord } from "@/types";

export default function SermonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const [sermon, setSermon] = useState<SermonRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadSermon = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      const data = await apiRequest<SermonRecord>(`/api/sermons/${id}`);
      setSermon(data);
      setError(null);
      setNotFound(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load this sermon. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadSermon();
    }, [loadSermon]),
  );

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    void loadSermon();
  };

  if (!id || notFound) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Ionicons
          name="videocam-off-outline"
          size={42}
          color={theme.colors.muted}
        />
        <Text className="mt-3 text-lg font-bold text-slate-900">
          Sermon not found
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500">
          This message may have been moved or removed.
        </Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color={theme.colors.brand} />
        <Text className="mt-3 text-sm text-slate-500">Loading sermon...</Text>
      </SafeAreaView>
    );
  }

  if (error || !sermon) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Ionicons
          name="cloud-offline-outline"
          size={42}
          color={theme.colors.muted}
        />
        <Text className="mt-3 text-center text-sm leading-5 text-slate-500">
          {error ?? "This sermon is unavailable right now."}
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

  const playerWidth = Math.min(width, 820);
  const playerHeight = (playerWidth * 9) / 16;

  const handleShare = () => {
    Share.share({
      message: `Watch "${sermon.title}" on the Royal Palace Chapel Assemblies of God app.`,
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="w-full self-center bg-black"
          style={{ maxWidth: playerWidth }}
        >
          <VideoPlayer
            videoId={sermon.youtubeVideoId}
            width={playerWidth}
            height={playerHeight}
          />
        </View>

        <View className="w-full max-w-[820px] self-center px-5 pt-5">
          <View className="flex-row flex-wrap items-center gap-2">
            <View className="rounded-full bg-brand-50 px-2.5 py-1">
              <Text className="text-[11px] font-semibold text-brand-700">
                Message
              </Text>
            </View>
            <Text className="text-xs text-slate-500">
              {formatDate(sermon.datePreached)}
            </Text>
          </View>

          <Text className="mt-3 text-2xl font-bold leading-8 text-slate-900">
            {sermon.title}
          </Text>

          <View className="mt-6 flex-row gap-3">
            <PrimaryButton
              label="Share"
              icon="share-social-outline"
              variant="secondary"
              onPress={handleShare}
              className="flex-1"
            />
            <PrimaryButton
              label="Save"
              icon="bookmark-outline"
              variant="secondary"
              onPress={() =>
                Alert.alert(
                  "Saved",
                  "Sermon bookmarks will be connected to your account soon.",
                )
              }
              className="flex-1"
            />
          </View>

          <View className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="sparkles-outline"
                size={16}
                color={theme.colors.gold}
              />
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reflection
              </Text>
            </View>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              What is one step you can take this week to live out what you
              heard? Share it with someone in your small group and pray
              together.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
