import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "@/lib/format";
import { useAuthStore } from "@/store/authStore";

type DonationStatus = "PENDING" | "SUCCESS" | "FAILED";

interface DonationSummary {
  totalRaised: number;
  totalDonations: number;
  byStatus: Record<DonationStatus, { total: number; count: number }>;
  recent: {
    id: string;
    amount: string;
    method: "MOBILE_MONEY" | "CARD";
    status: DonationStatus;
    transactionReference: string;
    createdAt: string;
    user: { id: string; name: string; email: string } | null;
  }[];
}

const statusStyles: Record<DonationStatus, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-600",
};

export default function AdminGivingScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role === "admin");
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await apiRequest<DonationSummary>(
        "/api/admin/donations/summary",
      );
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load giving reports.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  if (!isAdmin) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        className="flex-1 items-center justify-center bg-slate-50 px-8"
      >
        <Ionicons
          name="lock-closed-outline"
          size={36}
          color={theme.colors.muted}
        />
        <Text className="mt-3 text-base font-semibold text-slate-800">
          Admin access required
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500">
          You do not have permission to view giving reports.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <FlatList
        data={summary?.recent ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          maxWidth: 720,
          width: "100%",
          alignSelf: "center",
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.brand}
            colors={[theme.colors.brand]}
          />
        }
        ListHeaderComponent={
          <View className="pb-4 pt-5">
            {loading ? (
              <View className="items-center rounded-2xl border border-slate-100 bg-white py-10">
                <ActivityIndicator color={theme.colors.brand} />
                <Text className="mt-3 text-sm text-slate-500">
                  Loading reports...
                </Text>
              </View>
            ) : error ? (
              <View className="items-center rounded-2xl border border-slate-100 bg-white px-6 py-10">
                <Ionicons
                  name="cloud-offline-outline"
                  size={30}
                  color={theme.colors.muted}
                />
                <Text className="mt-3 text-center text-sm leading-5 text-slate-500">
                  {error}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                  onPress={() => {
                    setLoading(true);
                    void loadSummary();
                  }}
                  className="mt-4 rounded-full bg-brand-600 px-5 py-2.5"
                >
                  <Text className="text-sm font-semibold text-white">
                    Try again
                  </Text>
                </Pressable>
              </View>
            ) : summary ? (
              <>
                <View className="rounded-3xl bg-brand-600 p-5">
                  <Text className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">
                    Total raised
                  </Text>
                  <Text className="mt-2 text-3xl font-bold text-white">
                    {formatCurrency(summary.totalRaised)}
                  </Text>
                  <Text className="mt-1 text-xs text-indigo-200">
                    {summary.byStatus.SUCCESS.count} successful{" "}
                    {summary.byStatus.SUCCESS.count === 1 ? "gift" : "gifts"}
                  </Text>
                </View>

                <View className="mt-3 flex-row gap-3">
                  <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4">
                    <Text className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Pending
                    </Text>
                    <Text className="mt-1 text-lg font-bold text-slate-900">
                      {formatCurrency(summary.byStatus.PENDING.total)}
                    </Text>
                    <Text className="text-xs text-slate-500">
                      {summary.byStatus.PENDING.count} gifts
                    </Text>
                  </View>
                  <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4">
                    <Text className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Failed
                    </Text>
                    <Text className="mt-1 text-lg font-bold text-slate-900">
                      {formatCurrency(summary.byStatus.FAILED.total)}
                    </Text>
                    <Text className="text-xs text-slate-500">
                      {summary.byStatus.FAILED.count} gifts
                    </Text>
                  </View>
                </View>

                <View className="mt-6 flex-row items-center justify-between">
                  <Text className="text-base font-bold text-slate-900">
                    Recent gifts
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {summary.totalDonations} total
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View className="rounded-2xl border border-slate-100 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-slate-900">
                {formatCurrency(Number(item.amount))}
              </Text>
              <View
                className={`rounded-full px-2 py-0.5 ${
                  statusStyles[item.status].split(" ")[0]
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    statusStyles[item.status].split(" ")[1]
                  }`}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-xs text-slate-500">
              {item.user?.name ?? "Anonymous giver"} ·{" "}
              {item.method === "MOBILE_MONEY" ? "Mobile Money" : "Card"}
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-[11px] text-slate-400">
                {formatRelativeTime(item.createdAt)} ·{" "}
                {formatDate(item.createdAt)}
              </Text>
              <Text
                className="max-w-[45%] text-[10px] text-slate-400"
                numberOfLines={1}
              >
                {item.transactionReference}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && !error && summary ? (
            <View className="items-center rounded-3xl border border-slate-100 bg-white px-6 py-10">
              <Ionicons
                name="stats-chart-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-base font-semibold text-slate-800">
                No gifts yet
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                Donations will appear here once giving is active.
              </Text>
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}
