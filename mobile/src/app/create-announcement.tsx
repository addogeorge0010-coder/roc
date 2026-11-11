import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import type { Announcement } from "@/types";

const TITLE_MIN = 3;
const TITLE_MAX = 160;
const CONTENT_MAX = 10_000;

export default function CreateAnnouncementScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const { departmentId } = useLocalSearchParams<{ departmentId?: string }>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

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
    content.trim().length > 0;

  const handlePublish = async () => {
    if (!canPublish) {
      return;
    }

    setIsPublishing(true);

    try {
      await apiRequest<Announcement>("/api/announcements", {
        method: "POST",
        body: {
          title: title.trim(),
          content: content.trim(),
          ...(departmentId ? { departmentId } : {}),
        },
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
            Share an update with the church family.
          </Text>

          {departmentId ? (
            <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-brand-50 px-3.5 py-2.5">
              <Ionicons
                name="people-outline"
                size={16}
                color={theme.colors.brand}
              />
              <Text className="flex-1 text-xs font-medium text-brand-700">
                This update will appear in the department feed.
              </Text>
            </View>
          ) : null}

          <View className="mt-5">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title
            </Text>
            <TextInput
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900"
              placeholder="e.g. Christmas carol night"
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
              Content
            </Text>
            <TextInput
              className="min-h-[160px] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base leading-6 text-slate-900"
              placeholder="Write the details members should know..."
              placeholderTextColor="#94A3B8"
              value={content}
              onChangeText={setContent}
              maxLength={CONTENT_MAX}
              editable={!isPublishing}
              multiline
              style={{ textAlignVertical: "top" }}
            />
            <Text className="mt-1.5 text-right text-[11px] text-slate-400">
              {content.length}/{CONTENT_MAX}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Publish announcement"
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
              {isPublishing ? "Publishing..." : "Publish announcement"}
            </Text>
          </Pressable>

          <Text className="mt-3 text-center text-xs text-slate-400">
            {departmentId
              ? "Admins only · Visible in the department feed"
              : "Admins only · Visible to everyone in the feed"}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
