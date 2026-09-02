import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { getWorkoutHistory, WorkoutHistorySession } from '@/shared/api/client';

type HistoryState = {
  workouts: WorkoutHistorySession[];
};

type WorkoutGroup = {
  key: string;
  title: string;
  planDayId: string;
  planId?: string;
  sessions: WorkoutHistorySession[];
};

function formatDate(value?: string) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatSet(weight?: number | null, reps?: number | null) {
  const weightText = weight != null ? `${weight} lbs` : '- lbs';
  const repsText = reps != null ? `${reps} reps` : '- reps';
  return `${weightText} × ${repsText}`;
}

function getWorkoutTitle(workout: WorkoutHistorySession) {
  return (
    workout.workoutName ||
    workout.workoutTitle ||
    workout.planDay?.title ||
    workout.planDay?.name ||
    workout.plan?.name ||
    'Completed workout'
  );
}

function getPlanDayId(workout: WorkoutHistorySession) {
  return workout.planDay?.id || 'unknown-plan-day';
}

function getGroupKey(workout: WorkoutHistorySession) {
  return `${getPlanDayId(workout)}::${workout.plan?.id || 'unknown-plan'}`;
}

function getSessionKey(workout: WorkoutHistorySession, index: number) {
  return workout.id ?? `${workout.completedAt}-${index}`;
}

function groupWorkouts(workouts: WorkoutHistorySession[]) {
  const groups = new Map<string, WorkoutGroup>();

  workouts.forEach((workout) => {
    const key = getGroupKey(workout);
    const existing = groups.get(key);
    if (existing) {
      existing.sessions.push(workout);
      return;
    }

    groups.set(key, {
      key,
      title: getWorkoutTitle(workout),
      planDayId: getPlanDayId(workout),
      planId: workout.plan?.id,
      sessions: [workout],
    });
  });

  return Array.from(groups.values()).sort((a, b) => {
    const aTime = new Date(a.sessions[0]?.completedAt ?? 0).getTime();
    const bTime = new Date(b.sessions[0]?.completedAt ?? 0).getTime();
    return bTime - aTime;
  }).map((group) => ({
    ...group,
    sessions: [...group.sessions].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
  }));
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
      const workouts = Array.isArray(data) ? data : [];
      setHistory({ workouts });
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
  const selectedGroup = useMemo(
    () => groupedWorkouts.find((group) => group.key === selectedGroupKey) ?? groupedWorkouts[0] ?? null,
    [groupedWorkouts, selectedGroupKey]
  );

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
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 28, fontWeight: '800' }}>History</Text>

      {loading ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16 }}>
          <Text style={{ fontWeight: '700', marginBottom: 4 }}>Unable to load history</Text>
          <Text>{error}</Text>
        </View>
      ) : workouts.length === 0 ? (
        <View style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16 }}>
          <Text style={{ fontWeight: '700', marginBottom: 4 }}>No completed workouts yet</Text>
          <Text style={{ color: '#64748b' }}>
            Your completed workout sessions will appear here once you finish one.
          </Text>
        </View>
      ) : (
        <View style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, gap: 12 }}>
          <Text style={{ fontWeight: '700' }}>Completed Workouts</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {groupedWorkouts.map((group) => {
              const isSelected = group.key === selectedGroup?.key;
              return (
                <Pressable
                  key={group.key}
                  onPress={() => setSelectedGroupKey(group.key)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: isSelected ? '#0f172a' : '#cbd5e1',
                    backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: isSelected ? '#ffffff' : '#0f172a' }}>
                    {group.title}
                  </Text>
                  <Text style={{ color: isSelected ? '#e2e8f0' : '#64748b', fontSize: 12 }}>
                    {group.sessions.length} {group.sessions.length === 1 ? 'session' : 'sessions'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedGroup ? (
            <View style={{ gap: 12 }}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: '800' }}>{selectedGroup.title}</Text>
                <Text style={{ color: '#64748b' }}>
                  {selectedGroup.sessions.length} completed {selectedGroup.sessions.length === 1 ? 'session' : 'sessions'}
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                {selectedGroup.sessions.map((workout, index) => {
                  const groupedSets = (workout.setResults ?? []).reduce<Record<string, WorkoutHistorySession['setResults']>>(
                    (acc, setResult) => {
                      const exerciseName = setResult.exerciseName || 'Exercise';
                      if (!acc[exerciseName]) acc[exerciseName] = [];
                      acc[exerciseName]!.push(setResult);
                      return acc;
                    },
                    {}
                  );

                  const exerciseNames = Object.keys(groupedSets);
                  return (
                    <View
                      key={getSessionKey(workout, index)}
                      style={{
                        gap: 10,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        borderRadius: 14,
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <View style={{ gap: 2 }}>
                        <Text style={{ fontWeight: '700' }}>{getWorkoutTitle(workout)}</Text>
                        <Text style={{ color: '#64748b' }}>
                          {formatDate(workout.completedAt)}
                          {formatTime(workout.completedAt) ? ` • ${formatTime(workout.completedAt)}` : ''}
                        </Text>
                      </View>

                      {exerciseNames.length ? (
                        <View style={{ gap: 10 }}>
                          {exerciseNames.map((exerciseName) => {
                            const setResult = [...(groupedSets[exerciseName] ?? [])].sort(
                              (a, b) => (a.setNumber ?? 0) - (b.setNumber ?? 0)
                            )[0];

                            return (
                              <View key={`${workout.id ?? workout.completedAt}-${exerciseName}`} style={{ gap: 4 }}>
                                <Text style={{ fontWeight: '600' }}>{exerciseName}</Text>
                                <Text style={{ color: '#475569' }}>
                                  {setResult ? formatSet(setResult.weight, setResult.reps) : 'No recorded sets'}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={{ color: '#64748b' }}>No set results recorded for this workout.</Text>
                      )}
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
