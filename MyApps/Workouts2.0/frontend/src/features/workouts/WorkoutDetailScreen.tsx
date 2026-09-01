import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeWorkoutSession, getWorkoutHistory, saveWorkoutSetResult, startWorkoutSession, type TodayWorkout } from '@/shared/api/client';

type WorkoutExercise = {
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  exerciseId?: string | null;
};

type WorkoutInputState = Record<string, { sets: string; reps: string; weight: string }>;

type SavedWorkoutSetResult = {
  exerciseName?: string;
  exerciseId?: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
};

type HistoryWorkoutSession = {
  id?: string;
  workoutSessionId?: string;
  setResults?: SavedWorkoutSetResult[];
};

type WorkoutHistoryResponse = {
  workouts?: HistoryWorkoutSession[];
  exerciseHistory?: unknown[];
  planArchives?: unknown[];
};

function toNumberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeKey(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
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

function getHistoryWorkouts(history: unknown): HistoryWorkoutSession[] {
  if (!history || typeof history !== 'object') return [];
  const workouts = (history as WorkoutHistoryResponse).workouts;
  return Array.isArray(workouts) ? workouts : [];
}

function getCompletedSessionResults(history: unknown, workoutSessionId?: string): SavedWorkoutSetResult[] {
  const workouts = getHistoryWorkouts(history);
  if (!workoutSessionId) return [];

  const matchedSession = workouts.find(session => String(session?.workoutSessionId ?? session?.id ?? '') === String(workoutSessionId));
  return Array.isArray(matchedSession?.setResults) ? matchedSession!.setResults! : [];
}

function findLoggedResultForExercise(exercise: WorkoutExercise, results: SavedWorkoutSetResult[]) {
  const exerciseNameKey = normalizeKey(exercise.name);
  const exerciseIdKey = normalizeKey(exercise.exerciseId);

  return results.find(result => {
    const resultNameKey = normalizeKey(result.exerciseName);
    const resultIdKey = normalizeKey(result.exerciseId);
    return (exerciseIdKey && resultIdKey && exerciseIdKey === resultIdKey) || (exerciseNameKey && resultNameKey && exerciseNameKey === resultNameKey);
  });
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
  const workoutCompletedData = (workout as any)?.session ?? (workout as any)?.workoutSession ?? (workout as any)?.completedWorkout ?? workout;
  const workoutSessionId = activeSessionId ?? routeSessionId ?? (workoutCompletedData as any)?.id ?? (workoutCompletedData as any)?.workoutSessionId;

  const historyQuery = useQuery({
    queryKey: ['workout-history', workoutSessionId],
    queryFn: async () => getWorkoutHistory(),
    enabled: completedState && !!workoutSessionId,
  });

  const savedResults = useMemo(() => {
    if (!completedState) return [] as SavedWorkoutSetResult[];
    return getCompletedSessionResults(historyQuery.data, workoutSessionId);
  }, [completedState, historyQuery.data, workoutSessionId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>{workout.title ?? 'Workout'}</Text>
      <Text>{reviewOnly ? 'Read-only review of your completed workout.' : 'Quick logging UI optimized for mobile workouts.'}</Text>

      {!reviewOnly && startMutation.isPending ? (
        <View style={{ paddingVertical: 8 }}>
          <ActivityIndicator />
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        {exercises.map(exercise => {
          const value = inputs[exercise.name] ?? { sets: '', reps: '', weight: '' };
          const savedResult = completedState ? findLoggedResultForExercise(exercise, savedResults) : null;
          const loggedSets = completedState ? savedResult?.sets ?? null : null;
          const loggedReps = completedState ? savedResult?.reps ?? null : null;
          const loggedWeight = completedState ? savedResult?.weight ?? null : null;

          return (
            <View key={exercise.name} style={{ borderWidth: 1, borderColor: '#cbd5e1', padding: 14, borderRadius: 16, gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>{exercise.name}</Text>
              {completedState ? (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Sets</Text>
                    <Text>{loggedSets != null ? String(loggedSets) : '—'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Reps</Text>
                    <Text>{loggedReps != null ? String(loggedReps) : '—'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Weight</Text>
                    <Text>{loggedWeight != null ? String(loggedWeight) : '—'}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <TextInput value={value.sets} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...prev[exercise.name], sets: text } }))} placeholder='Sets' keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12 }} />
                  <TextInput value={value.reps} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...prev[exercise.name], reps: text } }))} placeholder='Reps' keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12 }} />
                  <TextInput value={value.weight} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...prev[exercise.name], weight: text } }))} placeholder='Weight' keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12 }} />
                </>
              )}
            </View>
          );
        })}
      </View>

      {completedState ? (
        <View style={{ backgroundColor: '#dcfce7', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#22c55e' }}>
          <Text style={{ color: '#166534', textAlign: 'center', fontWeight: '800', fontSize: 16 }}>Workout Completed</Text>
        </View>
      ) : (
        <Pressable onPress={handleMarkCompleted} disabled={isSubmitting || completeMutation.isPending} style={{ backgroundColor: '#111827', padding: 18, borderRadius: 16, opacity: isSubmitting ? 0.7 : 1 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>{isSubmitting || completeMutation.isPending ? 'Saving...' : 'Mark Complete'}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
