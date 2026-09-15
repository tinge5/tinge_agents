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
  previousPerformance?: { sets?: number | null; reps?: number | null; weight?: number | null } | null;
};

type WorkoutInputState = Record<string, { sets: string; reps: string; weight: string }>;

function toNumberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildInitialInputs(exercises: WorkoutExercise[]): WorkoutInputState {
  return Object.fromEntries(
    exercises.map(exercise => [
      exercise.name,
      {
        sets: exercise.sets != null ? String(exercise.sets) : '',
        reps: exercise.reps != null ? String(exercise.reps) : '',
        weight: exercise.weight != null ? String(exercise.weight) : '',
      },
    ])
  );
}

export function WorkoutDetailScreen({ route, navigation }: any) {
  const queryClient = useQueryClient();
  const workout: TodayWorkout = route?.params?.workout ?? { title: 'Workout', exercises: [] };
  const reviewOnly = Boolean(route?.params?.reviewOnly);
  const routeSessionId: string | undefined = route?.params?.workoutSessionId ?? workout?.workoutSessionId;
  const exercises = useMemo<WorkoutExercise[]>(() => workout?.exercises ?? [], [workout?.exercises]);
  const [inputs, setInputs] = useState<WorkoutInputState>(() => buildInitialInputs(exercises));
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
    const next = buildInitialInputs(exercises);
    setInputs(prev => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const sameLength = prevKeys.length === nextKeys.length;
      const sameValues = sameLength && nextKeys.every(key => {
        const current = prev[key];
        const incoming = next[key];
        return current?.sets === incoming.sets && current?.reps === incoming.reps && current?.weight === incoming.weight;
      });
      return sameValues ? prev : next;
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
        const input = inputs[exercise.name] ?? { sets: '', reps: '', weight: '' };
        await saveWorkoutSetResult(resolvedSessionId, {
          exerciseName: exercise.name,
          sets: toNumberOrNull(input.sets),
          reps: toNumberOrNull(input.reps),
          weight: toNumberOrNull(input.weight),
        });
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
          const value = inputs[exercise.name] ?? { sets: '', reps: '', weight: '' };
          const displaySets = completedState ? exercise.previousPerformance?.sets ?? null : null;
          const displayReps = completedState ? exercise.previousPerformance?.reps ?? null : null;
          const displayWeight = completedState ? exercise.previousPerformance?.weight ?? null : null;

          return (
            <View key={exercise.name} style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 16, gap: 8, backgroundColor: theme.colors.surface }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{exercise.name}</Text>
              {completedState ? (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <Text style={{ fontWeight: '600', color: theme.colors.text }}>Sets</Text>
                    <Text style={{ color: theme.colors.text }}>{displaySets != null ? String(displaySets) : '—'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <Text style={{ fontWeight: '600', color: theme.colors.text }}>Reps</Text>
                    <Text style={{ color: theme.colors.text }}>{displayReps != null ? String(displayReps) : '—'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <Text style={{ fontWeight: '600', color: theme.colors.text }}>Weight</Text>
                    <Text style={{ color: theme.colors.text }}>{displayWeight != null ? String(displayWeight) : '—'}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <TextInput value={value.sets} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...prev[exercise.name], sets: text } }))} placeholder='Sets' placeholderTextColor={theme.colors.textMuted} keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
                  <TextInput value={value.reps} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...prev[exercise.name], reps: text } }))} placeholder='Reps' placeholderTextColor={theme.colors.textMuted} keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
                  <TextInput value={value.weight} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...prev[exercise.name], weight: text } }))} placeholder='Weight' placeholderTextColor={theme.colors.textMuted} keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
                </>
              )}
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
