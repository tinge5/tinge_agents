import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTemporaryWorkout, getTodayWorkout, type PlanDay } from '@/shared/api/client';
import { theme } from '@/shared/theme';

type TodayExercise = {
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  repsTarget?: number | null;
  setsTarget?: number | null;
  previousPerformance?: {
    sets?: number | null;
    reps?: number | null;
    weight?: number | null;
    prevReps?: number | null;
    prevWeight?: number | null;
  } | null;
  suggestedTarget?: {
    sets?: number | null;
    reps?: number | null;
    weight?: number | null;
    prevReps?: number | null;
    prevWeight?: number | null;
  } | null;
  startingTarget?: {
    sets?: number | null;
    reps?: number | null;
    weight?: number | null;
    prevReps?: number | null;
    prevWeight?: number | null;
  } | null;
};
function formatExerciseHeader(exercise: TodayExercise) {
  const sets = exercise.sets != null ? String(exercise.sets) : '—';
  const reps = exercise.repsTarget != null ? String(exercise.repsTarget) : exercise.reps != null ? String(exercise.reps) : '—';
  return `${exercise.name} — ${sets} × ${reps}`;
}


function formatValue(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return '—';
  return `${value}${suffix}`;
}

function ExerciseCard({ exercise }: { exercise: TodayExercise }) {
  const displaySuggested = exercise.suggestedTarget ?? exercise.startingTarget ?? {
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    prevReps: exercise.previousPerformance?.prevReps ?? null,
    prevWeight: exercise.previousPerformance?.prevWeight ?? null,

  };


  return (
    <View style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 16, gap: 14, backgroundColor: theme.colors.surface }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{formatExerciseHeader(exercise)}</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase' }}>Previous Performance</Text>
        <View style={{ backgroundColor: theme.colors.surfaceAlt, borderRadius: 12, padding: 12, gap: 4 }}>
          <Text style={{ color: theme.colors.text }}>Sets: {formatValue(exercise.previousPerformance?.sets ?? null)}</Text>
          <Text style={{ color: theme.colors.text }}>Reps: {formatValue(exercise.previousPerformance?.prevReps ?? null)}</Text>
          <Text style={{ color: theme.colors.text }}>First Weight: {formatValue(exercise.previousPerformance?.prevWeight ?? null, ' lb')}</Text>
          {exercise.previousPerformance?.prevReps != null && exercise.previousPerformance?.prevWeight != null ? (
            <Text style={{ color: theme.colors.text }}>Previous Best Set: {formatValue(exercise.previousPerformance?.reps ?? null)} {exercise.previousPerformance.weight != 0 ? `x ${formatValue(exercise.previousPerformance?.weight ?? null, ' lb')}` : ''}</Text>
          ) : null}

          {!exercise.previousPerformance ? <Text style={{ color: theme.colors.textMuted }}>No completed history for this exercise yet.</Text> : null}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase' }}>Suggested Target for Top set</Text>
        <View style={{ backgroundColor: '#2a1a0d', borderRadius: 12, padding: 12, gap: 4 }}>
          <Text style={{ color: theme.colors.text }}>Reps: {formatValue(displaySuggested.prevReps ?? displaySuggested.reps ?? null)}</Text>
          <Text style={{ color: theme.colors.text }}>Weight: {formatValue(displaySuggested.prevWeight ?? displaySuggested.weight ?? null, ' lb')}</Text>
        </View>
      </View>
    </View>
  );
}

