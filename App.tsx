import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';

type AuthMode = 'login' | 'register';

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscleGroup: string;
};

type WorkoutDay = {
  id: string;
  name: string;
  scheduledDayOfWeek: string;
  exercises: Exercise[];
  completed: boolean;
};

type Plan = {
  id: string;
  name: string;
  goal: string;
  progressiveOverload: boolean;
  status: 'draft' | 'active' | 'completed';
  days: WorkoutDay[];
};

type UserState = {
  displayName: string;
  email: string;
  activePlan: Plan;
  workoutHistory: Array<{ id: string; date: string; planName: string; dayName: string; completed: boolean }>;
  completedPlans: Array<{ id: string; name: string; completedAt: string }>;
  exerciseHistory: Array<{ id: string; exerciseName: string; previousWeight: number; previousReps: number; performedAt: string }>;
};

const seedPlan: Plan = {
  id: 'plan-1',
  name: 'Push / Pull / Legs',
  goal: 'Hypertrophy',
  progressiveOverload: true,
  status: 'active',
  days: [
    {
      id: 'day-1',
      name: 'Push Day',
      scheduledDayOfWeek: 'Monday',
      completed: false,
      exercises: [
        { id: 'ex-1', name: 'Bench Press', sets: 4, reps: 8, weight: 185, muscleGroup: 'Chest' },
        { id: 'ex-2', name: 'Overhead Press', sets: 3, reps: 10, weight: 95, muscleGroup: 'Shoulders' },
      ],
    },
    {
      id: 'day-2',
      name: 'Pull Day',
      scheduledDayOfWeek: 'Wednesday',
      completed: true,
      exercises: [
        { id: 'ex-3', name: 'Pull-ups', sets: 4, reps: 6, weight: 0, muscleGroup: 'Back' },
        { id: 'ex-4', name: 'Barbell Row', sets: 4, reps: 8, weight: 155, muscleGroup: 'Back' },
      ],
    },
    {
      id: 'day-3',
      name: 'Leg Day',
      scheduledDayOfWeek: 'Friday',
      completed: false,
      exercises: [
        { id: 'ex-5', name: 'Squat', sets: 4, reps: 5, weight: 225, muscleGroup: 'Legs' },
        { id: 'ex-6', name: 'Romanian Deadlift', sets: 3, reps: 8, weight: 185, muscleGroup: 'Hamstrings' },
      ],
    },
  ],
};

const initialUser: UserState = {
  displayName: 'Jordan',
  email: 'jordan@example.com',
  activePlan: seedPlan,
  workoutHistory: [
    { id: 'wh-1', date: '2026-08-25', planName: 'Push / Pull / Legs', dayName: 'Pull Day', completed: true },
    { id: 'wh-2', date: '2026-08-23', planName: 'Push / Pull / Legs', dayName: 'Push Day', completed: true },
  ],
  completedPlans: [{ id: 'cp-1', name: 'Starter Cut', completedAt: '2026-07-30' }],
  exerciseHistory: [
    { id: 'eh-1', exerciseName: 'Bench Press', previousWeight: 185, previousReps: 8, performedAt: '2026-08-23' },
    { id: 'eh-2', exerciseName: 'Squat', previousWeight: 225, previousReps: 5, performedAt: '2026-08-20' },
  ],
};

