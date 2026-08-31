import React, { useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activatePlan,
  createPlan,
  deactivatePlan,
  getPlans,
  type Plan,
  type PlanDay,
  type PlanDayExercise,
  updatePlan,
} from '@/shared/api/client';

const emptyDay = (dayOfWeek: number): PlanDay => ({
  dayOfWeek,
  weekIndex: 0,
  title: '',
  exercises: [],
});

const defaultDraft = (): { id?: string; userId?: string; name: string; goals: string[]; isActive: boolean; progressiveOverloadEnabled: boolean; currentWeekIndex: number; days: PlanDay[] } => ({
  userId: undefined,
  name: '',
  goals: ['strength'],
  isActive: false,
  progressiveOverloadEnabled: false,
  currentWeekIndex: 0,
  days: [emptyDay(1), emptyDay(3)],
});

const EXERCISE_SUGGESTIONS = [
  'Barbell Back Squat',
  'Barbell Bench Press',
  'Barbell Deadlift',
  'Overhead Press',
  'Pull-Up',
  'Lat Pulldown',
  'Dumbbell Row',
  'Seated Cable Row',
  'Incline Dumbbell Press',
  'Dumbbell Shoulder Press',
  'Romanian Deadlift',
  'Leg Press',
  'Lunge',
  'Bulgarian Split Squat',
  'Bicep Curl',
  'Tricep Pushdown',
];

