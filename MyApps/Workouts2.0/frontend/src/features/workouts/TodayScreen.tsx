import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayWorkout } from '@/shared/api/client';
import { theme } from '@/shared/theme';

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
    <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, gap: 14, backgroundColor: theme.colors.surface }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{exercise.name}</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase' }}>Previous Performance</Text>
        <View style={{ backgroundColor: theme.colors.surfaceAlt, borderRadius: 12, padding: 12, gap: 4 }}>
          <Text style={{ color: theme.colors.text }}>Sets: {formatValue(exercise.previousPerformance?.sets ?? null)}</Text>
          <Text style={{ color: theme.colors.text }}>Reps: {formatValue(exercise.previousPerformance?.reps ?? null)}</Text>
          <Text style={{ color: theme.colors.text }}>Weight: {formatValue(exercise.previousPerformance?.weight ?? null, ' lb')}</Text>
          {!exercise.previousPerformance ? <Text style={{ color: theme.colors.textMuted }}>No completed history for this exercise yet.</Text> : null}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase' }}>Suggested Target</Text>
        <View style={{ backgroundColor: '#2a1a0d', borderRadius: 12, padding: 12, gap: 4 }}>
          <Text style={{ color: theme.colors.text }}>Sets: {formatValue(displaySuggested.sets ?? null)}</Text>
          <Text style={{ color: theme.colors.text }}>Reps: {formatValue(displaySuggested.reps ?? null)}</Text>
          <Text style={{ color: theme.colors.text }}>Weight: {formatValue(displaySuggested.weight ?? null, ' lb')}</Text>
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
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <Text style={{ fontSize: 30, fontWeight: '800', color: theme.colors.text }}>Today</Text>
      <Text style={{ color: theme.colors.textMuted }}>Your active plan workout and the backend&apos;s progression guidance</Text>

      {isLoading ? (
        <View style={{ paddingVertical: 40 }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <Text style={{ color: theme.colors.danger }}>{(error as Error)?.message ?? 'Unable to load today workout'}</Text>
      ) : workout?.status === 'no_active_plan' ? (
        <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text }}>No active plan</Text>
          <Text style={{ color: theme.colors.text }}>Activate a plan to see today&apos;s scheduled workout.</Text>
        </View>
      ) : workout?.status === 'no_schedule' ? (
        <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text }}>No workout scheduled today</Text>
          <Text style={{ color: theme.colors.text }}>This active plan does not have a workout for the current day.</Text>
          <Text style={{ color: theme.colors.textMuted }}>The plan may simply not schedule every day of the week.</Text>
        </View>
      ) : workout ? (
        <>
          <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.text }}>{workout.title ?? 'Scheduled Workout'}</Text>
            <Text style={{ color: theme.colors.text }}>{workout.day ?? 'Today'}</Text>
            <Text style={{ color: theme.colors.textMuted }}>Week {workout.weekIndex != null ? Number(workout.weekIndex) + 1 : 1}</Text>
            {workout.note ? <Text style={{ color: theme.colors.text }}>{workout.note}</Text> : null}
            {isInProgressWorkout ? <Text style={{ color: theme.colors.warning, fontWeight: '700' }}>Workout in progress</Text> : null}
            {isCompletedWorkout ? <Text style={{ color: theme.colors.success, fontWeight: '700' }}>Workout completed</Text> : null}
          </View>
          {exercises.map((exercise: TodayExercise) => (
            <ExerciseCard key={exercise.name} exercise={exercise} />
          ))}
          <Pressable
            onPress={() => navigation.navigate('Workout', { workout, reviewOnly: isReviewMode })}
            style={{ backgroundColor: isReviewMode ? theme.colors.success : theme.colors.primary, padding: 18, borderRadius: 16 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>{workoutButtonLabel}</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}
