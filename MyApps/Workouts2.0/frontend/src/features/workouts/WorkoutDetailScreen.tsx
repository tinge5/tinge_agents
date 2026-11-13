import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeWorkoutSession, getWorkoutHistory, saveWorkoutSetResult, startWorkoutSession, type TodayWorkout, type WorkoutHistorySession, type WorkoutSetResult } from '@/shared/api/client';
import { theme } from '@/shared/theme';

type WorkoutExercise = {
  id?: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  setsTarget?: number | null;
  repsTarget?: number | null;
  exerciseId?: string | null;
  previousPerformance?:
    | {
        sets?: number | null;
        reps?: number | null;
        prevReps?: number | null;
        weight?: number | null;
        prevWeight?: number | null;
        setResults?: Array<{ setNumber?: number | null; reps?: number | null; weight?: number | null }> | null;
      }
    | null;
  suggestedTarget?: { sets: number | null; reps: number | null; weight: number | null } | null;
};

type WorkoutInputState = Record<string, Array<{ reps: string; weight: string }>>;
type ExpandedState = Record<string, boolean>;
type CompletedSetResult = { exerciseName?: string; setNumber: number; reps: number | null; weight: number | null };
type WorkoutDraft = { inputs: WorkoutInputState; completedSets: Record<string, boolean> };

function getSetKey(exerciseName: string, setNumber: number) {
  return `${exerciseName.trim().toLowerCase()}:${setNumber}`;
}

function mergeSetResults(exercises: WorkoutExercise[], inputs: WorkoutInputState, setResults: WorkoutSetResult[]) {
  const nextInputs = { ...inputs };
  for (const result of setResults) {
    const exercise = exercises.find(item => item.name.trim().toLowerCase() === result.exerciseName.trim().toLowerCase());
    const setIndex = result.setNumber - 1;
    if (!exercise || setIndex < 0 || setIndex >= Math.max(0, exercise.sets ?? 0)) continue;
    const exerciseInputs = [...(nextInputs[exercise.name] ?? [])];
    exerciseInputs[setIndex] = {
      reps: String(result.reps),
      weight: String(result.weight),
    };
    nextInputs[exercise.name] = exerciseInputs;
  }
  return nextInputs;
}

function mergeInputDraft(exercises: WorkoutExercise[], inputs: WorkoutInputState, draftInputs: WorkoutInputState) {
  const nextInputs = { ...inputs };
  for (const exercise of exercises) {
    const plannedSets = Math.max(0, exercise.sets ?? 0);
    const currentValues = nextInputs[exercise.name] ?? [];
    const draftValues = draftInputs[exercise.name] ?? [];
    nextInputs[exercise.name] = Array.from({ length: plannedSets }, (_, index) => ({
      ...currentValues[index],
      ...draftValues[index],
    }));
  }
  return nextInputs;
}

function getCompletedSets(setResults: WorkoutSetResult[]) {
  return Object.fromEntries(
    setResults
      .filter(result => result.completed)
      .map(result => [getSetKey(result.exerciseName, result.setNumber), true])
  );
}

function getWorkoutDraftStorageKey(sessionId: string) {
  return `workouts2-workout-draft-${sessionId}`;
}

function toNumberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeNumericInput(value: string) {
  return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}

function buildInitialInputs(exercises: WorkoutExercise[]): WorkoutInputState {
  return Object.fromEntries(
    exercises.map(exercise => {
      const plannedSets = Math.max(0, exercise.sets ?? 0);
      const previousSetResults = exercise.previousPerformance?.setResults ?? [];
      const nextValues = Array.from({ length: plannedSets }, (_, index) => {
        const previousSet = previousSetResults.find(set => set.setNumber === index + 1);
        return {
          reps:
            previousSet?.reps != null
              ? String(previousSet.reps)
              : exercise.reps != null
                ? String(exercise.reps)
                : '',
          weight:
            previousSet?.weight != null
              ? String(previousSet.weight)
              : exercise.weight != null
                ? String(exercise.weight)
                : '',
        };
      });
      return [exercise.name, nextValues];
    })
  );
}

