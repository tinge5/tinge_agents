import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayWorkout } from '@/shared/api/client';

type TodayExercise = {
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  previousPerformance?: {
    sets?: number | null;
    reps?: number | null;
    weight?: number | null;
  } | null;
  suggestedTarget?: {
    sets?: number | null;
    reps?: number | null;
    weight?: number | null;
  } | null;
  startingTarget?: {
    sets?: number | null;
    reps?: number | null;
    weight?: number | null;
  } | null;
};

function formatValue(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return '—';
  return `${value}${suffix}`;
}

function ExerciseCard({ exercise }: { exercise: TodayExercise }) {
  const displaySuggested = exercise.suggestedTarget ?? exercise.startingTarget ?? {
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
  };

  return (
    <View style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, gap: 14 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{exercise.name}</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Previous Performance</Text>
        <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, gap: 4 }}>
          <Text>Sets: {formatValue(exercise.previousPerformance?.sets ?? null)}</Text>
          <Text>Reps: {formatValue(exercise.previousPerformance?.reps ?? null)}</Text>
          <Text>Weight: {formatValue(exercise.previousPerformance?.weight ?? null, ' lb')}</Text>
          {!exercise.previousPerformance ? <Text style={{ color: '#64748b' }}>No completed history for this exercise yet.</Text> : null}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Suggested Target</Text>
        <View style={{ backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, gap: 4 }}>
          <Text>Sets: {formatValue(displaySuggested.sets ?? null)}</Text>
          <Text>Reps: {formatValue(displaySuggested.reps ?? null)}</Text>
          <Text>Weight: {formatValue(displaySuggested.weight ?? null, ' lb')}</Text>
        </View>
      </View>
    </View>
  );
}

export function TodayScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['workouts', 'today'], queryFn: getTodayWorkout });

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] });
    });
    return unsubscribe;
  }, [navigation, queryClient]);

  const workout = data;
  const exercises = workout?.exercises ?? [];
  const isCompletedWorkout = workout?.status === 'completed';
  const isInProgressWorkout = workout?.status === 'in_progress';
  const isReviewMode = isCompletedWorkout;
  const workoutButtonLabel = isReviewMode ? 'Review Workout' : 'Start Workout';

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 30, fontWeight: '800' }}>Today</Text>
      <Text style={{ color: '#475569' }}>Your active plan workout and the backend&apos;s progression guidance</Text>

      {isLoading ? (
        <View style={{ paddingVertical: 40 }}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <Text style={{ color: '#b91c1c' }}>{(error as Error)?.message ?? 'Unable to load today workout'}</Text>
      ) : workout?.status === 'no_active_plan' ? (
        <View style={{ backgroundColor: '#fff7ed', padding: 16, borderRadius: 16, gap: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>No active plan</Text>
          <Text>Activate a plan to see today&apos;s scheduled workout.</Text>
        </View>
      ) : workout?.status === 'no_schedule' ? (
        <View style={{ backgroundColor: '#fff7ed', padding: 16, borderRadius: 16, gap: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>No workout scheduled today</Text>
          <Text>This active plan does not have a workout for the current day.</Text>
          <Text style={{ color: '#475569' }}>The plan may simply not schedule every day of the week.</Text>
        </View>
      ) : workout ? (
        <>
          <View style={{ backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '700' }}>{workout.title ?? 'Scheduled Workout'}</Text>
            <Text>{workout.day ?? 'Today'}</Text>
            <Text style={{ color: '#475569' }}>Week {workout.weekIndex != null ? Number(workout.weekIndex) + 1 : 1}</Text>
            {workout.note ? <Text>{workout.note}</Text> : null}
            {isInProgressWorkout ? <Text style={{ color: '#0f766e', fontWeight: '700' }}>Workout in progress</Text> : null}
            {isCompletedWorkout ? <Text style={{ color: '#15803d', fontWeight: '700' }}>Workout completed</Text> : null}
          </View>
          {exercises.map((exercise: TodayExercise) => (
            <ExerciseCard key={exercise.name} exercise={exercise} />
          ))}
          <Pressable
            onPress={() => navigation.navigate('Workout', { workout, reviewOnly: isReviewMode })}
            style={{ backgroundColor: isReviewMode ? '#16a34a' : '#2563eb', padding: 18, borderRadius: 16 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>{workoutButtonLabel}</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}