function normalizeExerciseName(name: unknown) {
  return typeof name === 'string' ? name.trim() : '';
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function toDraftPlan(plan: Plan) {
  return {
    ...defaultDraft(),
    id: plan.id,
    userId: plan.userId,
    name: plan.name ?? '',
    goals: safeArray<string>(plan.goals).filter(Boolean),
    isActive: !!plan.isActive,
    progressiveOverloadEnabled: !!plan.progressiveOverloadEnabled,
    currentWeekIndex: Number(plan.currentWeekIndex ?? 0),
    days: safeArray<PlanDay>(plan.days).length
      ? safeArray<PlanDay>(plan.days).map((day, index) => ({
          dayOfWeek: Number((day as any)?.dayOfWeek ?? index),
          weekIndex: Number((day as any)?.weekIndex ?? 0),
          title: typeof (day as any)?.title === 'string' ? (day as any).title : '',
          position: Number((day as any)?.position ?? index),
          exercises: safeArray<PlanDayExercise>((day as any)?.exercises).map((exercise, exerciseIndex) => ({
            id: (exercise as any)?.id,
            exerciseName: normalizeExerciseName((exercise as any)?.exerciseName),
            exerciseId: (exercise as any)?.exerciseId ?? null,
            setsTarget: Number((exercise as any)?.setsTarget ?? 0),
            repsTarget: Number((exercise as any)?.repsTarget ?? 0),
            weightTarget:
              (exercise as any)?.weightTarget === '' || (exercise as any)?.weightTarget === null || (exercise as any)?.weightTarget === undefined
                ? null
                : Number((exercise as any)?.weightTarget),
            order: Number((exercise as any)?.order ?? exerciseIndex),
            notes: (exercise as any)?.notes ?? null,
          })),
        }))
      : [emptyDay(1)],
  };
}

function PlanFieldHelp({ text }: { text: string }) {
  return <Text style={{ color: '#6b7280', fontSize: 12, lineHeight: 16 }}>{text}</Text>;
}

function SuggestionInput({
  value,
  onChangeText,
  suggestions,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 6);
  return (
    <View style={{ gap: 6 }}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />
      {showSuggestions && filtered.length > 0 ? (
        <View style={{ gap: 6, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 8, backgroundColor: 'white' }}>
          {filtered.map((item) => (
            <Pressable key={item} onPress={() => onChangeText(item)} style={{ paddingVertical: 8 }}>
              <Text style={{ fontWeight: '600' }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function PlanCard({ plan, onEdit, onActivate, onDeactivate }: { plan: Plan; onEdit: (plan: Plan) => void; onActivate: (plan: Plan) => void; onDeactivate: (plan: Plan) => void; }) {
  const goals = safeArray<string>(plan.goals);
  const days = safeArray<PlanDay>(plan.days);
  return (
    <View style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, gap: 8 }}>
      <Text style={{ fontWeight: '700', fontSize: 18 }}>{plan.name}</Text>
      <Text>Goals: {goals.length ? goals.join(', ') : 'None'}</Text>
      <Text>Progressive overload: {plan.progressiveOverloadEnabled ? 'enabled' : 'disabled'}</Text>
      <Text>Status: {plan.status}{plan.isActive ? ' (active)' : ''}</Text>
      <Text>Schedule: {days.length ? days.map((day) => `${typeof day.title === 'string' && day.title.trim() ? day.title : `Day ${day.dayOfWeek}`}`).join(', ') : 'No days configured'}</Text>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Pressable onPress={() => onEdit(plan)} style={{ backgroundColor: '#111827', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Edit</Text>
        </Pressable>
        {!plan.isActive ? (
          <Pressable onPress={() => onActivate(plan)} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 12 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Activate</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => onDeactivate(plan)} style={{ backgroundColor: '#6b7280', padding: 12, borderRadius: 12 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Deactivate</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function PlanEditorScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const [draft, setDraft] = useState<any>(defaultDraft());
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const plans = data ?? [];
  const isCreating = !editingPlanId;
  const draftDay = draft.days?.[activeDayIndex] ?? emptyDay(1);
  const title = useMemo(() => (editingPlanId ? 'Edit Plan' : 'Create Plan'), [editingPlanId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: String(draft.name ?? '').trim(),
        goals: safeArray<string>(draft.goals).map((goal) => String(goal).trim()).filter(Boolean),
        progressiveOverloadEnabled: !!draft.progressiveOverloadEnabled,
        isActive: !!draft.isActive,
        days: safeArray<PlanDay>(draft.days).map((day: PlanDay, index: number) => ({
          ...day,
          dayOfWeek: Number((day as any)?.dayOfWeek ?? 0),
          weekIndex: Number((day as any)?.weekIndex ?? 0),
          position: index,
          title: String((day as any)?.title ?? '').trim(),
          exercises: safeArray<PlanDayExercise>((day as any)?.exercises).map((exercise, exerciseIndex) => ({
            ...exercise,
            exerciseName: normalizeExerciseName((exercise as any)?.exerciseName),
            setsTarget: Number((exercise as any)?.setsTarget ?? 0),
            repsTarget: Number((exercise as any)?.repsTarget ?? 0),
            weightTarget:
              (exercise as any)?.weightTarget === '' || (exercise as any)?.weightTarget === null || (exercise as any)?.weightTarget === undefined
                ? null
                : Number((exercise as any)?.weightTarget),
            order: exerciseIndex,
          })),
        })),
      };
      if (editingPlanId) return updatePlan(editingPlanId, payload);
      return createPlan(payload);
    },
    onSuccess: async (savedPlan) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditingPlanId(savedPlan.id);
      setDraft(toDraftPlan(savedPlan));
      Alert.alert('Saved', 'Plan has been saved successfully.');
    },
    onError: (err: any) => Alert.alert('Save failed', err?.message ?? 'Unable to save plan'),
  });

  const activateMutation = useMutation({
    mutationFn: activatePlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (err: any) => Alert.alert('Activation failed', err?.message ?? 'Unable to activate plan'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivatePlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (err: any) => Alert.alert('Deactivation failed', err?.message ?? 'Unable to deactivate plan'),
  });

  const startEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setDraft(toDraftPlan(plan));
    setActiveDayIndex(0);
  };

  const resetDraft = () => {
    setEditingPlanId(null);
    setDraft(defaultDraft());
    setActiveDayIndex(0);
  };

  const updateDay = (updater: (day: PlanDay) => PlanDay) => {
    setDraft((prev: any) => {
      const days = safeArray<PlanDay>(prev.days).slice();
      days[activeDayIndex] = updater(days[activeDayIndex] ?? emptyDay(1));
      return { ...prev, days };
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Plans</Text>
      <Text style={{ color: '#6b7280' }}>Use the New Plan action to start a fresh plan. Edit existing plans from the list below.</Text>
      {isLoading ? (
        <View style={{ paddingVertical: 40 }}><ActivityIndicator /></View>
      ) : isError ? (
        <Text style={{ color: '#b91c1c' }}>{(error as Error)?.message ?? 'Unable to load plans'}</Text>
      ) : plans.length === 0 ? (
        <View style={{ backgroundColor: '#fff7ed', padding: 16, borderRadius: 16 }}>
          <Text style={{ fontWeight: '700' }}>No plans yet</Text>
          <Text>Create your first workout plan below.</Text>
        </View>
      ) : (
        plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={startEdit}
            onActivate={(p) => activateMutation.mutate(p.id)}
            onDeactivate={(p) => deactivateMutation.mutate(p.id)}
          />
        ))
      )}

      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>{title}</Text>
        <PlanFieldHelp text="Plan name: the label shown in the plans list and workout scheduling." />
        <TextInput value={draft.name} onChangeText={(name) => setDraft((prev: any) => ({ ...prev, name }))} placeholder="Plan name" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
        <PlanFieldHelp text="Goals: comma-separated tags describing the plan's purpose. Example: strength, hypertrophy." />
        <TextInput value={safeArray<string>(draft.goals).join(', ')} onChangeText={(text) => setDraft((prev: any) => ({ ...prev, goals: text.split(',').map((g) => g.trim()).filter(Boolean) }))} placeholder="Goals (comma separated)" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
        <PlanFieldHelp text="Progressive overload: mark this on when the plan should be used to track increasing training load over time." />
        <TextInput value={String(!!draft.progressiveOverloadEnabled)} onChangeText={(text) => setDraft((prev: any) => ({ ...prev, progressiveOverloadEnabled: text.toLowerCase() === 'true' }))} placeholder="Progressive overload (true/false)" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
        <PlanFieldHelp text="Activate on save: save the plan as the currently active plan for the user." />
        <TextInput value={String(!!draft.isActive)} onChangeText={(text) => setDraft((prev: any) => ({ ...prev, isActive: text.toLowerCase() === 'true' }))} placeholder="Activate plan on save (true/false)" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />

        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '700' }}>Day {activeDayIndex + 1}</Text>
          <PlanFieldHelp text="Day of week: use the application's schedule convention (0-6). Week index lets you repeat the same day across a multi-week plan." />
          <TextInput value={String(draftDay.dayOfWeek ?? 0)} onChangeText={(text) => updateDay((day) => ({ ...day, dayOfWeek: Number(text) }))} placeholder="Day of week (0-6)" keyboardType="numeric" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
          <PlanFieldHelp text="Workout title: optional short name for this scheduled workout day, such as Lower Body or Push Day." />
          <TextInput value={String(draftDay.title ?? '')} onChangeText={(text) => updateDay((day) => ({ ...day, title: text }))} placeholder="Workout title" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
          <PlanFieldHelp text="Week index: 0 is the first week in the plan, 1 is the second, and so on." />
          <TextInput value={String(draftDay.weekIndex ?? 0)} onChangeText={(text) => updateDay((day) => ({ ...day, weekIndex: Number(text) }))} placeholder="Week index" keyboardType="numeric" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
          <Pressable onPress={() => updateDay((day) => ({ ...day, exercises: [...safeArray<PlanDayExercise>(day.exercises), { exerciseName: '', setsTarget: 3, repsTarget: 8, weightTarget: null }] }))} style={{ backgroundColor: '#e5e7eb', padding: 12, borderRadius: 12 }}>
            <Text style={{ textAlign: 'center', fontWeight: '700' }}>Add Exercise</Text>
          </Pressable>
          {(safeArray<PlanDayExercise>(draftDay.exercises)).map((exercise: any, exerciseIndex: number) => (
            <View key={`${exerciseIndex}`} style={{ gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#f9fafb' }}>
              <PlanFieldHelp text="Exercise name: choose from suggested exercises when available, or type a custom exercise name if it is not listed." />
              <SuggestionInput
                value={String(exercise.exerciseName ?? '')}
                onChangeText={(text) => updateDay((day) => {
                  const exercises = safeArray<PlanDayExercise>(day.exercises).slice();
                  exercises[exerciseIndex] = { ...exercises[exerciseIndex], exerciseName: text };
                  return { ...day, exercises };
                })}
                suggestions={EXERCISE_SUGGESTIONS}
                placeholder="Exercise name"
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <PlanFieldHelp text="Sets target: planned number of working sets for this exercise." />
                  <TextInput value={String(exercise.setsTarget ?? 0)} onChangeText={(text) => updateDay((day) => {
                    const exercises = safeArray<PlanDayExercise>(day.exercises).slice();
                    exercises[exerciseIndex] = { ...exercises[exerciseIndex], setsTarget: Number(text) };
                    return { ...day, exercises };
                  })} placeholder="Sets" keyboardType="numeric" style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 10 }} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <PlanFieldHelp text="Reps target: planned repetitions per set for this exercise." />
                  <TextInput value={String(exercise.repsTarget ?? 0)} onChangeText={(text) => updateDay((day) => {
                    const exercises = safeArray<PlanDayExercise>(day.exercises).slice();
                    exercises[exerciseIndex] = { ...exercises[exerciseIndex], repsTarget: Number(text) };
                    return { ...day, exercises };
                  })} placeholder="Reps" keyboardType="numeric" style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 10 }} />
                </View>
              </View>
              <PlanFieldHelp text="Weight target: optional planned load. Leave empty if bodyweight or if you want to track the weight later." />
              <TextInput value={exercise.weightTarget === null || exercise.weightTarget === undefined ? '' : String(exercise.weightTarget)} onChangeText={(text) => updateDay((day) => {
                const exercises = safeArray<PlanDayExercise>(day.exercises).slice();
                exercises[exerciseIndex] = { ...exercises[exerciseIndex], weightTarget: text === '' ? null : Number(text) };
                return { ...day, exercises };
              })} placeholder="Weight" keyboardType="numeric" style={{ borderWidth: 1, padding: 12, borderRadius: 10 }} />
              <PlanFieldHelp text="Use remove only when you want to delete this exercise from the current day." />
              <Pressable onPress={() => updateDay((day) => {
                const exercises = safeArray<PlanDayExercise>(day.exercises).slice();
                exercises.splice(exerciseIndex, 1);
                return { ...day, exercises };
              })} style={{ backgroundColor: '#fee2e2', padding: 10, borderRadius: 10 }}>
                <Text style={{ textAlign: 'center', fontWeight: '700', color: '#991b1b' }}>Remove Exercise</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {safeArray<PlanDay>(draft.days).map((day: PlanDay, index: number) => (
            <Pressable key={`${day.dayOfWeek}-${index}`} onPress={() => setActiveDayIndex(index)} style={{ backgroundColor: index === activeDayIndex ? '#2563eb' : '#e5e7eb', padding: 10, borderRadius: 999 }}>
              <Text style={{ color: index === activeDayIndex ? 'white' : '#111827', fontWeight: '700' }}>Day {index + 1}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setDraft((prev: any) => ({ ...prev, days: [...safeArray<PlanDay>(prev.days), emptyDay((safeArray<PlanDay>(prev.days).length % 7))] }))} style={{ backgroundColor: '#dbeafe', padding: 10, borderRadius: 999 }}>
            <Text style={{ fontWeight: '700' }}>+ Add Day</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 14, opacity: saveMutation.isPending ? 0.7 : 1 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>{saveMutation.isPending ? 'Saving...' : 'Save Plan'}</Text>
          </Pressable>
          <Pressable onPress={resetDraft} style={{ backgroundColor: '#e5e7eb', padding: 14, borderRadius: 14 }}>
            <Text style={{ fontWeight: '700' }}>{isCreating ? 'Reset New Plan' : 'New Plan'}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
