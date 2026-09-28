import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeWorkoutSession, saveWorkoutSetResult, startWorkoutSession, type TodayWorkout } from '@/shared/api/client';
import { theme } from '@/shared/theme';

type WorkoutExercise = {
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  exerciseId?: string | null;
  previousPerformance?:
    | {
        sets?: number | null;
        reps?: number | null;
        weight?: number | null;
        setResults?: Array<{ setNumber?: number | null; reps?: number | null; weight?: number | null }> | null;
      }
    | null;
  suggestedTarget?: { sets: number | null; reps: number | null; weight: number | null } | null;
};

type WorkoutInputState = Record<string, Array<{ reps: string; weight: string }>>;
type ExpandedState = Record<string, boolean>;

function toNumberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildInitialInputs(exercises: WorkoutExercise[]): WorkoutInputState {
  return Object.fromEntries(
    exercises.map(exercise => {
      const plannedSets = Math.max(0, exercise.sets ?? 0);
      const previousSetResults = exercise.previousPerformance?.setResults ?? [];
      const nextValues = Array.from({ length: plannedSets }, (_, index) => {
        const previousSet = previousSetResults[index];
        return {
          reps:
            previousSet?.reps != null
              ? String(previousSet.reps)
              : exercise.previousPerformance?.reps != null
                ? String(exercise.previousPerformance.reps)
                : exercise.reps != null
                  ? String(exercise.reps)
                  : '',
          weight:
            previousSet?.weight != null
              ? String(previousSet.weight)
              : exercise.previousPerformance?.weight != null
                ? String(exercise.previousPerformance.weight)
                : exercise.weight != null
                  ? String(exercise.weight)
                  : '',
        };
      });
      return [exercise.name, nextValues];
    })
  );
}

function buildInitialExpandedState(exercises: WorkoutExercise[]): ExpandedState {
  return Object.fromEntries(exercises.map(exercise => [exercise.name, false]));
}

function formatExerciseHeader(exercise: WorkoutExercise) {
  const sets = exercise.sets != null ? String(exercise.sets) : '—';
  const reps = exercise.reps != null ? String(exercise.reps) : '—';
  return `${exercise.name} — ${sets} × ${reps}`;
}

function formatPreviousPerformanceSummary(exercise: WorkoutExercise) {
  const previousPerformance = exercise.previousPerformance;
  if (!previousPerformance) return null;

  const previousSetResults = previousPerformance.setResults ?? [];
  if (previousSetResults.length > 0) {
    return previousSetResults.map((set, index) => ({
      setNumber: set.setNumber ?? index + 1,
      reps: set.reps,
      weight: set.weight,
    }));
  }

  const plannedSets = Math.max(0, exercise.sets ?? 0);
  if (plannedSets <= 0) return [];

  return Array.from({ length: plannedSets }, (_, index) => ({
    setNumber: index + 1,
    reps: previousPerformance.reps ?? null,
    weight: previousPerformance.weight ?? null,
  }));
}

