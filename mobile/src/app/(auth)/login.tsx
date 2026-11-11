import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/Logo";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAuthStore } from "@/store/authStore";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const { signIn: promptGoogleSignIn, unavailableReason } = useGoogleAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(
        "Sign in failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const handleGoogleSignIn = async () => {
    if (unavailableReason) {
      Alert.alert("Google sign-in", unavailableReason);
      return;
    }

    try {
      const idToken = await promptGoogleSignIn();

      if (!idToken) {
        return;
      }

      await signInWithGoogle(idToken);
    } catch (error) {
      Alert.alert(
        "Google sign-in",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-slate-50">
      <View pointerEvents="none" className="absolute inset-x-0 top-0 h-72">
        <LinearGradient
          colors={["#EEF2FF", "#F8FAFC"]}
          style={{ flex: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md self-center">
            <View className="items-center">
              <Logo size={64} />
              <Text className="mt-5 text-center text-[10px] font-bold uppercase tracking-[2px] text-brand-600">
                Royal Palace Chapel{"\n"}Assemblies of God
              </Text>
              <Text className="mt-2 text-3xl font-bold text-slate-900">
                Welcome back
              </Text>
              <Text className="mt-2 max-w-xs text-center text-sm leading-6 text-slate-500">
                Sign in to stay connected with your church family.
              </Text>
            </View>

            <View className="mt-8 gap-4">
              <TextField
                label="Email address"
                icon="mail-outline"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                returnKeyType="next"
              />

              <View>
                <TextField
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Enter your password"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                <Pressable
                  className="mt-3 self-end"
                  accessibilityRole="button"
                  onPress={() =>
                    Alert.alert(
                      "Reset password",
                      "Password reset will be connected to the backend soon.",
                    )
                  }
                >
                  <Text className="text-sm font-semibold text-brand-600">
                    Forgot password?
                  </Text>
                </Pressable>
              </View>
            </View>

            <PrimaryButton
              label="Sign in"
              onPress={handleSubmit}
              loading={isSubmitting}
              icon="arrow-forward"
              className="mt-6"
            />

            <View className="my-6 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-slate-200" />
              <Text className="text-xs font-medium uppercase tracking-wider text-slate-400">
                or
              </Text>
              <View className="h-px flex-1 bg-slate-200" />
            </View>

            <GoogleButton
              label="Sign in with Google"
              onPress={handleGoogleSignIn}
            />

            <View className="mt-8 flex-row items-center justify-center gap-1">
              <Text className="text-sm text-slate-500">New here?</Text>
              <Pressable
                onPress={() => router.push("/signup")}
                accessibilityRole="link"
              >
                <Text className="text-sm font-bold text-brand-600">
                  Create an account
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
