import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { formatDate } from "@/lib/format";
import type { Sermon } from "@/types";

interface SermonCardProps {
  sermon: Sermon;
  onPress: () => void;
  featured?: boolean;
}

export function SermonCard({
  sermon,
  onPress,
  featured = false,
}: SermonCardProps) {
  if (featured) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Play sermon: ${sermon.title}`}
        className="overflow-hidden rounded-3xl bg-white"
        style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1 })}
      >
        <View>
          <Image
            source={{ uri: sermon.thumbnailUrl }}
            style={{ width: "100%", height: 196 }}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={["transparent", "rgba(15,23,42,0.78)"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />

          <View className="absolute inset-0 items-center justify-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/95">
              <Ionicons
                name="play"
                size={22}
                color={theme.colors.brand}
                style={{ marginLeft: 3 }}
              />
            </View>
          </View>

          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              {sermon.series}
            </Text>
            <Text
              className="mt-1 text-xl font-bold leading-6 text-white"
              numberOfLines={2}
            >
              {sermon.title}
            </Text>
            <Text className="mt-1 text-xs font-medium text-slate-200">
              {sermon.speaker} · {sermon.duration}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Play sermon: ${sermon.title}`}
      className="flex-row rounded-3xl border border-slate-100 bg-white p-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="relative h-[86px] w-[114px] overflow-hidden rounded-2xl">
        <Image
          source={{ uri: sermon.thumbnailUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
        <View className="absolute inset-0 items-center justify-center bg-slate-900/20">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-white/90">
            <Ionicons
              name="play"
              size={14}
              color={theme.colors.brand}
              style={{ marginLeft: 2 }}
            />
          </View>
        </View>
      </View>

      <View className="ml-3 flex-1 justify-center">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
          {sermon.series}
        </Text>
        <Text
          className="mt-0.5 text-sm font-bold leading-5 text-slate-900"
          numberOfLines={2}
        >
          {sermon.title}
        </Text>
        <Text className="mt-1 text-xs text-slate-500" numberOfLines={1}>
          {sermon.speaker}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-2">
          <Text className="text-[11px] text-slate-400">
            {formatDate(sermon.date)}
          </Text>
          <View className="h-1 w-1 rounded-full bg-slate-300" />
          <Text className="text-[11px] text-slate-400">
            {sermon.duration}
          </Text>
        </View>
      </View>

      <View className="justify-center pr-1">
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>
    </Pressable>
  );
}