export function WorkoutDetailScreen({ route, navigation }: any) {
  const queryClient = useQueryClient();
  const workout: TodayWorkout = route?.params?.workout ?? { title: 'Workout', exercises: [] };
  const reviewOnly = Boolean(route?.params?.reviewOnly);
  const routeSessionId: string | undefined = route?.params?.workoutSessionId ?? workout?.workoutSessionId;
  const exercises = useMemo<WorkoutExercise[]>(() => workout?.exercises ?? [], [workout?.exercises]);
  const [inputs, setInputs] = useState<WorkoutInputState>(() => buildInitialInputs(exercises));
  const [expanded, setExpanded] = useState<ExpandedState>(() => buildInitialExpandedState(exercises));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(workout?.status === 'completed');
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(routeSessionId);

  useEffect(() => {
    if (routeSessionId) setActiveSessionId(routeSessionId);
  }, [routeSessionId]);

  useEffect(() => {
    if (workout?.status === 'completed' || reviewOnly) {
      setIsCompleted(true);
    }
  }, [reviewOnly, workout?.status]);

  useEffect(() => {
    setInputs(prev => {
      const next = buildInitialInputs(exercises);
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const sameLength = prevKeys.length === nextKeys.length;
      const sameValues = sameLength && nextKeys.every(key => JSON.stringify(prev[key]) === JSON.stringify(next[key]));
      return sameValues ? prev : next;
    });
    setExpanded(prev => {
      const next = buildInitialExpandedState(exercises);
      return Object.keys(prev).length === Object.keys(next).length ? { ...next, ...prev } : next;
    });
  }, [exercises]);

  const startMutation = useMutation({
    mutationFn: async () => startWorkoutSession(),
    onSuccess: data => {
      const startedSessionId = (data as any)?.workoutSessionId ?? (data as any)?.id;
      if (startedSessionId) setActiveSessionId(startedSessionId);
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      let resolvedSessionId = activeSessionId ?? routeSessionId;

      if (!resolvedSessionId) {
        const startedSession = await startWorkoutSession();
        const startedSessionId = (startedSession as any)?.workoutSessionId ?? (startedSession as any)?.id;
        if (!startedSessionId) throw new Error('Unable to obtain workout session id');
        resolvedSessionId = startedSessionId;
        setActiveSessionId(startedSessionId);
      }

      for (const exercise of exercises) {
        const plannedSets = Math.max(0, exercise.sets ?? 0);
        const exerciseInputs = inputs[exercise.name] ?? [];
        for (let index = 0; index < plannedSets; index += 1) {
          const input = exerciseInputs[index] ?? { reps: '', weight: '' };
          await saveWorkoutSetResult(resolvedSessionId, {
            exerciseName: exercise.name,
            exerciseId: exercise.exerciseId ?? null,
            setNumber: index + 1,
            reps: toNumberOrNull(input.reps),
            weight: toNumberOrNull(input.weight),
          });
        }
      }

      return completeWorkoutSession(resolvedSessionId);
    },
    onSuccess: async () => {
      setIsCompleted(true);
      await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      navigation?.navigate?.('Workout');
    },
    onError: error => {
      Alert.alert('Unable to complete workout', (error as Error)?.message ?? 'Please try again.');
    },
  });

  const handleMarkCompleted = async () => {
    if (reviewOnly || isCompleted || workout?.status === 'completed') return;
    setIsSubmitting(true);
    try {
      await completeMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedState = reviewOnly || isCompleted || workout?.status === 'completed';

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text }}>{workout.title ?? 'Workout'}</Text>
      <Text style={{ color: theme.colors.text }}>{reviewOnly ? 'Read-only review of your completed workout.' : 'Quick logging UI optimized for mobile workouts.'}</Text>

      {!reviewOnly && startMutation.isPending ? (
        <View style={{ paddingVertical: 8 }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        {exercises.map(exercise => {
          const value = inputs[exercise.name] ?? [];
          const isExpanded = expanded[exercise.name] ?? false;
          const previousSetResults = formatPreviousPerformanceSummary(exercise) ?? [];
          const plannedSets = Math.max(0, exercise.sets ?? 0);

          return (
            <View key={exercise.name} style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 16, gap: 10, backgroundColor: theme.colors.surface }}>
              <Pressable onPress={() => setExpanded(prev => ({ ...prev, [exercise.name]: !isExpanded }))} style={{ gap: 6 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{formatExerciseHeader(exercise)}</Text>
                <Text style={{ color: theme.colors.textMuted, backgroundColor: '#ff9102' }}>{isExpanded ? 'Tap to collapse' : 'Tap to expand sets'}</Text>
              </Pressable>

              {exercise.suggestedTarget ? (
                <View style={{ gap: 4 }}>
                  <Text style={{ fontWeight: '700', color: theme.colors.text }}>Suggested Target</Text>
                  <Text style={{ color: theme.colors.text }}>{`${exercise.suggestedTarget.sets ?? '—'} × ${exercise.suggestedTarget.reps ?? '—'}${exercise.suggestedTarget.weight != null ? ` @ ${exercise.suggestedTarget.weight}` : ''}`}</Text>
                </View>
              ) : null}

              {exercise.previousPerformance ? (
                <Text style={{ fontWeight: '700', color: theme.colors.text }}>Previous Performance</Text>
                  ) : (
                    <>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                        <Text style={{ fontWeight: '600', color: theme.colors.text }}>Sets</Text>
                        <Text style={{ color: theme.colors.text }}>{exercise.previousPerformance?.sets != null ? String(exercise.previousPerformance.sets) : '—'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                        <Text style={{ fontWeight: '600', color: theme.colors.text }}>Reps</Text>
                        <Text style={{ color: theme.colors.text }}>{exercise.previousPerformance?.reps != null ? String(exercise.previousPerformance.reps) : '—'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                        <Text style={{ fontWeight: '600', color: theme.colors.text }}>Weight</Text>
                        <Text style={{ color: theme.colors.text }}>{exercise.previousPerformance?.weight != null ? String(exercise.previousPerformance.weight) : '—'}</Text>
                      </View>
                    </>
                  )}
                </View>
              ) : null}

              {isExpanded && !completedState ? (
                <View style={{ gap: 10 }}>
                  {Array.from({ length: plannedSets }, (_, index) => {
                    const setValue = value[index] ?? { reps: '', weight: '' };
                    return (
                      <View key={`${exercise.name}-set-${index + 1}`} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, gap: 8, backgroundColor: theme.colors.background }}>
                        <Text style={{ fontWeight: '700', color: theme.colors.text }}>Set {index + 1}</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TextInput
                            value={setValue.reps}
                            onChangeText={text =>
                              setInputs(prev => ({
                                ...prev,
                                [exercise.name]: Array.from({ length: plannedSets }, (_, setIndex) => prev[exercise.name]?.[setIndex] ?? { reps: '', weight: '' }).map((item, setIndex) =>
                                  setIndex === index ? { ...item, reps: text } : item
                                ),
                              }))
                            }
                            placeholder='Reps'
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType='numeric'
                            style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16 }}
                          />
                          <TextInput
                            value={setValue.weight}
                            onChangeText={text =>
                              setInputs(prev => ({
                                ...prev,
                                [exercise.name]: Array.from({ length: plannedSets }, (_, setIndex) => prev[exercise.name]?.[setIndex] ?? { reps: '', weight: '' }).map((item, setIndex) =>
                                  setIndex === index ? { ...item, weight: text } : item
                                ),
                              }))
                            }
                            placeholder='Weight'
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType='numeric'
                            style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16 }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {completedState ? <Text style={{ color: theme.colors.textMuted }}>Workout completed. Set inputs are locked for review.</Text> : null}
            </View>
          );
        })}
      </View>

      {completedState ? (
        <View style={{ backgroundColor: theme.colors.success, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.success }}>
          <Text style={{ color: '#166534', textAlign: 'center', fontWeight: '800', fontSize: 16 }}>Workout Completed</Text>
        </View>
      ) : (
        <Pressable onPress={handleMarkCompleted} disabled={isSubmitting || completeMutation.isPending} style={{ backgroundColor: theme.colors.primaryDark, padding: 18, borderRadius: 16, opacity: isSubmitting ? 0.7 : 1 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>{isSubmitting || completeMutation.isPending ? 'Saving...' : 'Mark Complete'}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
