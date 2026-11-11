import { Text, View } from "react-native";
import type { ReactNode } from "react";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: ScreenHeaderProps) {
  return (
    <View className="flex-row items-start justify-between pb-2 pt-3">
      <View className="flex-1 pr-4">
        {eyebrow ? (
          <Text className="mb-1 text-[11px] font-bold uppercase tracking-widest text-brand-600">
            {eyebrow}
          </Text>
        ) : null}
        <Text className="text-2xl font-bold text-slate-900">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 text-sm leading-5 text-slate-500">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
