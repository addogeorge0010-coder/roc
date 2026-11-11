import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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

import { ScreenHeader } from "@/components/ScreenHeader";
import { theme } from "@/constants/theme";
import { ApiError, apiRequest } from "@/lib/api";
import type { Department } from "@/types";

interface DepartmentCardProps {
  department: Department;
  onPress: () => void;
}

function DepartmentCard({ department, onPress }: DepartmentCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open department: ${department.name}`}
      onPress={onPress}
      className="rounded-3xl border border-slate-100 bg-white p-5"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-50">
              <Ionicons
                name="people-outline"
                size={19}
                color={theme.colors.brand}
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text
                  className="flex-1 text-lg font-bold text-slate-900"
                  numberOfLines={1}
                >
                  {department.name}
                </Text>
                {department.isMember ? (
                  <View className="rounded-full bg-brand-50 px-2 py-0.5">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      Joined
                    </Text>
                  </View>
                ) : null}
              </View>

              {department.description ? (
                <Text
                  className="mt-1 text-sm leading-5 text-slate-500"
                  numberOfLines={2}
                >
                  {department.description}
                </Text>
              ) : null}

              <View className="mt-3 flex-row items-center gap-4">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="people"
                    size={14}
                    color={theme.colors.muted}
                  />
                  <Text className="text-xs font-medium text-slate-500">
                    {department._count.members}{" "}
                    {department._count.members === 1 ? "member" : "members"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="megaphone-outline"
                    size={14}
                    color={theme.colors.muted}
                  />
                  <Text className="text-xs font-medium text-slate-500">
                    {department._count.announcements}{" "}
                    {department._count.announcements === 1
                      ? "update"
                      : "updates"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>
    </Pressable>
  );
}

export default function DepartmentsScreen() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = useCallback(async () => {
    try {
      setError(null);

      const data = await apiRequest<Department[]>("/api/departments");

      setDepartments(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load departments. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDepartments();
    }, [loadDepartments]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDepartments();
    setRefreshing(false);
  }, [loadDepartments]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    void loadDepartments();
  }, [loadDepartments]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      <FlatList
        data={departments}
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
          <View>
            <ScreenHeader
              eyebrow="Community"
              title="Departments"
              subtitle="Find your place, grow in faith, and serve alongside others."
            />

            {error && departments.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry loading departments"
                onPress={handleRetry}
                className="mb-4 mt-1 flex-row items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5"
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={theme.colors.gold}
                />
                <Text className="flex-1 text-xs font-medium text-amber-700">
                  {error} Tap to retry.
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <DepartmentCard
            department={item}
            onPress={() =>
              router.push({
                pathname: "/department/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={theme.colors.brand} />
              <Text className="mt-3 text-sm text-slate-500">
                Loading departments...
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
                onPress={handleRetry}
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
                No departments yet
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                Departments will appear here once they are created.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          departments.length > 0 ? (
            <Text className="mt-5 text-center text-xs text-slate-400">
              Tap a department to see updates and join
            </Text>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}
