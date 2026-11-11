import { useState } from "react";
import YoutubeIframe, {
  PLAYER_STATES,
} from "react-native-youtube-iframe";

interface VideoPlayerProps {
  videoId: string;
  width: number;
  height: number;
}

export function VideoPlayer({ videoId, width, height }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <YoutubeIframe
      videoId={videoId}
      width={width}
      height={height}
      play={playing}
      onChangeState={(state: PLAYER_STATES) =>
        setPlaying(state === PLAYER_STATES.PLAYING)
      }
      initialPlayerParams={{
        controls: true,
        rel: false,
        preventFullScreen: false,
      }}
    />
  );
}
