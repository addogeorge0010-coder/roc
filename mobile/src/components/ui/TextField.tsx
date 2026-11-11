import { Ionicons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { theme } from "@/constants/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface TextFieldProps extends TextInputProps {
  label?: string;
  icon?: IoniconName;
  error?: string;
  isPassword?: boolean;
}

export function TextField({
  label,
  icon,
  error,
  isPassword,
  secureTextEntry,
  ...rest
}: TextFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm font-semibold text-slate-700">{label}</Text>
      ) : null}

      <View
        className={`flex-row items-center rounded-2xl border bg-white px-4 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={19}
            color={theme.colors.muted}
            accessible={false}
          />
        ) : null}

        <TextInput
          className={`flex-1 py-3.5 text-base text-slate-900 ${
            icon ? "ml-3" : ""
          }`}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword ? !visible : secureTextEntry}
          accessibilityLabel={label}
          selectionColor={theme.colors.brand}
          {...rest}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setVisible((value) => !value)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="text-xs font-medium text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
