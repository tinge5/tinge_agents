import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { getWorkoutHistory, WorkoutHistorySession } from '@/shared/api/client';
import { theme } from '@/shared/theme';

type HistoryState = { workouts: WorkoutHistorySession[] };

type WorkoutGroup = {
  key: string;
  title: string;
  sessions: WorkoutHistorySession[];
};

function formatDate(value?: string) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatSetResult(setResult: WorkoutHistorySession['setResults'][number]) {
  const status = setResult.completed ? 'completed' : 'not completed';
  const reps = `${setResult.reps} reps`;
  const weight = `${setResult.weight} lbs`;
  return `Set ${setResult.setNumber}: ${reps} × ${weight} • ${status}`;
}

function getWorkoutTitle(workout: WorkoutHistorySession) {
  return workout.workoutName || workout.dayName || 'Completed workout';
}

function groupWorkouts(workouts: WorkoutHistorySession[]) {
  return workouts
    .map((workout) => ({ key: workout.id, title: getWorkoutTitle(workout), sessions: [workout] }))
    .sort((a, b) => new Date(b.sessions[0]?.completedAt ?? 0).getTime() - new Date(a.sessions[0]?.completedAt ?? 0).getTime());
}

export function HistoryScreen() {
  const [history, setHistory] = useState<HistoryState>({ workouts: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setError(null);
      const data = await getWorkoutHistory();
      setHistory({ workouts: Array.isArray(data) ? data : [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history');
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError(null);
        const data = await getWorkoutHistory();
        if (active) setHistory({ workouts: Array.isArray(data) ? data : [] });
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load history');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const workouts = useMemo(() => history.workouts ?? [], [history]);
  const groupedWorkouts = useMemo(() => groupWorkouts(workouts), [workouts]);
  const selectedGroup = useMemo(() => groupedWorkouts.find((group) => group.key === selectedGroupKey) ?? groupedWorkouts[0] ?? null, [groupedWorkouts, selectedGroupKey]);

  useEffect(() => {
    if (!selectedGroupKey && groupedWorkouts.length > 0) {
      setSelectedGroupKey(groupedWorkouts[0].key);
    } else if (selectedGroupKey && !groupedWorkouts.some((group) => group.key === selectedGroupKey)) {
      setSelectedGroupKey(groupedWorkouts[0]?.key ?? null);
    }
  }, [groupedWorkouts, selectedGroupKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHistory();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text }}>History</Text>

      {loading ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface }}>
          <Text style={{ fontWeight: '700', marginBottom: 4, color: theme.colors.text }}>Unable to load history</Text>
          <Text style={{ color: theme.colors.text }}>{error}</Text>
        </View>
      ) : workouts.length === 0 ? (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface }}>
          <Text style={{ fontWeight: '700', marginBottom: 4, color: theme.colors.text }}>No completed workouts yet</Text>
          <Text style={{ color: theme.colors.textMuted }}>Your completed workout snapshots will appear here once you finish one.</Text>
        </View>
      ) : (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, gap: 12, backgroundColor: theme.colors.surface }}>
          <Text style={{ fontWeight: '700', color: theme.colors.text }}>Completed Workouts</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {groupedWorkouts.map((group) => {
              const isSelected = group.key === selectedGroup?.key;
              return (
                <Pressable key={group.key} onPress={() => setSelectedGroupKey(group.key)} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: isSelected ? theme.colors.primary : theme.colors.border, backgroundColor: isSelected ? theme.colors.primary : theme.colors.background }}>
                  <Text style={{ fontWeight: '700', color: isSelected ? '#ffffff' : theme.colors.text }}>{group.title}</Text>
                  <Text style={{ color: isSelected ? '#fed7aa' : theme.colors.textMuted, fontSize: 12 }}>{group.sessions.length} {group.sessions.length === 1 ? 'session' : 'sessions'}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedGroup ? (
            <View style={{ gap: 12 }}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text }}>{selectedGroup.title}</Text>
              </View>

              <View style={{ gap: 12 }}>
                {selectedGroup.sessions.map((workout) => (
                  <View key={workout.id} style={{ gap: 10, padding: 14, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, backgroundColor: theme.colors.background }}>
                    <View style={{ gap: 2 }}>
                      <Text style={{ fontWeight: '700', color: theme.colors.text }}>{workout.workoutName}</Text>
                      <Text style={{ color: theme.colors.textMuted }}>{workout.planName}{workout.weekIndex != null ? ` • Week ${workout.weekIndex + 1}` : ''}{workout.dayOfWeek != null ? ` • Day ${workout.dayOfWeek + 1}` : ''}</Text>
                      <Text style={{ color: theme.colors.textMuted }}>{formatDate(workout.completedAt)}{formatTime(workout.completedAt) ? ` • ${formatTime(workout.completedAt)}` : ''}</Text>
                    </View>

                    <View style={{ gap: 10 }}>
                      {workout.setResults.length ? workout.setResults.slice().sort((a, b) => a.setNumber - b.setNumber).map((setResult) => (
                        <View key={setResult.id} style={{ gap: 2 }}>
                          <Text style={{ fontWeight: '600', color: theme.colors.text }}>{setResult.exerciseName}</Text>
                          <Text style={{ color: theme.colors.textMuted }}>{formatSetResult(setResult)}</Text>
                        </View>
                      )) : <Text style={{ color: theme.colors.textMuted }}>No set results recorded for this workout.</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}
