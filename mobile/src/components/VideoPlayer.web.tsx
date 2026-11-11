import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, Text } from "react-native";

interface VideoPlayerProps {
  videoId: string;
  width: number;
  height: number;
}

export function VideoPlayer({ videoId, height }: VideoPlayerProps) {
  return (
    <Pressable
      onPress={() =>
        Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)
      }
      style={{ height }}
      className="items-center justify-center px-6"
      accessibilityRole="link"
      accessibilityLabel="Open sermon on YouTube"
    >
      <Ionicons name="logo-youtube" size={48} color="#FF0000" />
      <Text className="mt-3 text-center text-sm font-semibold text-white">
        Open this sermon on YouTube
      </Text>
    </Pressable>
  );
}
