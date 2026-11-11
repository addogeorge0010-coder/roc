import { Image } from "expo-image";
import { Text, View } from "react-native";

import { initials } from "@/lib/format";

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={150}
        accessibilityLabel={`${name}'s avatar`}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-brand-100"
    >
      <Text
        style={{ fontSize: Math.max(12, Math.round(size * 0.34)) }}
        className="font-bold text-brand-700"
      >
        {initials(name)}
      </Text>
    </View>
  );
}