const recommendations = [
  { exercise: 'Bench Press', suggestion: 'Increase to 190 lb for 8 reps if last set felt manageable.' },
  { exercise: 'Squat', suggestion: 'Keep 225 lb today; if all reps are clean, try 230 lb next session.' },
];

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserState>(initialUser);
  const [email, setEmail] = useState('jordan@example.com');
  const [password, setPassword] = useState('password123');

  const currentWorkout = useMemo(() => {
    const weekday = new Date().toLocaleDateString(undefined, { weekday: 'long' });
    return user.activePlan.days.find((day) => day.scheduledDayOfWeek === weekday) ?? user.activePlan.days[0];
  }, [user.activePlan.days]);

  const activeDay = currentWorkout;

  const handleAuth = () => {
    setAuthenticated(true);
  };

  const markWorkoutComplete = (dayId: string) => {
    setUser((prev) => {
      const updatedDays = prev.activePlan.days.map((day) =>
        day.id === dayId ? { ...day, completed: true } : day,
      );
      const completedDay = prev.activePlan.days.find((day) => day.id === dayId);
      const allDone = updatedDays.every((day) => day.completed);
      return {
        ...prev,
        activePlan: {
          ...prev.activePlan,
          status: allDone ? 'completed' : prev.activePlan.status,
          days: updatedDays,
        },
        workoutHistory: completedDay
          ? [
              {
                id: `wh-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                planName: prev.activePlan.name,
                dayName: completedDay.name,
                completed: true,
              },
              ...prev.workoutHistory,
            ]
          : prev.workoutHistory,
        completedPlans: allDone
          ? [{ id: `cp-${Date.now()}`, name: prev.activePlan.name, completedAt: new Date().toISOString().slice(0, 10) }, ...prev.completedPlans]
          : prev.completedPlans,
      };
    });
  };

  const addExercise = () => {
    setUser((prev) => ({
      ...prev,
      activePlan: {
        ...prev.activePlan,
        days: prev.activePlan.days.map((day) =>
          day.id === activeDay.id
            ? {
                ...day,
                exercises: [
                  ...day.exercises,
                  { id: `ex-${Date.now()}`, name: 'Cable Fly', sets: 3, reps: 12, weight: 50, muscleGroup: 'Chest' },
                ],
              }
            : day,
        ),
      },
    }));
  };

  if (!authenticated) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.authContainer}>
          <Text style={styles.brand}>Workout2.0</Text>
          <Text style={styles.subtitle}>Mobile workout planning, tracking, and recommendations.</Text>
          <View style={styles.segmentRow}>
            <Pressable style={[styles.segmentButton, authMode === 'login' && styles.segmentButtonActive]} onPress={() => setAuthMode('login')}>
              <Text style={styles.segmentText}>Sign In</Text>
            </Pressable>
            <Pressable style={[styles.segmentButton, authMode === 'register' && styles.segmentButtonActive]} onPress={() => setAuthMode('register')}>
              <Text style={styles.segmentText}>Register</Text>
            </Pressable>
          </View>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          <Pressable style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>Welcome back</Text>
            <Text style={styles.title}>{user.displayName}</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={() => setAuthenticated(false)}>
            <Text style={styles.secondaryButtonText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Workout</Text>
          <Text style={styles.cardSubtitle}>{activeDay.name} · {activeDay.scheduledDayOfWeek}</Text>
          {activeDay.exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <View>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.muted}>{exercise.sets} sets × {exercise.reps} reps · {exercise.weight} lb</Text>
              </View>
              <Text style={styles.tag}>{exercise.muscleGroup}</Text>
            </View>
          ))}
          <Pressable style={styles.primaryButton} onPress={() => markWorkoutComplete(activeDay.id)}>
            <Text style={styles.primaryButtonText}>Mark Workout Complete</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plan Settings</Text>
          <Text style={styles.infoText}>Plan: {user.activePlan.name}</Text>
          <Text style={styles.infoText}>Goal: {user.activePlan.goal}</Text>
          <Text style={styles.infoText}>Progressive Overload: {user.activePlan.progressiveOverload ? 'Enabled' : 'Disabled'}</Text>
          <Pressable style={styles.secondaryButton} onPress={addExercise}>
            <Text style={styles.secondaryButtonText}>Add Exercise to Today</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommendations</Text>
          {recommendations.map((item) => (
            <View key={item.exercise} style={styles.recommendationBox}>
              <Text style={styles.exerciseName}>{item.exercise}</Text>
              <Text style={styles.muted}>{item.suggestion}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Workout History</Text>
          <FlatList
            data={user.workoutHistory}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyRow}>
                <Text style={styles.exerciseName}>{item.dayName}</Text>
                <Text style={styles.muted}>{item.date}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completed Plans</Text>
          {user.completedPlans.map((plan) => (
            <View key={plan.id} style={styles.historyRow}>
              <Text style={styles.exerciseName}>{plan.name}</Text>
              <Text style={styles.muted}>{plan.completedAt}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exercise History</Text>
          {user.exerciseHistory.map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View>
                <Text style={styles.exerciseName}>{entry.exerciseName}</Text>
                <Text style={styles.muted}>{entry.previousWeight} lb × {entry.previousReps} reps</Text>
              </View>
              <Text style={styles.muted}>{entry.performedAt}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1020' },
  container: { padding: 16, gap: 16, paddingBottom: 32 },
  authContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, gap: 16 },
  brand: { color: '#fff', fontSize: 36, fontWeight: '800' },
  subtitle: { color: '#b7c0d8', fontSize: 16, lineHeight: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#8da2ff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  card: { backgroundColor: '#141b34', borderRadius: 20, padding: 16, gap: 12 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardSubtitle: { color: '#b7c0d8', fontSize: 14 },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomColor: '#24304f', borderBottomWidth: StyleSheet.hairlineWidth },
  exerciseName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  muted: { color: '#b7c0d8' },
  tag: { color: '#8da2ff', borderColor: '#8da2ff', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  input: { backgroundColor: '#141b34', color: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#24304f' },
  primaryButton: { backgroundColor: '#6c7cff', borderRadius: 14, padding: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: 'transparent', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3a4a77' },
  secondaryButtonText: { color: '#d6ddff', fontWeight: '700' },
  segmentRow: { flexDirection: 'row', gap: 10 },
  segmentButton: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#24304f', alignItems: 'center' },
  segmentButtonActive: { backgroundColor: '#1d2750', borderColor: '#6c7cff' },
  segmentText: { color: '#fff', fontWeight: '700' },
  infoText: { color: '#d6ddff' },
  recommendationBox: { padding: 12, backgroundColor: '#1a2344', borderRadius: 14, gap: 6 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomColor: '#24304f', borderBottomWidth: StyleSheet.hairlineWidth },
});
