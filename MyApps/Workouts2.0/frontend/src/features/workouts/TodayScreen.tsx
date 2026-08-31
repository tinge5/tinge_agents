import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getTodayWorkout } from '@/shared/api/client';

export function TodayScreen({ navigation }: any) {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['workouts', 'today'], queryFn: getTodayWorkout });

  const workout = data;
  const exercises = workout?.exercises ?? [];

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 30, fontWeight: '800' }}>Today</Text>
      <Text style={{ color: '#475569' }}>Your active plan workout for the current day and week</Text>

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
          <Text>This active plan does not have a workout for the current day/week.</Text>
        </View>
      ) : workout ? (
        <>
          <View style={{ backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '700' }}>{workout.title ?? 'Scheduled Workout'}</Text>
            <Text>{workout.day ?? 'Today'}</Text>
            <Text style={{ color: '#475569' }}>Week {workout.weekIndex != null ? Number(workout.weekIndex) + 1 : 1}</Text>
            {workout.note ? <Text>{workout.note}</Text> : null}
          </View>
          {exercises.map((e: any) => (
            <View key={e.name} style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>{e.name}</Text>
              <Text>
                {e.sets} sets x {e.reps} reps{typeof e.weight === 'number' ? ` @ ${e.weight} lb` : ''}
              </Text>
            </View>
          ))}
          <Pressable onPress={() => navigation.navigate('Workout', { workout })} style={{ backgroundColor: '#16a34a', padding: 18, borderRadius: 16 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>Start Workout</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}
