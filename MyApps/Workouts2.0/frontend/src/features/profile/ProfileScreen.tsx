import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/shared/store';
import { logout } from '@/features/auth/authSlice';

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const activePlan = user?.activePlan;
  const workoutHistory = user?.workoutHistory ?? [];
  const completedPlans = user?.completedPlans ?? [];
  const exerciseHistory = user?.exerciseHistory ?? [];

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Profile</Text>
      <View style={{ backgroundColor: '#ecfeff', padding: 16, borderRadius: 16, gap: 6 }}>
        <Text style={{ fontWeight: '700', fontSize: 18 }}>{user?.displayName ?? 'Athlete'}</Text>
        <Text>{user?.email ?? ''}</Text>
        <Text>Active plan: {activePlan?.name ?? 'No active plan'}</Text>
        <Text>Completed plans: {completedPlans.length}</Text>
        <Text>Workout history: {workoutHistory.length} sessions</Text>
        <Text>Exercise history: {exerciseHistory.length} exercises</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>Completed Plans</Text>
        {completedPlans.length ? completedPlans.map((plan, index) => <Text key={`${plan.id ?? plan.name ?? 'plan'}-${index}`}>{plan.name ?? 'Completed Plan'}{plan.completedAt ? ` — ${new Date(plan.completedAt).toLocaleDateString()}` : ''}</Text>) : <Text>No completed plans yet.</Text>}
      </View>
      <View style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>Workout History</Text>
        {workoutHistory.length ? workoutHistory.map((item, index) => <Text key={`${item.id ?? item.title ?? 'workout'}-${index}`}>{item.title ?? 'Workout'}{item.date ? ` — ${new Date(item.date).toLocaleDateString()}` : ''}</Text>) : <Text>No workout history yet.</Text>}
      </View>
      <View style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>Exercise History</Text>
        {exerciseHistory.length ? exerciseHistory.map((item, index) => <Text key={`${item.exerciseName ?? 'exercise'}-${index}`}>{item.exerciseName ?? 'Exercise'}{item.weight != null ? ` — ${item.weight}` : ''}{item.reps != null ? ` x ${item.reps}` : ''}</Text>) : <Text>No exercise history yet.</Text>}
      </View>
      <Pressable onPress={() => dispatch(logout() as any)} style={{ backgroundColor: '#dc2626', padding: 16, borderRadius: 16 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}
