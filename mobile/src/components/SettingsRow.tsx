import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { theme } from "@/constants/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface SettingsRowProps {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
  showChevron?: boolean;
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  danger = false,
  showChevron = true,
}: SettingsRowProps) {
  const content = (
    <>
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${
          danger ? "bg-red-50" : "bg-brand-50"
        }`}
      >
        <Ionicons
          name={icon}
          size={19}
          color={danger ? theme.colors.danger : theme.colors.brand}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className={`text-sm font-semibold ${
            danger ? "text-red-600" : "text-slate-800"
          }`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-slate-500">{subtitle}</Text>
        ) : null}
      </View>

      {right ??
        (showChevron ? (
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        ) : null)}
    </>
  );

  if (!onPress) {
    return (
      <View className="flex-row items-center px-4 py-3.5">{content}</View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center px-4 py-3.5"
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.background : "transparent",
      })}
    >
      {content}
    </Pressable>
  );
}
