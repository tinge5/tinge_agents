import React, { useMemo, useState } from 'react';
import {
  EXERCISE_AUTOCOMPLETE_OPTIONS,
  getExerciseProgressionRule,
} from '../../shared/exerciseLibrary';
import { Alert, ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activatePlan,
  createPlan,
  deactivatePlan,
  deletePlan,
  getPlans,
  type Plan,
  type PlanDay,
  type PlanDayExercise,
  updatePlan,
} from '@/shared/api/client';

const DAYS_PER_WEEK = 7;
const DAY_OF_WEEK_OPTIONS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
] as const;

const DAY_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const emptyDay = (dayOfWeek: number): PlanDay => ({
  dayOfWeek,
  weekIndex: 0,
  title: '',
  exercises: [],
});

const defaultDraft = (): {
  id?: string;
  userId?: string;
  name: string;
  goals: string[];
  isActive: boolean;
  progressiveOverloadEnabled: boolean;
  currentWeekIndex: number;
  durationWeeks: number;
  startDate?: string | null;
  days: PlanDay[];
} => ({
  userId: undefined,
  name: '',
  goals: ['strength'],
  isActive: false,
  progressiveOverloadEnabled: false,
  currentWeekIndex: 0,
  durationWeeks: 4,
  startDate: null,
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

const booleanOptions = [
  { label: 'True', value: true },
  { label: 'False', value: false },
];

const durationOptions = [4, 6, 8, 12];

function normalizeExerciseName(name: unknown) {
  return typeof name === 'string' ? name.trim() : '';
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeDayOfWeek(value: unknown, fallback = 1) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 6) return parsed;
  return fallback;
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
    durationWeeks: Number(plan.durationWeeks ?? 4),
    startDate: plan.startDate ?? null,
    days: safeArray<PlanDay>(plan.days).length
      ? safeArray<PlanDay>(plan.days).map((day, index) => ({
          dayOfWeek: normalizeDayOfWeek((day as any)?.dayOfWeek, index % DAYS_PER_WEEK),
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

function SelectField<T extends string | number | boolean>({
  value,
  onChangeValue,
  options,
}: {
  value: T;
  onChangeValue: (value: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.label}
            onPress={() => onChangeValue(option.value)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selected ? '#2563eb' : '#d1d5db',
              backgroundColor: selected ? '#2563eb' : 'white',
            }}
          >
            <Text style={{ color: selected ? 'white' : '#111827', fontWeight: '700' }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SuggestionInput({
  value,
  onChangeText,
  suggestions,
  placeholder,
  onSuggestionSelect,
}: {
  value: string;
  onChangeText: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  onSuggestionSelect?: (value: string) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 6);
  const selectSuggestion = (item: string) => {
    onChangeText(item);
    onSuggestionSelect?.(item);
    setShowSuggestions(false);
  };
  return (
    <View style={{ gap: 6, position: 'relative', zIndex: 20 }}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 350)}
        placeholder={placeholder}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />
      {showSuggestions && filtered.length > 0 ? (
        <View style={{ gap: 6, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 8, backgroundColor: 'white', zIndex: 30, elevation: 8 }}>
          {filtered.map((item) => (
            <Pressable
              key={item}
              onPressIn={() => selectSuggestion(item)}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ fontWeight: '600' }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function PlanCard({
  plan,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  plan: Plan;
  onView: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onActivate: (plan: Plan) => void;
  onDeactivate: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}) {
  const goals = safeArray<string>(plan.goals);
  const days = safeArray<PlanDay>(plan.days);
  return (
    <View style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, gap: 8 }}>
      <Text style={{ fontWeight: '700', fontSize: 18 }}>{plan.name}</Text>
      <Text>Goals: {goals.length ? goals.join(', ') : 'None'}</Text>
      <Text>Progressive overload: {plan.progressiveOverloadEnabled ? 'enabled' : 'disabled'}</Text>
      <Text>Status: {plan.status}{plan.isActive ? ' (active)' : ''}</Text>
      <Text>Duration: {plan.durationWeeks ?? 4} weeks</Text>
      <Text>Start date: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not set'}</Text>
      <Text>Schedule: {days.length ? days.map((day) => `${typeof day.title === 'string' && day.title.trim() ? day.title : `Day ${Number(day.dayOfWeek) + 1}`} (${DAY_LABELS[normalizeDayOfWeek(day.dayOfWeek)]})`).join(', ') : 'No days configured'}</Text>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Pressable onPress={() => onView(plan)} style={{ backgroundColor: '#0f766e', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>View Plan</Text>
        </Pressable>
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
        <Pressable onPress={() => onDelete(plan)} style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#991b1b', fontWeight: '700' }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function previewWeeks(startWeek: number, durationWeeks: number) {
  return Array.from({ length: Math.max(1, durationWeeks) }, (_, index) => startWeek + index);
}

function applyProgressionToExercise(
  exercise: PlanDayExercise,
  weekIndex: number,
  enabled: boolean,
) {
  if (!enabled || weekIndex <= 0) return exercise;

  const rule = getExerciseProgressionRule(exercise.exerciseName);

  const setsBase = Number(exercise.setsTarget ?? 0);
  const repsBase = Number(exercise.repsTarget ?? 0);
  const weightBase =
    typeof exercise.weightTarget === 'number'
      ? exercise.weightTarget
      : null;

  const rounds = weekIndex;

  let setsTarget = Math.max(1, setsBase);
  let repsTarget = Math.max(1, repsBase);
  let weightTarget = weightBase;

  if (rule.sets?.type === 'increment') {
    setsTarget = Math.max(
      rule.sets.min ?? 1,
      setsBase + rule.sets.value * rounds,
    );
  }

  if (rule.reps?.type === 'increment') {
    repsTarget = Math.max(
      rule.reps.min ?? 1,
      repsBase + rule.reps.value * rounds,
    );
  }

  if (rule.weight?.type === 'increment' && weightBase !== null) {
    const calculatedWeight =
      weightBase + rule.weight.value * rounds;

    weightTarget = Math.ceil(calculatedWeight / 5) * 5;
  }

  if (rule.weight?.type === 'percent' && weightBase !== null) {
    const calculatedWeight =
      weightBase * (1 + rule.weight.value * rounds);

    weightTarget = Math.ceil(calculatedWeight / 5) * 5;
  }

  if (rule.strategy === 'bodyweight' && weightBase === null) {
    weightTarget = null;
  }

  return {
    ...exercise,
    setsTarget,
    repsTarget,
    weightTarget,
  };
}
function getPreviewedDays(plan: any, weekIndex: number) {
  const days = safeArray<PlanDay>(plan.days).filter((day) => Number(day.weekIndex ?? 0) === weekIndex);
  return days.length ? days.map((day) => ({ ...day, exercises: safeArray<PlanDayExercise>(day.exercises).map((exercise) => applyProgressionToExercise(exercise, weekIndex, !!plan.progressiveOverloadEnabled)) })) : safeArray<PlanDay>(plan.days).filter((day) => Number(day.weekIndex ?? 0) === 0).map((day) => ({ ...day, exercises: safeArray<PlanDayExercise>(day.exercises).map((exercise) => applyProgressionToExercise(exercise, weekIndex, !!plan.progressiveOverloadEnabled)) }));
}

export function PlanEditorScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const [draft, setDraft] = useState<any>(defaultDraft());
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedPreviewWeek, setSelectedPreviewWeek] = useState(1);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const plans = data ?? [];
  const title = useMemo(() => (editingPlanId ? 'Edit Plan' : 'Create Plan'), [editingPlanId]);
  const totalWeeks = Math.max(1, Number(draft.durationWeeks ?? 4));
  const previewWeekNumbers = previewWeeks(1, totalWeeks);
  const previewedDays = useMemo(() => getPreviewedDays(draft, selectedPreviewWeek - 1), [draft, selectedPreviewWeek]);
  const draftDay: PlanDay = safeArray<PlanDay>(draft.days)[activeDayIndex] ?? emptyDay(0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: String(draft.name ?? '').trim(),
        goals: safeArray<string>(draft.goals).map((goal) => String(goal).trim()).filter(Boolean),
        progressiveOverloadEnabled: !!draft.progressiveOverloadEnabled,
        isActive: !!draft.isActive,
        durationWeeks: Number(draft.durationWeeks ?? 4),
        startDate: draft.startDate ?? null,
        days: safeArray<PlanDay>(draft.days).map((day: PlanDay, index: number) => ({
          ...day,
          dayOfWeek: normalizeDayOfWeek((day as any)?.dayOfWeek, index % DAYS_PER_WEEK),
          weekIndex: Number((day as any)?.weekIndex ?? 0),
          position: index,
          title: String((day as any)?.title ?? '').trim(),
          exercises: safeArray<PlanDayExercise>((day as any)?.exercises).map((exercise, exerciseIndex) => ({
            ...exercise,
            exerciseName: normalizeExerciseName((exercise as any)?.exerciseName),
            exerciseId: (exercise as any)?.exerciseId ?? null,
            setsTarget: Number((exercise as any)?.setsTarget ?? 0),
            repsTarget: Number((exercise as any)?.repsTarget ?? 0),
            weightTarget: (exercise as any)?.weightTarget === '' || (exercise as any)?.weightTarget === null || (exercise as any)?.weightTarget === undefined ? null : Number((exercise as any)?.weightTarget),
            order: exerciseIndex,
          })),
        })),
      };
      return editingPlanId ? updatePlan(editingPlanId, payload) : createPlan(payload);
    },
    onSuccess: async (savedPlan) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditingPlanId(savedPlan.id);
      setDraft(toDraftPlan(savedPlan));
      setSelectedPreviewWeek(1);
      setViewMode('edit');
      Alert.alert('Saved', 'Plan has been saved successfully.');
    },
    onError: (err: any) => Alert.alert('Save failed', err?.message ?? 'Unable to save plan'),
  });

  const activateMutation = useMutation({ mutationFn: activatePlan, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['plans'] }); await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] }); }, onError: (err: any) => Alert.alert('Activation failed', err?.message ?? 'Unable to activate plan') });
  const deactivateMutation = useMutation({ mutationFn: deactivatePlan, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['plans'] }); await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] }); }, onError: (err: any) => Alert.alert('Deactivation failed', err?.message ?? 'Unable to deactivate plan') });
  const deleteMutation = useMutation({ mutationFn: deletePlan, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['plans'] }); await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] }); resetDraft(); Alert.alert('Deleted', 'Plan has been deleted successfully.'); }, onError: (err: any) => Alert.alert('Delete failed', err?.message ?? 'Unable to delete plan') });

  const startEdit = (plan: Plan) => { setEditingPlanId(plan.id); setDraft(toDraftPlan(plan)); setActiveDayIndex(0); setSelectedPreviewWeek(1); setViewMode('edit'); };
  const startView = (plan: Plan) => { setEditingPlanId(plan.id); setDraft(toDraftPlan(plan)); setActiveDayIndex(0); setSelectedPreviewWeek(1); setViewMode('view'); };
  const resetDraft = () => { setEditingPlanId(null); setDraft(defaultDraft()); setActiveDayIndex(0); setSelectedPreviewWeek(1); setViewMode('edit'); };
  const updateDay = (updater: (day: PlanDay) => PlanDay) => { setDraft((prev: any) => { const days = safeArray<PlanDay>(prev.days).slice(); days[activeDayIndex] = updater(days[activeDayIndex] ?? emptyDay(0)); return { ...prev, days }; }); };
  const addDay = () => {
    setDraft((prev: any) => {
      const days = safeArray<PlanDay>(prev.days).slice();
      const nextDayOfWeek = days.length
        ? days[days.length - 1]?.dayOfWeek === 6
          ? 0
          : normalizeDayOfWeek(Number(days[days.length - 1]?.dayOfWeek ?? 0) + 1, 1)
        : 1;
      days.push(emptyDay(nextDayOfWeek));
      return { ...prev, days };
    });
    setActiveDayIndex(safeArray<PlanDay>(draft.days).length);
  };
  const removeDayAtIndex = (dayIndex: number) => {
    setDraft((prev: any) => {
      const days = safeArray<PlanDay>(prev.days).filter((_: PlanDay, index: number) => index !== dayIndex);
      return { ...prev, days: days.length ? days : [emptyDay(1)] };
    });
    setActiveDayIndex((current) => Math.max(0, Math.min(current, Math.max(0, safeArray<PlanDay>(draft.days).length - 2))));
  };
  const allDays = safeArray<PlanDay>(draft.days);

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Plans</Text>
      <Text style={{ color: '#6b7280' }}>Use the New Plan action to start a fresh plan. Edit existing plans from the list below.</Text>
      <Pressable onPress={resetDraft} style={{ backgroundColor: '#dbeafe', padding: 12, borderRadius: 12, alignSelf: 'flex-start' }}><Text style={{ fontWeight: '700' }}>New Plan</Text></Pressable>
      {isLoading ? <View style={{ paddingVertical: 40 }}><ActivityIndicator /></View> : isError ? <Text style={{ color: '#b91c1c' }}>{(error as Error)?.message ?? 'Unable to load plans'}</Text> : plans.length === 0 ? <View style={{ backgroundColor: '#fff7ed', padding: 16, borderRadius: 16 }}><Text style={{ fontWeight: '700' }}>No plans yet</Text><Text>Create your first workout plan below.</Text></View> : plans.map((plan) => <PlanCard key={plan.id} plan={plan} onView={startView} onEdit={startEdit} onActivate={(p) => activateMutation.mutate(p.id)} onDeactivate={(p) => deactivateMutation.mutate(p.id)} onDelete={(p) => Alert.alert('Delete plan?', `This will permanently delete "${p.name}" and all of its workout days. This cannot be undone.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(p.id) }])} />)}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>{viewMode === 'view' ? 'View Plan' : title}</Text>
        {viewMode === 'edit' ? (
          <>
            <PlanFieldHelp text="Plan name: the label shown in the plans list and workout scheduling." />
            <TextInput value={draft.name} onChangeText={(name) => setDraft((prev: any) => ({ ...prev, name }))} placeholder="Plan name" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
            <PlanFieldHelp text="Goals: comma-separated tags describing the plan's purpose. Example: strength, hypertrophy." />
            <TextInput value={safeArray<string>(draft.goals).join(', ')} onChangeText={(text) => setDraft((prev: any) => ({ ...prev, goals: text.split(',').map((g) => g.trim()).filter(Boolean) }))} placeholder="Goals (comma separated)" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
            <PlanFieldHelp text="Plan duration: choose how many weeks the plan should run before it ends." />
            <SelectField value={Number(draft.durationWeeks ?? 4)} onChangeValue={(value) => setDraft((prev: any) => ({ ...prev, durationWeeks: Number(value) }))} options={durationOptions.map((value) => ({ label: `${value} weeks`, value }))} />
            <PlanFieldHelp text="Progressive overload: choose True or False for whether the plan should use progressive overload tracking." />
            <SelectField value={!!draft.progressiveOverloadEnabled} onChangeValue={(value) => setDraft((prev: any) => ({ ...prev, progressiveOverloadEnabled: value }))} options={booleanOptions} />
            <PlanFieldHelp text="Activate on save: choose True or False to determine whether the plan is saved as active." />
            <SelectField value={!!draft.isActive} onChangeValue={(value) => setDraft((prev: any) => ({ ...prev, isActive: value }))} options={booleanOptions} />
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ fontWeight: '700' }}>Workout Days</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={addDay} style={{ backgroundColor: '#dbeafe', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}>
                    <Text style={{ fontWeight: '700', color: '#1d4ed8' }}>Add Day</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (!allDays.length) return;
                      const day = allDays[activeDayIndex] ?? allDays[0];
                      const label = day.title?.trim() || `Day ${activeDayIndex + 1}`;
                      Alert.alert(
                        'Delete day?',
                        `This will permanently delete ${label} and all exercises in it. This cannot be undone.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete Day',
                            style: 'destructive',
                            onPress: () => removeDayAtIndex(activeDayIndex),
                          },
                        ],
                      );
                    }}
                    style={{ backgroundColor: '#fee2e2', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}
                  >
                    <Text style={{ fontWeight: '700', color: '#991b1b' }}>Delete Day</Text>
                  </Pressable>
                </View>
              </View>
              <PlanFieldHelp text="Add Day creates a new workout day in the plan. Select a weekday, then add exercises exactly like any existing day." />
              <PlanFieldHelp text="Delete Day removes the currently selected workout day and all of its exercises after confirmation." />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {allDays.map((day, index) => {
                  const selected = index === activeDayIndex;
                  const label = day.title?.trim() || `Day ${index + 1}`;
                  return (
                    <Pressable
                      key={`${day.position ?? index}-${index}`}
                      onPress={() => setActiveDayIndex(index)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        backgroundColor: selected ? '#2563eb' : '#e5e7eb',
                      }}
                    >
                      <Text style={{ color: selected ? 'white' : '#111827', fontWeight: '700' }}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={{ fontWeight: '700' }}>Day {activeDayIndex + 1}</Text>
              <PlanFieldHelp text="Choose the calendar day of the week for this workout. The app preserves the internal Day 1, Day 2, Day 3 ordering automatically." />
              <SelectField value={normalizeDayOfWeek(draftDay.dayOfWeek, 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6} onChangeValue={(value) => updateDay((day) => ({ ...day, dayOfWeek: Number(value) }))} options={DAY_OF_WEEK_OPTIONS as any} />
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Selected: {DAY_LABELS[normalizeDayOfWeek(draftDay.dayOfWeek, 1)]}</Text>
              <PlanFieldHelp text="Workout title: optional short name for this scheduled workout day, such as Lower Body or Push Day." />
              <TextInput value={String(draftDay.title ?? '')} onChangeText={(text) => updateDay((day) => ({ ...day, title: text }))} placeholder="Workout title" style={{ borderWidth: 1, padding: 14, borderRadius: 12 }} />
              <Pressable onPress={() => updateDay((day) => ({ ...day, exercises: [...safeArray<PlanDayExercise>(day.exercises), { exerciseName: '', setsTarget: 3, repsTarget: 8, weightTarget: null }] }))} style={{ backgroundColor: '#e5e7eb', padding: 12, borderRadius: 12 }}><Text style={{ textAlign: 'center', fontWeight: '700' }}>Add Exercise</Text></Pressable>
              {safeArray<PlanDayExercise>(draftDay.exercises).map((exercise: any, exerciseIndex: number) => (
                <View key={`${exerciseIndex}`} style={{ gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#f9fafb' }}>
                  <PlanFieldHelp text="Exercise name: choose from suggested exercises when available, or type a custom exercise name if it is not listed." />
                  <SuggestionInput
                    value={String(exercise.exerciseName ?? '')}
                    onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], exerciseName: text }; return { ...day, exercises }; })}
                    onSuggestionSelect={(selectedExercise) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], exerciseName: selectedExercise, exerciseId: exercises[exerciseIndex]?.exerciseId ?? null }; return { ...day, exercises }; })}
                    suggestions={EXERCISE_AUTOCOMPLETE_OPTIONS}
                    placeholder="Exercise name"
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <PlanFieldHelp text="Sets target: planned number of working sets for this exercise." />
                      <TextInput value={String(exercise.setsTarget ?? 0)} onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], setsTarget: Number(text) }; return { ...day, exercises }; })} placeholder="Sets" keyboardType="numeric" style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 10 }} />
                    </View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <PlanFieldHelp text="Reps target: planned repetitions per set for this exercise." />
                      <TextInput value={String(exercise.repsTarget ?? 0)} onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], repsTarget: Number(text) }; return { ...day, exercises }; })} placeholder="Reps" keyboardType="numeric" style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 10 }} />
                    </View>
                  </View>
                  <PlanFieldHelp text="Weight target: optional planned load. Leave empty if bodyweight or if you want to track the weight later." />
                  <TextInput value={exercise.weightTarget === null || exercise.weightTarget === undefined ? '' : String(exercise.weightTarget)} onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], weightTarget: text === '' ? null : Number(text) }; return { ...day, exercises }; })} placeholder="Weight" keyboardType="numeric" style={{ borderWidth: 1, padding: 12, borderRadius: 10 }} />
                  <Pressable onPress={() => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises.splice(exerciseIndex, 1); return { ...day, exercises }; })} style={{ backgroundColor: '#fee2e2', padding: 10, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700', color: '#991b1b' }}>Remove Exercise</Text></Pressable>
                </View>
              ))}
            </View>
            <Pressable onPress={() => saveMutation.mutate()} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 12 }}><Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Save Plan</Text></Pressable>
          </>
        ) : (
          <>
            <PlanFieldHelp text="Viewing uses the exact selected plan's persisted days and exercises." />
            <Text>{draft.name || 'Untitled plan'}</Text>
            <Text>{safeArray<string>(draft.goals).join(', ') || 'No goals set'}</Text>
            <Text>{draft.isActive ? 'Active' : 'Inactive'}</Text>
            <Text>{draft.progressiveOverloadEnabled ? 'Progressive overload enabled' : 'Progressive overload disabled'}</Text>
            <Text>Duration: {draft.durationWeeks} weeks</Text>
            <Text>Week preview:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {previewWeekNumbers.map((weekNumber) => (
                <Pressable key={weekNumber} onPress={() => setSelectedPreviewWeek(weekNumber)} style={{ backgroundColor: selectedPreviewWeek === weekNumber ? '#2563eb' : '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 }}>
                  <Text style={{ color: selectedPreviewWeek === weekNumber ? 'white' : '#111827', fontWeight: '700' }}>Week {weekNumber}</Text>
                </Pressable>
              ))}
            </View>
            {previewedDays.map((day) => (
              <View key={`${day.dayOfWeek}-${day.position ?? 0}`} style={{ padding: 12, borderRadius: 12, backgroundColor: '#f9fafb', gap: 6 }}>
                <Text style={{ fontWeight: '700' }}>{day.title || `Day ${Number(day.dayOfWeek) + 1}`}</Text>
                <Text>{DAY_LABELS[normalizeDayOfWeek(day.dayOfWeek)]}</Text>
                {safeArray<PlanDayExercise>(day.exercises).map((exercise, index) => (
                  <View key={`${exercise.id ?? index}`} style={{ paddingLeft: 8 }}>
                    <Text>{exercise.exerciseName} — {exercise.setsTarget} x {exercise.repsTarget}{exercise.weightTarget !== null && exercise.weightTarget !== undefined ? ` @ ${exercise.weightTarget}` : ''}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
