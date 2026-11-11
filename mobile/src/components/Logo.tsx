import { Image } from "expo-image";

const LOGO_ASPECT_RATIO = 512 / 495;

interface LogoProps {
  size?: number;
}

export function Logo({ size = 60 }: LogoProps) {
  return (
    <Image
      source={require("../../assets/ag-logo.png")}
      accessibilityLabel="Royal Palace Chapel Assemblies of God"
      contentFit="contain"
      style={{
        height: size,
        width: Math.round(size * LOGO_ASPECT_RATIO),
      }}
    />
  );
}