function buildInitialExpandedState(exercises: WorkoutExercise[]): ExpandedState {
  return Object.fromEntries(exercises.map(exercise => [exercise.name, false]));
}

function formatExerciseHeader(exercise: WorkoutExercise) {
  const sets = exercise.sets != null ? String(exercise.sets) : '—';
  const reps = exercise.repsTarget != null ? String(exercise.repsTarget) : exercise.reps != null ? String(exercise.reps) : '—';
  return `${exercise.name} — ${sets} × ${reps}`;
}

function groupSetResultsByExerciseName(setResults: CompletedSetResult[] = []) {
  const grouped = new Map<string, CompletedSetResult[]>();
  for (const setResult of setResults) {
    const key = 'exerciseName' in (setResult as any) ? String((setResult as any).exerciseName ?? '') : '';
    const groupedKey = key || 'Completed workout';
    const existing = grouped.get(groupedKey) ?? [];
    existing.push(setResult);
    grouped.set(groupedKey, existing);
  }
  return Array.from(grouped.entries()).map(([exerciseName, results]) => ({
    exerciseName,
    setResults: results.slice().sort((a, b) => a.setNumber - b.setNumber),
  }));
}

function formatSetLine(setResult: CompletedSetResult, index: number) {
  const reps = setResult.reps != null ? `${setResult.reps} reps` : '— reps';
  const weight = setResult.weight != null ? `${setResult.weight} lbs` : '— lbs';
  return `Set ${index + 1}: ${reps} × ${weight}`;
}

