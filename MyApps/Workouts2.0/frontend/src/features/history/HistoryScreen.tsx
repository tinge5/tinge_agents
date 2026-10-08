import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { getWorkoutHistory, WorkoutHistorySession } from '@/shared/api/client';
import { theme } from '@/shared/theme';

type HistoryState = { workouts: WorkoutHistorySession[] };

type WorkoutGroup = {
  key: string;
  title: string;
  sessions: WorkoutHistorySession[];
};

type GroupedHistorySet = {
  exerciseName: string;
  setResults: WorkoutHistorySession['setResults'];
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

function getWorkoutTitle(workout: WorkoutHistorySession) {
  return workout.workoutName || workout.dayName || 'Completed workout';
}

function groupWorkouts(workouts: WorkoutHistorySession[]): WorkoutGroup[] {
  const grouped = new Map<string, WorkoutGroup>();

  for (const workout of workouts) {
    const key = [
      workout.planName ?? '',
      workout.workoutName ?? '',
    ].join('||');

    const existing = grouped.get(key);

    if (existing) {
      existing.sessions.push(workout);
    } else {
      grouped.set(key, {
        key,
        title: getWorkoutTitle(workout),
        sessions: [workout],
      });
    }
  }

  return Array.from(grouped.values())
    .map(group => ({
      ...group,
      sessions: [...group.sessions].sort(
        (a, b) =>
          new Date(b.completedAt ?? 0).getTime() -
          new Date(a.completedAt ?? 0).getTime()
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.sessions[0]?.completedAt ?? 0).getTime() -
        new Date(a.sessions[0]?.completedAt ?? 0).getTime()
    );
}

function groupHistorySetResults(setResults: WorkoutHistorySession['setResults'] = []): GroupedHistorySet[] {
  const map = new Map<string, GroupedHistorySet>();

  for (const setResult of setResults.slice().sort((a, b) => {
    if (a.exerciseName === b.exerciseName) return a.setNumber - b.setNumber;
    return a.exerciseName.localeCompare(b.exerciseName);
  })) {
    const existing = map.get(setResult.exerciseName);
    if (existing) {
      existing.setResults = [...existing.setResults, setResult].sort((a, b) => a.setNumber - b.setNumber);
    } else {
      map.set(setResult.exerciseName, { exerciseName: setResult.exerciseName, setResults: [setResult] });
    }
  }

  return Array.from(map.values());
}

function formatSetLine(setResult: WorkoutHistorySession['setResults'][number], index: number) {
  const reps = `${setResult.reps} reps`;
  const weight = `${setResult.weight} lbs`;
  return setResult.reps > 0 || setResult.weight > 0 ? `Set ${index + 1}: ${setResult.reps > 0 ? `${reps}` : ''} ${setResult.weight > 0 ? ` × ${weight}` : ''}` : '';
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

 useFocusEffect(
  useCallback(() => {
    let active = true;

    const load = async () => {
      try {
        setError(null);
        const data = await getWorkoutHistory();

        if (active) {
          setHistory({
            workouts: Array.isArray(data) ? data : [],
          });
        }
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error ? e.message : 'Failed to load history'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [])
);

  const workouts = useMemo(() => history.workouts ?? [], [history]);
  const groupedWorkouts = useMemo(() => groupWorkouts(workouts), [workouts]);
  const selectedGroup = useMemo(() => groupedWorkouts.find(group => group.key === selectedGroupKey) ?? groupedWorkouts[0] ?? null, [groupedWorkouts, selectedGroupKey]);

  useEffect(() => {
    if (!selectedGroupKey && groupedWorkouts.length > 0) {
      setSelectedGroupKey(groupedWorkouts[0].key);
    } else if (selectedGroupKey && !groupedWorkouts.some(group => group.key === selectedGroupKey)) {
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
            {groupedWorkouts.map(group => {
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
                {selectedGroup.sessions.map(workout => {
                  const groupedSetResults = groupHistorySetResults(workout.setResults);
                  return (
                    <View key={workout.id} style={{ gap: 10, padding: 14, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, backgroundColor: theme.colors.background }}>
                      <View style={{ gap: 2 }}>
                        <Text style={{ fontWeight: '700', color: theme.colors.text }}>{workout.workoutName}</Text>
                        <Text style={{ color: theme.colors.textMuted }}>{workout.planName}{workout.weekIndex != null ? ` • Week ${workout.weekIndex + 1}` : ''}{workout.dayOfWeek != null ? ` • Day ${workout.dayOfWeek + 1}` : ''}</Text>
                        <Text style={{ color: theme.colors.textMuted }}>{formatDate(workout.completedAt)}{formatTime(workout.completedAt) ? ` • ${formatTime(workout.completedAt)}` : ''}</Text>
                      </View>

                      <View style={{ gap: 10 }}>
                        {groupedSetResults.length ? groupedSetResults.map(group => (
                          <View key={`${workout.id}-${group.exerciseName}`} style={{ gap: 4 }}>
                            <Text style={{ fontWeight: '600', color: theme.colors.text }}>{group.exerciseName}</Text>
                            <View style={{ gap: 2 }}>
                              {group.setResults.map((setResult, index) => (
                                <Text key={setResult.id} style={{ color: theme.colors.textMuted }}>{formatSetLine(setResult, index)}</Text>
                              ))}
                            </View>
                          </View>
                        )) : <Text style={{ color: theme.colors.textMuted }}>No set results recorded for this workout.</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}
