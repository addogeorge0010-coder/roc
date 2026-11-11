import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text } from "react-native";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IoniconName;
  variant?: ButtonVariant;
  className?: string;
}

const palettes: Record<
  ButtonVariant,
  { container: string; text: string; icon: string }
> = {
  primary: {
    container: "bg-brand-600",
    text: "text-white",
    icon: "#FFFFFF",
  },
  secondary: {
    container: "border border-slate-200 bg-white",
    text: "text-slate-800",
    icon: "#0F172A",
  },
  danger: {
    container: "border border-red-200 bg-red-50",
    text: "text-red-600",
    icon: "#DC2626",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-brand-600",
    icon: "#4F46E5",
  },
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = "primary",
  className = "",
}: PrimaryButtonProps) {
  const palette = palettes[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 ${palette.container} ${className}`}
      style={({ pressed }) => ({
        opacity: isDisabled ? 0.6 : pressed ? 0.88 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={palette.icon} />
      ) : icon ? (
        <Ionicons name={icon} size={19} color={palette.icon} />
      ) : null}
      <Text className={`text-base font-semibold ${palette.text}`}>
        {label}
      </Text>
    </Pressable>
  );
}
