import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/shared/store';
import { logout } from '@/features/auth/authSlice';
import { getCompletedPlans, getMe, getWorkoutHistory, MeProfile } from '@/shared/api/client';
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
  if (ratio >= 0.9) return { label: 'On track', color: theme.colors.success, background: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.45)' };
  if (ratio >= 0.6) return { label: 'Slightly behind', color: theme.colors.warning, background: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.45)' };
  return { label: 'Needs catch-up', color: theme.colors.danger, background: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.45)' };
}

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [completedPlansFromApi, setCompletedPlansFromApi] = useState<Array<{ id?: string; name?: string; completedAt?: string }>>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Array<{ id?: string; date?: string; title?: string; status?: string; originalPlanId?: string | null; planName?: string | null }>>([]);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const [me, completedPlans, history] = await Promise.all([
            getMe(),
            getCompletedPlans().catch(() => []),
            getWorkoutHistory().catch(() => []),
          ]);
          if (!mounted) return;
          setProfile(me);
          setCompletedPlansFromApi((completedPlans ?? []).map(normalizeCompletedPlan));
          setWorkoutHistory((history ?? []).map((entry) => ({
            id: entry?.id ?? entry?.workoutSessionId,
            date: entry?.completedAt,
            title: entry?.workoutName ?? entry?.dayName,
            status: 'completed',
            originalPlanId: entry?.originalPlanId ?? null,
            planName: entry?.planName ?? null,
          })));
        } catch {
          if (!mounted) return;
          setProfile(null);
          setCompletedPlansFromApi([]);
          setWorkoutHistory([]);
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

  const historyEntries = useMemo(() => {
    const list = workoutHistory.length ? workoutHistory : (displayUser?.workoutHistory ?? []);
    return list.filter(Boolean).map((entry) => ({
      id: entry?.id,
      date: entry?.date,
      title: entry?.title,
      status: entry?.status,
      originalPlanId: entry?.originalPlanId ?? null,
      planName: entry?.planName ?? null,
    }));
  }, [displayUser?.workoutHistory, workoutHistory]);

  const activePlanHistory = useMemo(() => {
    if (!activePlan) return [];
    const planStart = activePlan.startDate ? new Date(activePlan.startDate) : new Date(activePlan.createdAt ?? Date.now());
    const durationWeeks = Math.max(1, Number(activePlan.durationWeeks ?? 1));
    const effectiveEnd = new Date(planStart);
    effectiveEnd.setDate(planStart.getDate() + (durationWeeks * 7));

    return historyEntries.filter((entry) => {
      if (!entry.date) return false;
      const completedAt = new Date(entry.date);
      if (Number.isNaN(completedAt.getTime())) return false;
      if (entry.originalPlanId && activePlan.id) {
        if (entry.originalPlanId === activePlan.id) return true;
      }
      if (entry.planName && activePlan.name) {
        if (entry.planName === activePlan.name) return true;
      }
      return completedAt >= planStart && completedAt <= effectiveEnd;
    });
  }, [activePlan, historyEntries]);

  const planWeeks = useMemo(() => {
    if (!activePlan) {
      return [] as Array<{ key: string; label: string; planned: number; completed: number }>;
    }

    const planStart = activePlan.startDate ? new Date(activePlan.startDate) : new Date(activePlan.createdAt ?? Date.now());
    if (Number.isNaN(planStart.getTime())) {
      return [] as Array<{ key: string; label: string; planned: number; completed: number }>;
    }

    const durationWeeks = Math.max(1, Number(activePlan.durationWeeks ?? 1));
    const plannedByWeek = new Map<number, number>();
    if (Array.isArray(activePlan.days) && activePlan.days.length) {
      for (const day of activePlan.days) {
        const weekIndex = Number(day?.weekIndex ?? 0);
        if (!Number.isFinite(weekIndex)) continue;
        plannedByWeek.set(weekIndex, (plannedByWeek.get(weekIndex) ?? 0) + 1);
      }
    }

    const completedByWeek = new Map<number, number>();
    for (const item of activePlanHistory) {
      if (!item.date) continue;
      const parsed = new Date(item.date);
      if (Number.isNaN(parsed.getTime())) continue;
      const diffDays = Math.floor((parsed.getTime() - planStart.getTime()) / (24 * 60 * 60 * 1000));
      const weekIndex = Math.max(0, Math.min(durationWeeks - 1, Math.floor(diffDays / 7)));
      completedByWeek.set(weekIndex, (completedByWeek.get(weekIndex) ?? 0) + 1);
    }

    const rows: Array<{ key: string; label: string; planned: number; completed: number }> = [];
    for (let weekIndex = 0; weekIndex < durationWeeks; weekIndex += 1) {
      rows.push({
        key: `week-${weekIndex}`,
        label: `W${weekIndex + 1}`,
        planned: Math.max(1, plannedByWeek.get(weekIndex) ?? 1),
        completed: completedByWeek.get(weekIndex) ?? 0,
      });
    }

    return rows;
  }, [activePlan, activePlanHistory]);

  const plannedPerWeek = useMemo(() => {
    if (planWeeks.length) return Math.max(1, Math.max(...planWeeks.map((week) => week.planned)));
    return 4;
  }, [planWeeks]);

  const weeklyProgress = useMemo(() => {
    const rows = planWeeks.length ? planWeeks : [];
    return rows.map((week) => {
      const ratio = Math.min(1, week.completed / Math.max(1, week.planned));
      const status = getWeeklyStatus(week.completed, week.planned);
      return {
        label: week.label,
        completed: week.completed,
        planned: week.planned,
        color: status.color,
        background: status.background,
        border: status.border,
        status: status.label,
        fillRatio: ratio,
      };
    });
  }, [planWeeks]);

  const summary = useMemo(() => {
    const totalCompleted = weeklyProgress.reduce((sum, item) => sum + item.completed, 0);
    const totalPlanned = weeklyProgress.reduce((sum, item) => sum + item.planned, 0);
    const ratio = totalPlanned > 0 ? totalCompleted / totalPlanned : 0;
    const status = ratio >= 0.9 ? { label: 'On track', color: theme.colors.success, background: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.45)' } : ratio >= 0.6 ? { label: 'Slightly behind', color: theme.colors.warning, background: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.45)' } : { label: 'Needs catch-up', color: theme.colors.danger, background: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.45)' };
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

      {activePlan ? (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, gap: 12, backgroundColor: theme.colors.surface }}>
          <Text style={{ fontWeight: '700', color: theme.colors.text }}>Workout Progress</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: summary.status.background, borderWidth: 1, borderColor: summary.status.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
            <View>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700' }}>{summary.totalCompleted} / {summary.totalPlanned} workouts</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Current plan</Text>
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
      ) : (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface }}>
          <Text style={{ color: theme.colors.textMuted }}>No active plan. Add or activate a plan to track workouts.</Text>
        </View>
      )}

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
