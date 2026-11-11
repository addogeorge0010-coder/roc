import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, type ComponentProps } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { theme } from "@/constants/theme";
import { quickGivingAmounts } from "@/data/mock";
import { formatCurrency } from "@/lib/format";
import type { PaymentMethod } from "@/types";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface PaymentOptionProps {
  icon: IoniconName;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

function PaymentOption({
  icon,
  title,
  description,
  selected,
  onPress,
}: PaymentOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${description}`}
      className={`flex-row items-center rounded-2xl border p-4 ${
        selected ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"
      }`}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-xl ${
          selected ? "bg-brand-600" : "bg-slate-100"
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={selected ? "#FFFFFF" : theme.colors.muted}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-slate-900">{title}</Text>
        <Text className="mt-0.5 text-xs text-slate-500">{description}</Text>
      </View>

      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${
          selected ? "border-brand-600 bg-brand-600" : "border-slate-300"
        }`}
      >
        {selected ? (
          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function GiveScreen() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [amountError, setAmountError] = useState<string>();
  const [showSuccess, setShowSuccess] = useState(false);

  const amountValue = Number.parseFloat(amount) || 0;

  const handleAmountChange = (value: string) => {
    setAmount(value.replace(/[^0-9.]/g, ""));
    if (amountError) setAmountError(undefined);
  };

  const handleGive = () => {
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setAmountError("Enter an amount greater than zero.");
      return;
    }

    setShowSuccess(true);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setAmount("");
    setAmountError(undefined);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            maxWidth: 720,
            width: "100%",
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            eyebrow="Giving"
            title="Give with joy"
            subtitle="Your tithes and offerings help us serve our church and community."
          />

          <View className="mt-4 overflow-hidden rounded-3xl">
            <LinearGradient
              colors={[theme.gradients.gold[0], theme.gradients.gold[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="rounded-full bg-white/20 px-3 py-1">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-white">
                    Tithes & offerings
                  </Text>
                </View>
                <Ionicons name="heart" size={20} color="#FFFFFF" />
              </View>

              <Text className="mt-3 text-xl font-bold leading-7 text-white">
                {'"Each of you should give what you have decided in your heart to give."'}
              </Text>
              <Text className="mt-2 text-xs font-semibold text-amber-100">
                2 Corinthians 9:7
              </Text>
            </LinearGradient>
          </View>

          <View className="mt-5 rounded-3xl border border-slate-100 bg-white p-5">
            <Text className="text-sm font-semibold text-slate-700">
              Amount
            </Text>

            <View
              className={`mt-3 flex-row items-center rounded-2xl border px-4 ${
                amountError ? "border-red-300" : "border-slate-200"
              }`}
            >
              <Text className="text-lg font-bold text-slate-400">GH₵</Text>
              <TextInput
                className="ml-3 flex-1 py-4 text-3xl font-bold text-slate-900"
                placeholder="0.00"
                placeholderTextColor="#CBD5E1"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleAmountChange}
                accessibilityLabel="Donation amount in Ghana cedis"
                selectionColor={theme.colors.brand}
              />
            </View>

            {amountError ? (
              <Text className="mt-2 text-xs font-medium text-red-500">
                {amountError}
              </Text>
            ) : null}

            <View className="mt-4 flex-row gap-2">
              {quickGivingAmounts.map((value) => {
                const active = amountValue === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() => {
                      setAmount(String(value));
                      setAmountError(undefined);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Give ${value} Ghana cedis`}
                    className={`flex-1 rounded-xl border py-2.5 ${
                      active
                        ? "border-brand-600 bg-brand-50"
                        : "border-slate-200 bg-white"
                    }`}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${
                        active ? "text-brand-700" : "text-slate-600"
                      }`}
                    >
                      GH₵{value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text className="mb-3 mt-6 text-sm font-semibold text-slate-700">
            Payment method
          </Text>

          <View className="gap-3">
            <PaymentOption
              icon="phone-portrait-outline"
              title="Mobile Money"
              description="MTN, Telecel & AT Money"
              selected={method === "momo"}
              onPress={() => setMethod("momo")}
            />
            <PaymentOption
              icon="card-outline"
              title="Card"
              description="Visa, Mastercard & Verve"
              selected={method === "card"}
              onPress={() => setMethod("card")}
            />
          </View>

          <View className="mt-6 rounded-2xl bg-slate-100 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-600">Your gift</Text>
              <Text className="text-base font-bold text-slate-900">
                {formatCurrency(amountValue)}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center gap-2">
              <Ionicons
                name="lock-closed"
                size={13}
                color={theme.colors.muted}
              />
              <Text className="flex-1 text-[11px] leading-4 text-slate-500">
                Secure giving powered by Hubtel & Paystack. Payment processing
                will be connected after launch.
              </Text>
            </View>
          </View>

          <PrimaryButton
            label="Give now"
            icon="heart"
            onPress={handleGive}
            disabled={amountValue <= 0}
            className="mt-5"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeSuccess}
      >
        <View className="flex-1 items-center justify-center bg-slate-900/60 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6">
            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Ionicons
                  name="checkmark-circle"
                  size={40}
                  color={theme.colors.success}
                />
              </View>

              <Text className="mt-4 text-2xl font-bold text-slate-900">
                Thank you!
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Your gift of{" "}
                <Text className="font-bold text-slate-800">
                  {formatCurrency(amountValue)}
                </Text>{" "}
                has been received. May God bless you abundantly.
              </Text>

              <View className="mt-4 w-full rounded-2xl bg-slate-50 p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500">Method</Text>
                  <Text className="text-xs font-semibold text-slate-800">
                    {method === "momo" ? "Mobile Money" : "Card"}
                  </Text>
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500">Reference</Text>
                  <Text className="text-xs font-semibold text-slate-800">
                    RPC-DEMO-0001
                  </Text>
                </View>
              </View>
            </View>

            <PrimaryButton
              label="Done"
              onPress={closeSuccess}
              className="mt-6"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
