import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/shared/store';
import { logout } from '@/features/auth/authSlice';
import { getCompletedPlans, getMe, MeProfile } from '@/shared/api/client';
import { theme } from '@/shared/theme';

function formatDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
}

function normalizeCompletedPlan(plan: any) {
  return {
    id: plan?.id,
    name: plan?.name ?? plan?.title ?? 'Completed Plan',
    completedAt: plan?.completedAt ?? plan?.completed_at ?? plan?.finishedAt ?? plan?.finished_at ?? plan?.endedAt ?? plan?.ended_at ?? plan?.completedDate ?? plan?.completed_date,
  };
}

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [completedPlansFromApi, setCompletedPlansFromApi] = useState<Array<{ id?: string; name?: string; completedAt?: string }>>([]);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const [me, completedPlans] = await Promise.all([getMe(), getCompletedPlans().catch(() => [])]);
          if (!mounted) return;
          setProfile(me);
          setCompletedPlansFromApi((completedPlans ?? []).map(normalizeCompletedPlan));
        } catch {
          if (!mounted) return;
          setProfile(null);
          setCompletedPlansFromApi([]);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const displayUser = profile ?? user;
  const activePlan = displayUser?.activePlan ?? null;
  const completedPlans = useMemo(() => {
    if (completedPlansFromApi.length) return completedPlansFromApi;
    return (displayUser?.completedPlans ?? []).map(normalizeCompletedPlan);
  }, [completedPlansFromApi, displayUser?.completedPlans]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text }}>Profile</Text>
      <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 6, borderWidth: 1, borderColor: theme.colors.border }}>
        <Text style={{ fontWeight: '700', fontSize: 18, color: theme.colors.text }}>{displayUser?.displayName ?? 'Athlete'}</Text>
        <Text style={{ color: theme.colors.text }}>{displayUser?.email ?? ''}</Text>
        <Text style={{ color: theme.colors.text }}>Active plan: {activePlan?.name ?? 'No active plan'}</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, gap: 8, backgroundColor: theme.colors.surface }}>
        <Text style={{ fontWeight: '700', color: theme.colors.text }}>Completed Plans</Text>
        {completedPlans.length ? completedPlans.map((plan, index) => {
          const completedAt = formatDate(plan.completedAt);
          return <Text key={`${plan.id ?? plan.name ?? 'plan'}-${index}`} style={{ color: theme.colors.text }}>{plan.name ?? 'Completed Plan'}{completedAt ? ` — ${completedAt}` : ''}</Text>;
        }) : <Text style={{ color: theme.colors.textMuted }}>No completed plans yet.</Text>}
      </View>
      <Pressable onPress={() => dispatch(logout() as any)} style={{ backgroundColor: theme.colors.danger, padding: 16, borderRadius: 16 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}
