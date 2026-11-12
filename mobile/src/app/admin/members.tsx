import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  _count: {
    announcements: number;
    donations: number;
    departments: number;
  };
}

export default function AdminMembersScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role === "admin");
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadMembers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await apiRequest<AdminMember[]>("/api/admin/members");
      setMembers(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load the member directory.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      void loadMembers();
    }, [loadMembers]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return members;
    }

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(value) ||
        member.email.toLowerCase().includes(value),
    );
  }, [members, query]);

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
          You do not have permission to view the member directory.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-slate-50">
      <FlatList
        data={filtered}
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
            <View className="flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4">
              <Ionicons name="search" size={18} color={theme.colors.muted} />
              <TextInput
                className="flex-1 py-3 text-sm text-slate-800"
                placeholder="Search by name or email"
                placeholderTextColor={theme.colors.muted}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {query ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setQuery("")}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.colors.muted}
                  />
                </Pressable>
              ) : null}
            </View>
            <Text className="mt-3 text-xs text-slate-500">
              {filtered.length} {filtered.length === 1 ? "member" : "members"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center rounded-2xl border border-slate-100 bg-white p-4">
            <Avatar name={item.name} size={44} />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Text
                  className="flex-1 text-sm font-semibold text-slate-900"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.role === "ADMIN" ? (
                  <View className="rounded-full bg-brand-50 px-2 py-0.5">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      Admin
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={1}>
                {item.email}
              </Text>
              <Text className="mt-1 text-[11px] text-slate-400">
                Joined {formatDate(item.createdAt)} ·{" "}
                {item._count.departments}{" "}
                {item._count.departments === 1 ? "department" : "departments"}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={theme.colors.brand} />
              <Text className="mt-3 text-sm text-slate-500">
                Loading members...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center rounded-3xl border border-slate-100 bg-white px-6 py-10">
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
                  void loadMembers();
                }}
                className="mt-4 rounded-full bg-brand-600 px-5 py-2.5"
              >
                <Text className="text-sm font-semibold text-white">
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center rounded-3xl border border-slate-100 bg-white px-6 py-10">
              <Ionicons
                name="people-outline"
                size={30}
                color={theme.colors.muted}
              />
              <Text className="mt-3 text-base font-semibold text-slate-800">
                No members found
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                Try a different search.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