export function WorkoutDetailScreen({ route, navigation }: any) {
  const queryClient = useQueryClient();
  const workout: TodayWorkout = route?.params?.workout ?? { title: 'Workout', exercises: [] };
  const reviewOnly = Boolean(route?.params?.reviewOnly);
  const routeSessionId: string | undefined = route?.params?.workoutSessionId ?? workout?.workoutSessionId;
  const exercises = useMemo<WorkoutExercise[]>(() => workout?.exercises ?? [], [workout?.exercises]);
  const [sessionSetResults, setSessionSetResults] = useState<WorkoutSetResult[]>(() => workout?.setResults ?? []);
  const [inputs, setInputs] = useState<WorkoutInputState>(() =>
    mergeSetResults(exercises, buildInitialInputs(exercises), workout?.setResults ?? [])
  );
  const [expanded, setExpanded] = useState<ExpandedState>(() => buildInitialExpandedState(exercises));
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>(() => getCompletedSets(workout?.setResults ?? []));
  const [draftLoadedSessionId, setDraftLoadedSessionId] = useState<string | null>(null);
  const [draftStorageStatus, setDraftStorageStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [draftStorageError, setDraftStorageError] = useState<string | null>(null);
  const [savingSetKeys, setSavingSetKeys] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(workout?.status === 'completed');
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(routeSessionId);
  const startRequested = useRef(Boolean(routeSessionId));
  const completedState = reviewOnly || isCompleted || workout?.status === 'completed';
  const isDraftLoaded = Boolean(activeSessionId && draftLoadedSessionId === activeSessionId);

  useEffect(() => {
    if (routeSessionId) setActiveSessionId(routeSessionId);
  }, [routeSessionId]);

  useEffect(() => {
    if (workout?.status === 'completed' || reviewOnly) {
      setIsCompleted(true);
    }
  }, [reviewOnly, workout?.status]);

  useEffect(() => {
    setInputs(prev => {
      const next = mergeSetResults(exercises, mergeInputDraft(exercises, buildInitialInputs(exercises), prev), sessionSetResults);
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const sameLength = prevKeys.length === nextKeys.length;
      const sameValues = sameLength && nextKeys.every(key => JSON.stringify(prev[key]) === JSON.stringify(next[key]));
      return sameValues ? prev : next;
    });
    setExpanded(prev => {
      const next = buildInitialExpandedState(exercises);
      return Object.keys(prev).length === Object.keys(next).length ? { ...next, ...prev } : next;
    });
  }, [exercises, sessionSetResults]);

  const completedWorkoutQuery = useQuery({
    queryKey: ['workouts', 'completed-review', activeSessionId ?? routeSessionId],
    enabled: completedState && Boolean(activeSessionId ?? routeSessionId),
    queryFn: async () => {
      const data = await getWorkoutHistory();
      const sessions = Array.isArray(data) ? (data as WorkoutHistorySession[]) : [];
      const sessionId = activeSessionId ?? routeSessionId;

      return (
        sessions.find(
          session =>
            session.id === sessionId ||
            session.workoutSessionId === sessionId
        ) ?? null
      );
    },
  });

  const reviewSetResults = useMemo(() => {
    const session = completedWorkoutQuery.data;
    const rawSetResults = (session?.setResults ?? []).filter(setResult => setResult.completed);
    return rawSetResults
      .slice()
      .sort((a, b) => {
        if (a.exerciseName === b.exerciseName) return a.setNumber - b.setNumber;
        return (a.exerciseName ?? '').localeCompare(b.exerciseName ?? '');
      })
      .reduce<Array<{ exerciseName: string; setResults: CompletedSetResult[] }>>((acc, setResult) => {
        const last = acc[acc.length - 1];
        if (last && last.exerciseName === setResult.exerciseName) {
          last.setResults.push({ setNumber: setResult.setNumber, reps: setResult.reps, weight: setResult.weight });
        } else {
          acc.push({ exerciseName: setResult.exerciseName, setResults: [{ setNumber: setResult.setNumber, reps: setResult.reps, weight: setResult.weight }] });
        }
        return acc;
      }, [])
      .map(group => ({
        exerciseName: group.exerciseName,
        setResults: group.setResults.sort((a, b) => a.setNumber - b.setNumber),
      }));
  }, [completedWorkoutQuery.data]);

  const startMutation = useMutation({
    mutationFn: startWorkoutSession,
    onSuccess: data => {
      setActiveSessionId(data.id);
      setSessionSetResults(data.setResults ?? []);
      startRequested.current = true;
    },
    onError: error => {
      startRequested.current = false;
      Alert.alert('Unable to start workout', (error as Error)?.message ?? 'Please try again.');
    },
  });

  useEffect(() => {
    if (completedState || activeSessionId || startRequested.current) return;
    startRequested.current = true;
    startMutation.mutate();
  }, [activeSessionId, completedState]);

  useEffect(() => {
    if (completedState || reviewOnly || !activeSessionId) return;
    let cancelled = false;

    const restoreWorkoutDraft = async () => {
      setDraftLoadedSessionId(null);
      setDraftStorageError(null);
      let restoredInputs = mergeSetResults(exercises, buildInitialInputs(exercises), sessionSetResults);
      let restoredCompletedSets = getCompletedSets(sessionSetResults);

      try {
        const storedDraft = await AsyncStorage.getItem(getWorkoutDraftStorageKey(activeSessionId));
        if (storedDraft) {
          const parsed = JSON.parse(storedDraft) as Partial<WorkoutDraft>;
          if (parsed.inputs && typeof parsed.inputs === 'object') {
            restoredInputs = mergeInputDraft(exercises, restoredInputs, parsed.inputs);
          }
          if (parsed.completedSets && typeof parsed.completedSets === 'object') {
            const savedCompletionValues = Object.fromEntries(
              Object.entries(parsed.completedSets).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
            );
            restoredCompletedSets = { ...restoredCompletedSets, ...savedCompletionValues };
          }
        }
      } catch (error) {
        setDraftStorageStatus('error');
        setDraftStorageError((error as Error)?.message ?? 'Unable to restore the saved workout draft.');
      }

      if (cancelled) return;
      setInputs(restoredInputs);
      setCompletedSets(restoredCompletedSets);
      setDraftLoadedSessionId(activeSessionId);
    };

    void restoreWorkoutDraft();
    return () => {
      cancelled = true;
    };
  }, [activeSessionId, completedState, exercises, reviewOnly, sessionSetResults]);

  useEffect(() => {
    if (!activeSessionId || !isDraftLoaded || completedState) return;
    let active = true;
    setDraftStorageStatus('saving');

    AsyncStorage.setItem(
      getWorkoutDraftStorageKey(activeSessionId),
      JSON.stringify({ inputs, completedSets } satisfies WorkoutDraft)
    ).then(() => {
      if (active) {
        setDraftStorageStatus('saved');
        setDraftStorageError(null);
      }
    }).catch(error => {
      if (active) {
        setDraftStorageStatus('error');
        setDraftStorageError((error as Error)?.message ?? 'Unable to save the workout draft on this device.');
      }
    });

    return () => {
      active = false;
    };
  }, [activeSessionId, completedSets, completedState, inputs, isDraftLoaded]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      let resolvedSessionId = activeSessionId ?? routeSessionId;

      if (!resolvedSessionId) {
        const startedSession = await startWorkoutSession();
        const startedSessionId = startedSession.id;
        if (!startedSessionId) throw new Error('Unable to obtain workout session id');
        resolvedSessionId = startedSessionId;
        setActiveSessionId(startedSessionId);
        setSessionSetResults(startedSession.setResults ?? []);
      }

      for (const exercise of exercises) {
        const plannedSets = Math.max(0, exercise.sets ?? 0);
        const exerciseInputs = inputs[exercise.name] ?? [];
        for (let index = 0; index < plannedSets; index += 1) {
          const input = exerciseInputs[index] ?? { reps: '', weight: '' };
          const reps = toNumberOrNull(input.reps);
          const weight = toNumberOrNull(input.weight);

          if (reps == null && weight == null) continue;

          await saveWorkoutSetResult(resolvedSessionId, {
            exerciseName: exercise.name,
            exerciseId: exercise.exerciseId ?? null,
            setNumber: index + 1,
            reps: reps ?? 0,
            weight: weight ?? 0,
            completed: true,
          });
        }
      }

      return completeWorkoutSession(resolvedSessionId);
    },
    onSuccess: async () => {
      setIsCompleted(true);
      const completedSessionId = activeSessionId ?? routeSessionId;
      if (completedSessionId) {
        try {
          await AsyncStorage.removeItem(getWorkoutDraftStorageKey(completedSessionId));
        } catch (error) {
          setDraftStorageStatus('error');
          setDraftStorageError((error as Error)?.message ?? 'Workout completed, but its local draft could not be cleared.');
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      navigation?.navigate?.('Workout');
    },
    onError: error => {
      Alert.alert('Unable to complete workout', (error as Error)?.message ?? 'Please try again.');
    },
  });

  const handleMarkCompleted = async () => {
    if (reviewOnly || isCompleted || workout?.status === 'completed' || !activeSessionId || !isDraftLoaded) return;
    setIsSubmitting(true);
    try {
      await completeMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetInputChange = (exercise: WorkoutExercise, setIndex: number, field: 'reps' | 'weight', text: string) => {
    const plannedSets = Math.max(0, exercise.sets ?? 0);
    setInputs(prev => ({
      ...prev,
      [exercise.name]: Array.from({ length: plannedSets }, (_, index) => prev[exercise.name]?.[index] ?? { reps: '', weight: '' })
        .map((item, index) => index === setIndex ? { ...item, [field]: sanitizeNumericInput(text) } : item),
    }));
    setCompletedSets(prev => ({ ...prev, [getSetKey(exercise.name, setIndex + 1)]: false }));
  };

  const handleToggleSetCompleted = async (exercise: WorkoutExercise, setIndex: number) => {
    if (!activeSessionId || !isDraftLoaded) return;
    const setNumber = setIndex + 1;
    const key = getSetKey(exercise.name, setNumber);
    const nextCompleted = !completedSets[key];
    const input = inputs[exercise.name]?.[setIndex] ?? { reps: '', weight: '' };
    const reps = toNumberOrNull(input.reps);
    const weight = toNumberOrNull(input.weight);

    if (nextCompleted && reps == null && weight == null) {
      Alert.alert('Set not saved', 'Enter reps or weight before checking off this set.');
      return;
    }

    setSavingSetKeys(prev => ({ ...prev, [key]: true }));
    try {
      await saveWorkoutSetResult(activeSessionId, {
        exerciseName: exercise.name,
        exerciseId: exercise.exerciseId ?? null,
        setNumber,
        reps: reps ?? 0,
        weight: weight ?? 0,
        completed: nextCompleted,
      });
      setCompletedSets(prev => ({ ...prev, [key]: nextCompleted }));
    } catch (error) {
      Alert.alert('Unable to save set', (error as Error)?.message ?? 'The set could not be confirmed as saved. Please try again.');
    } finally {
      setSavingSetKeys(prev => ({ ...prev, [key]: false }));
    }
  };


  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text }}>{workout.title ?? 'Workout'}</Text>
      <Text style={{ color: theme.colors.text }}>
        {completedState
          ? 'Read-only review of your completed workout.'
          : workout?.status === 'in_progress'
            ? 'Resume your workout. Saved sets and your local draft are restored.'
            : 'Your set entries are saved as you go. You can also log everything and mark the workout complete at the end.'}
      </Text>

      {!completedState ? (
        <View style={{ gap: 4 }}>
          {(!activeSessionId || !isDraftLoaded) && !startMutation.isError ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textMuted }}>{activeSessionId ? 'Restoring workout…' : 'Starting workout…'}</Text>
            </View>
          ) : null}
          {activeSessionId && isDraftLoaded && draftStorageStatus === 'saved' ? (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Draft saved on this device. Checked sets are saved to your account.</Text>
          ) : null}
          {activeSessionId && isDraftLoaded && draftStorageStatus === 'saving' ? (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Saving draft on this device…</Text>
          ) : null}
          {draftStorageError ? <Text style={{ color: theme.colors.danger, fontSize: 12 }}>{draftStorageError}</Text> : null}
          {startMutation.isError && !activeSessionId ? (
            <Pressable
              onPress={() => {
                startRequested.current = true;
                startMutation.mutate();
              }}
              style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 10 }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Retry starting workout</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        {completedState ? (
          reviewSetResults.length > 0 ? (
            reviewSetResults.map(group => (
              <View key={group.exerciseName} style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 16, gap: 10, backgroundColor: theme.colors.surface }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
                  {group.exerciseName}
                </Text>
                <View style={{ gap: 8 }}>
                  {group.setResults.map((setResult, index) => (
                    <Text key={`${group.exerciseName}-${setResult.setNumber}`} style={{ color: theme.colors.textMuted }}>
                      {formatSetLine(setResult, index)}
                    </Text>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.textMuted }}>
              No completed set results found.
            </Text>
          )
        ) : !activeSessionId || !isDraftLoaded ? (
          <Text style={{ color: theme.colors.textMuted }}>Your workout will be ready as soon as the session is restored.</Text>
        ) : (
          exercises.map(exercise => {
            const value = inputs[exercise.name] ?? [];
            const isExpanded = expanded[exercise.name] ?? false;
            const plannedSets = Math.max(0, exercise.sets ?? 0);

            return (
              <View key={exercise.name} style={{ borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 16, gap: 10, backgroundColor: theme.colors.surface }}>
                <Pressable onPress={() => setExpanded(prev => ({ ...prev, [exercise.name]: !isExpanded }))} style={{ gap: 6 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{formatExerciseHeader(exercise)}</Text>
                  <Text style={{ color: theme.colors.primaryDark, textShadowColor: theme.colors.primaryDark, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 }}>{isExpanded ? 'Tap to collapse' : 'Tap to expand sets'}</Text>
                </Pressable>

                {exercise.suggestedTarget ? (
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontWeight: '700', color: theme.colors.text }}>Suggested Targeted Top Set</Text>
                    <Text style={{ color: theme.colors.text }}>{`${exercise.suggestedTarget.sets ?? '—'} × ${exercise.suggestedTarget.reps ?? '—'}${exercise.suggestedTarget.weight != null ? ` @ ${exercise.suggestedTarget.weight}` : ''}`}</Text>
                  </View>
                ) : null}

                {isExpanded && !completedState ? (
                  <View style={{ gap: 10 }}>
                  {exercise.previousPerformance ? <Text style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textMuted }}>Autofilled with Previous Performance</Text> : null}
                    {Array.from({ length: plannedSets }, (_, index) => {
                      const setValue = value[index] ?? { reps: '', weight: '' };
                      const setNumber = index + 1;
                      const setKey = getSetKey(exercise.name, setNumber);
                      const setIsCompleted = !!completedSets[setKey];
                      const isSavingSet = !!savingSetKeys[setKey];
                      return (
                        <View key={`${exercise.name}-set-${setNumber}`} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12, gap: 8, backgroundColor: theme.colors.background }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <Text style={{ fontWeight: '700', color: theme.colors.text }}>Set {setNumber}</Text>
                            <Pressable
                              onPress={() => void handleToggleSetCompleted(exercise, index)}
                              disabled={isSavingSet || isSubmitting || completeMutation.isPending}
                              accessibilityRole="checkbox"
                              accessibilityState={{ checked: setIsCompleted, disabled: isSavingSet || isSubmitting || completeMutation.isPending }}
                              accessibilityLabel={`${setIsCompleted ? 'Unsave' : 'Save'} ${exercise.name} set ${setNumber}`}
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: isSavingSet ? 0.6 : 1 }}
                            >
                              <View style={{
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                borderWidth: 2,
                                borderColor: setIsCompleted ? theme.colors.success : theme.colors.border,
                                backgroundColor: setIsCompleted ? theme.colors.success : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>{isSavingSet ? '…' : setIsCompleted ? '✓' : ''}</Text>
                              </View>
                              <Text style={{ color: setIsCompleted ? theme.colors.success : theme.colors.textMuted, fontSize: 12, fontWeight: '700' }}>
                                {isSavingSet ? 'Saving' : setIsCompleted ? 'Saved' : 'Save set'}
                              </Text>
                            </Pressable>
                          </View>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            <TextInput
                              value={setValue.reps}
                              onChangeText={text => handleSetInputChange(exercise, index, 'reps', text)}
                              editable={!isSavingSet && !isSubmitting && !completeMutation.isPending}
                              placeholder='Reps'
                              placeholderTextColor={theme.colors.textMuted}
                              keyboardType='number-pad'
                              inputMode='numeric'
                              style={{ flex: 1, minWidth: 0, borderWidth: 1, padding: 12, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16 }}
                            />
                            <TextInput
                              value={setValue.weight}
                              onChangeText={text => handleSetInputChange(exercise, index, 'weight', text)}
                              editable={!isSavingSet && !isSubmitting && !completeMutation.isPending}
                              placeholder='Weight'
                              placeholderTextColor={theme.colors.textMuted}
                              keyboardType='number-pad'
                              inputMode='numeric'
                              style={{ flex: 1, minWidth: 0, borderWidth: 1, padding: 12, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16 }}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                {completedState ? <Text style={{ color: theme.colors.textMuted }}>Workout completed. Set inputs are locked for review.</Text> : null}
              </View>
            );
          })
        )}
      </View>

      {completedState ? (
        <View style={{ backgroundColor: theme.colors.success, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.success }}>
          <Text style={{ color: '#166534', textAlign: 'center', fontWeight: '800', fontSize: 16 }}>Workout Completed</Text>
        </View>
      ) : (
        <Pressable onPress={handleMarkCompleted} disabled={isSubmitting || completeMutation.isPending || !activeSessionId || !isDraftLoaded || Object.values(savingSetKeys).some(Boolean)} style={{ backgroundColor: theme.colors.primaryDark, padding: 18, borderRadius: 16, opacity: isSubmitting || completeMutation.isPending ? 0.7 : 1 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '800' }}>{isSubmitting || completeMutation.isPending ? 'Saving...' : 'Mark Complete'}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
