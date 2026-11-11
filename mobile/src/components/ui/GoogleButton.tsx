import { Image } from "expo-image";
import { Pressable, Text } from "react-native";

interface GoogleButtonProps {
  label: string;
  onPress: () => void;
}

export function GoogleButton({ label, onPress }: GoogleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-4"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Image
        source={require("../../../assets/google-logo.png")}
        style={{ width: 20, height: 20 }}
        contentFit="contain"
      />
      <Text className="text-base font-semibold text-slate-800">{label}</Text>
    </Pressable>
  );
}
