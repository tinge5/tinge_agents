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

function getWeekStart(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return start;
}

function getWeekLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getWeeklyStatus(completed: number, planned: number) {
  const target = Math.max(1, planned);
  const ratio = completed / target;
  if (ratio >= 0.8) return { label: 'On track', color: theme.colors.success, background: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.45)' };
  if (ratio >= 0.5) return { label: 'Slightly behind', color: theme.colors.warning, background: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.45)' };
  return { label: 'Needs catch-up', color: theme.colors.danger, background: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.45)' };
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

  const workoutHistory = useMemo(() => {
    const list = displayUser?.workoutHistory ?? [];
    return list.filter(Boolean).map((entry) => ({
      id: entry?.id,
      date: entry?.date,
      title: entry?.title,
      status: entry?.status,
    }));
  }, [displayUser?.workoutHistory]);

  const plannedPerWeek = useMemo(() => {
    const directTarget = Number((activePlan as any)?.weeklyTarget ?? (activePlan as any)?.workoutsPerWeek ?? (activePlan as any)?.plannedWorkoutsPerWeek ?? 0);
    if (directTarget > 0) return directTarget;
    if (!workoutHistory.length) return 3;
    return Math.max(2, Math.min(5, Math.round(workoutHistory.length / 6)));
  }, [activePlan, workoutHistory.length]);

  const weeklyProgress = useMemo(() => {
    const weekMap = new Map<string, number>();
    for (const workout of workoutHistory) {
      if (!workout.date) continue;
      const parsed = new Date(workout.date);
      if (Number.isNaN(parsed.getTime())) continue;
      const start = getWeekStart(parsed);
      const key = start.toISOString();
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const anchor = getWeekStart(now);
    const rows: Array<{ label: string; completed: number; planned: number; color: string; background: string; border: string; status: string; fillRatio: number }> = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const weekStart = new Date(anchor);
      weekStart.setDate(anchor.getDate() - (offset * 7));
      const key = weekStart.toISOString();
      const completed = weekMap.get(key) ?? 0;
      const planned = Math.max(1, plannedPerWeek);
      const status = getWeeklyStatus(completed, planned);
      rows.push({
        label: getWeekLabel(weekStart),
        completed,
        planned,
        color: status.color,
        background: status.background,
        border: status.border,
        status: status.label,
        fillRatio: Math.min(1, completed / planned),
      });
    }

    return rows;
  }, [plannedPerWeek, workoutHistory]);

  const summary = useMemo(() => {
    const totalCompleted = weeklyProgress.reduce((sum, item) => sum + item.completed, 0);
    const totalPlanned = weeklyProgress.reduce((sum, item) => sum + item.planned, 0);
    const ratio = totalPlanned > 0 ? totalCompleted / totalPlanned : 0;
    const status = ratio >= 0.8 ? { label: 'On track', color: theme.colors.success, background: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.45)' } : ratio >= 0.5 ? { label: 'Slightly behind', color: theme.colors.warning, background: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.45)' } : { label: 'Needs catch-up', color: theme.colors.danger, background: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.45)' };
    return { totalCompleted, totalPlanned, ratio, status };
  }, [weeklyProgress]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text }}>Profile</Text>
      <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 6, borderWidth: 1, borderColor: theme.colors.border }}>
        <Text style={{ fontWeight: '700', fontSize: 18, color: theme.colors.text }}>{displayUser?.displayName ?? 'Athlete'}</Text>
        <Text style={{ color: theme.colors.text }}>{displayUser?.email ?? ''}</Text>
        <Text style={{ color: theme.colors.text }}>Active plan: {activePlan?.name ?? 'No active plan'}</Text>
      </View>

      <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, gap: 12, backgroundColor: theme.colors.surface }}>
        <Text style={{ fontWeight: '700', color: theme.colors.text }}>Workout Progress</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: summary.status.background, borderWidth: 1, borderColor: summary.status.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
          <View>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700' }}>{summary.totalCompleted} / {summary.totalPlanned} workouts</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Last 6 weeks</Text>
          </View>
          <View style={{ backgroundColor: summary.status.color, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
            <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>{summary.status.label}</Text>
          </View>
        </View>

        {weeklyProgress.length ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, minHeight: 120 }}>
            {weeklyProgress.map((week, index) => (
              <View key={`${week.label}-${index}`} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: '600' }}>{week.completed}/{week.planned}</Text>
                <View style={{ width: '100%', maxWidth: 28, height: 80, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden', justifyContent: 'flex-end' }}>
                  <View style={{ height: `${Math.max(6, week.fillRatio * 100)}%`, backgroundColor: week.color, borderRadius: 10 }} />
                </View>
                <Text style={{ color: theme.colors.textMuted, fontSize: 9 }}>{week.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: theme.colors.textMuted }}>Complete a workout to start tracking your progress.</Text>
        )}
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