export function TodayScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [temporarySwitchOpen, setTemporarySwitchOpen] = useState(false);
  const [selectedTemporaryDay, setSelectedTemporaryDay] = useState<PlanDay | null>(null);
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['workouts', 'today'], queryFn: getTodayWorkout });
  const temporarySwitchMutation = useMutation({
    mutationFn: createTemporaryWorkout,
    onSuccess: async () => {
      setTemporarySwitchOpen(false);
      setSelectedTemporaryDay(null);
      await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] });
    },
  });

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] });
    });
    return unsubscribe;
  }, [navigation, queryClient]);

  const workout = data;
  //console.log(workout);
  const exercises = workout?.exercises ?? [];
  const isCompletedWorkout = workout?.status === 'completed';
  const isInProgressWorkout = workout?.status === 'in_progress';
  const isReviewMode = isCompletedWorkout;
  const isTemporaryWorkout = workout?.isTemporary === true;
  const canUseTemporarySwitch = Boolean(
    workout?.planId &&
    !isTemporaryWorkout &&
    ['no_schedule', 'scheduled', 'in_progress'].includes(workout.status)
  );
  const planDays = workout?.plan?.days ?? [];
  const workoutButtonLabel = isReviewMode ? 'Review Workout' : isInProgressWorkout ? 'Resume Workout' : 'Start Workout';
  const DAY_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};


  const closeTemporarySwitch = () => {
    if (temporarySwitchMutation.isPending) return;
    setTemporarySwitchOpen(false);
    setSelectedTemporaryDay(null);
    temporarySwitchMutation.reset();
  };

  return (
    <>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: theme.colors.text }}>Today</Text>
        {canUseTemporarySwitch ? (
          <Pressable
            onPress={() => {
              temporarySwitchMutation.reset();
              setSelectedTemporaryDay(null);
              setTemporarySwitchOpen(true);
            }}
            style={{ backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Temporary switch</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={{ color: theme.colors.textMuted }}>Your active plan's workout of the day</Text>

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
            {isTemporaryWorkout ? <Text style={{ color: theme.colors.primaryDark, fontWeight: '700' }}>Temporary workout — plan unchanged</Text> : null}
            <Text style={{ color: theme.colors.text }}>{workout.planDay?.dayOfWeek != null ? DAY_LABELS[workout.planDay.dayOfWeek] : 'Today'}</Text>
            <Text style={{ color: theme.colors.textMuted }}>Week {workout.weekIndex != null ? Number(workout.weekIndex) + 1 : 1}</Text>
            {workout.note ? <Text style={{ color: theme.colors.text }}>{workout.note}</Text> : null}
            {isInProgressWorkout ? <Text style={{ color: theme.colors.warning, fontWeight: '700' }}>Workout in progress</Text> : null}
            {isCompletedWorkout ? <Text style={{ color: theme.colors.success, fontWeight: '700' }}>Workout completed</Text> : null}
          </View>
                   <Pressable
            onPress={() => navigation.navigate('Workout', { workout, reviewOnly: isReviewMode })}
            style={{ backgroundColor: isReviewMode ? theme.colors.success : theme.colors.primary, padding: 18, borderRadius: 16 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>{workoutButtonLabel}</Text>
          </Pressable>
          {exercises.map((exercise: TodayExercise) => (
            <ExerciseCard key={exercise.name} exercise={exercise} />
          ))}
 
        </>
      ) : null}
    </ScrollView>
    <Modal
      visible={temporarySwitchOpen}
      transparent
      animationType="fade"
      onRequestClose={closeTemporarySwitch}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.65)' }}>
        <View style={{ maxHeight: '85%', backgroundColor: theme.colors.surface, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, padding: 18, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.text }}>Temporary switch</Text>
          {selectedTemporaryDay ? (
            <>
              <Text style={{ color: theme.colors.text }}>
                Use {selectedTemporaryDay.title} for today only?
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>
                Completing it counts as a workout for this plan and checks off today&apos;s scheduled workout, if there is one. Your plan and progression suggestions won&apos;t change.
              </Text>
              {temporarySwitchMutation.isError ? (
                <Text style={{ color: theme.colors.danger }}>
                  {(temporarySwitchMutation.error as Error)?.message ?? "Unable to switch today's workout"}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <Pressable onPress={() => setSelectedTemporaryDay(null)} disabled={temporarySwitchMutation.isPending} style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.surfaceAlt }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Back</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (selectedTemporaryDay.id) temporarySwitchMutation.mutate(selectedTemporaryDay.id);
                  }}
                  disabled={temporarySwitchMutation.isPending || !selectedTemporaryDay.id}
                  style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.primary, opacity: temporarySwitchMutation.isPending ? 0.6 : 1 }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '700' }}>{temporarySwitchMutation.isPending ? 'Switching…' : 'Confirm'}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={{ color: theme.colors.textMuted }}>Choose a workout from your current plan for today.</Text>
              <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 8 }}>
                {planDays.map((day, index) => (
                  <Pressable
                    key={day.id ?? `${day.weekIndex ?? 0}-${day.dayOfWeek}-${index}`}
                    onPress={() => setSelectedTemporaryDay(day)}
                    style={{ backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, gap: 4 }}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{day.title}</Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                      Week {Number(day.weekIndex ?? 0) + 1} • {DAY_LABELS[day.dayOfWeek] ?? `Day ${day.dayOfWeek + 1}`}
                    </Text>
                  </Pressable>
                ))}
                {planDays.length === 0 ? (
                  <Text style={{ color: theme.colors.textMuted }}>No workouts are configured in this plan.</Text>
                ) : null}
              </ScrollView>
              {temporarySwitchMutation.isError ? (
                <Text style={{ color: theme.colors.danger }}>
                  {(temporarySwitchMutation.error as Error)?.message ?? "Unable to switch today's workout"}
                </Text>
              ) : null}
              <Pressable onPress={closeTemporarySwitch} style={{ alignSelf: 'flex-end', padding: 10 }}>
                <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
    </>
  );
}
