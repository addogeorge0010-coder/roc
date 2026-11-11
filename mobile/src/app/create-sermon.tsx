import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { SermonRecord } from "@/types";

const TITLE_MIN = 3;
const TITLE_MAX = 160;
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function extractVideoId(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/,
  );

  return match?.[1] ?? trimmed;
}

export default function CreateSermonScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const [title, setTitle] = useState("");
  const [videoInput, setVideoInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const videoId = extractVideoId(videoInput);
  const isValidVideoId = VIDEO_ID_PATTERN.test(videoId);

  useEffect(() => {
    if (!isAdmin) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    }
  }, [isAdmin]);

  const canPublish =
    isAdmin &&
    !isPublishing &&
    title.trim().length >= TITLE_MIN &&
    isValidVideoId;

  const handlePublish = async () => {
    if (!canPublish) {
      return;
    }

    setIsPublishing(true);

    try {
      await apiRequest<SermonRecord>("/api/sermons", {
        method: "POST",
        body: { title: title.trim(), youtubeVideoId: videoId },
      });

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";

      Alert.alert("Couldn't publish", message);
      setIsPublishing(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm font-medium text-slate-500">
            Add a message so the church family can watch it here.
          </Text>

          <View className="mt-5">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title
            </Text>
            <TextInput
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900"
              placeholder="e.g. Walking in faith"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              maxLength={TITLE_MAX}
              editable={!isPublishing}
              returnKeyType="next"
            />
            <Text className="mt-1.5 text-right text-[11px] text-slate-400">
              {title.length}/{TITLE_MAX}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              YouTube video ID
            </Text>
            <TextInput
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900"
              placeholder="dQw4w9WgXcQ"
              placeholderTextColor="#94A3B8"
              value={videoInput}
              onChangeText={setVideoInput}
              editable={!isPublishing}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Text className="mt-1.5 text-xs text-slate-400">
              Paste the 11-character ID or a full YouTube link.
            </Text>
          </View>

          {isValidVideoId ? (
            <View className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image
                source={{
                  uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                }}
                style={{ width: "100%", aspectRatio: 16 / 9 }}
                contentFit="cover"
                transition={150}
              />
              <View className="flex-row items-center gap-2 px-3.5 py-2.5">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={theme.colors.success}
                />
                <Text className="text-xs text-slate-500">
                  Video detected: {videoId}
                </Text>
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Publish sermon"
            accessibilityState={{ disabled: !canPublish, busy: isPublishing }}
            disabled={!canPublish}
            onPress={handlePublish}
            className={`mt-6 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 ${
              canPublish ? "bg-brand-600" : "bg-slate-300"
            }`}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            {isPublishing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
            <Text className="text-base font-semibold text-white">
              {isPublishing ? "Publishing..." : "Publish sermon"}
            </Text>
          </Pressable>

          <Text className="mt-3 text-center text-xs text-slate-400">
            Admins only · Visible to everyone in the Sermons tab
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
