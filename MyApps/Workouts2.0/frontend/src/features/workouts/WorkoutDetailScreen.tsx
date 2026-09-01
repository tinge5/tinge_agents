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

type SavedWorkoutSession = {
  id?: string;
  workoutSessionId?: string;
  exerciseResults?: SavedWorkoutSetResult[];
  setResults?: SavedWorkoutSetResult[];
  results?: SavedWorkoutSetResult[];
  workouts?: SavedWorkoutSetResult[];
  exercises?: Array<SavedWorkoutSetResult & { results?: SavedWorkoutSetResult[]; setResults?: SavedWorkoutSetResult[] }>;
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

function getCompletedSessionResults(workout: any): SavedWorkoutSetResult[] {
  const session = workout?.session ?? workout?.workoutSession ?? workout?.completedWorkout ?? workout;
  const candidates = [
    session?.exerciseResults,
    session?.setResults,
    session?.results,
    session?.workouts,
    session?.exercises,
    workout?.exerciseResults,
    workout?.setResults,
    workout?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.flatMap(item => {
        if (item && Array.isArray((item as any).results)) return (item as any).results;
        if (item && Array.isArray((item as any).setResults)) return (item as any).setResults;
        return [item as SavedWorkoutSetResult];
      });
    }
  }

  return [];
}

function findLoggedResultForExercise(exercise: WorkoutExercise, results: SavedWorkoutSetResult[]) {
  const exerciseNameKey = normalizeKey(exercise.name);
  const exerciseIdKey = normalizeKey((exercise as any).exerciseId);

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
  const exercises = useMemo<WorkoutExercise[]>(() => workout?.exercises ?? [], [workout]);
  const [inputs, setInputs] = useState<WorkoutInputState>(() =>
    Object.fromEntries(
      exercises.map(exercise => [
        exercise.name,
        {
          sets: exercise.sets != null ? String(exercise.sets) : '',
          reps: exercise.reps != null ? String(exercise.reps) : '',
          weight: exercise.weight != null ? String(exercise.weight) : '',
        },
      ])
    )
  );
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
    setInputs(
      Object.fromEntries(
        exercises.map(exercise => [
          exercise.name,
          {
            sets: exercise.sets != null ? String(exercise.sets) : '',
            reps: exercise.reps != null ? String(exercise.reps) : '',
            weight: exercise.weight != null ? String(exercise.weight) : '',
          },
        ])
      )
    );
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

    const history = (historyQuery.data ?? []) as SavedWorkoutSession[];
    const fromHistory = history.find(session => {
      const sessionId = String(session?.workoutSessionId ?? session?.id ?? '');
      return sessionId && workoutSessionId ? sessionId === String(workoutSessionId) : false;
    });

    const directResults = fromHistory ? getCompletedSessionResults(fromHistory) : getCompletedSessionResults(workoutCompletedData);
    return directResults;
  }, [completedState, historyQuery.data, workoutCompletedData, workoutSessionId]);

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
                  <TextInput value={value.sets} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...value, sets: text } }))} placeholder='Sets' keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12 }} />
                  <TextInput value={value.reps} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...value, reps: text } }))} placeholder='Reps' keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12 }} />
                  <TextInput value={value.weight} onChangeText={text => setInputs(prev => ({ ...prev, [exercise.name]: { ...value, weight: text } }))} placeholder='Weight' keyboardType='numeric' style={{ borderWidth: 1, padding: 12, borderRadius: 12 }} />
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
