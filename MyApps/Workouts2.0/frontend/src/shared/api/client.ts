import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/shared/config';

const ACCESS_TOKEN_KEY = 'workouts2-access-token';
const REFRESH_TOKEN_KEY = 'workouts2-refresh-token';
export const SESSION_KEY = 'workouts2-session';

export type AuthUser = { id: string; email: string; displayName: string; };
export type AuthSession = { accessToken: string; refreshToken: string; user: AuthUser; };
export type MeProfile = { id: string; displayName: string; email: string; activePlan?: { id: string; name: string; goals?: string[]; progressiveOverloadEnabled?: boolean; status?: string; } | null; workoutHistory?: Array<{ id?: string; date?: string; title?: string; status?: string }>; completedPlans?: Array<{ id?: string; name?: string; completedAt?: string }>; exerciseHistory?: Array<{ exerciseName?: string; weight?: number; reps?: number; date?: string }>; };
export type PlanDayExercise = { id?: string; exerciseName: string; exerciseId?: string | null; setsTarget: number; repsTarget: number; weightTarget?: number | null; order?: number; notes?: string | null; };
export type PlanDay = { id?: string; dayOfWeek: number; weekIndex?: number; title: string; position?: number; exercises?: PlanDayExercise[]; };
export type Plan = { id: string; userId?: string; name: string; goals: string[]; isActive: boolean; progressiveOverloadEnabled: boolean; status: 'draft' | 'active' | 'completed' | 'archived' | string; currentWeekIndex?: number; durationWeeks?: number; startDate?: string | null; createdAt?: string; updatedAt?: string; days: PlanDay[]; };
export type CreatePlanInput = { name: string; goals: string[]; progressiveOverloadEnabled: boolean; isActive?: boolean; durationWeeks?: number; startDate?: string | null; days: PlanDay[]; };
export type UpdatePlanInput = Partial<CreatePlanInput>;
export type TodayWorkout = { status: 'scheduled' | 'no_schedule' | 'in_progress' | 'completed' | 'no_active_plan'; workoutSessionId?: string; title?: string; day?: string; note?: string; weekIndex?: number; planId?: string; plan?: Plan; planDay?: PlanDay; exercises?: Array<{ name: string; sets: number | null; reps: number | null; weight: number | null; previousPerformance?: { sets: number | null; reps: number | null; weight: number | null } | null; suggestedTarget?: { sets: number | null; reps: number | null; weight: number | null } | null; }>; };
export type WorkoutSetResultInput = { exerciseName: string; sets: number | null; reps: number | null; weight: number | null; };

async function readStoredTokens() { const [accessToken, refreshToken] = await Promise.all([AsyncStorage.getItem(ACCESS_TOKEN_KEY), AsyncStorage.getItem(REFRESH_TOKEN_KEY)]); return { accessToken, refreshToken }; }
async function persistTokens(session: AuthSession | null) { if (!session) { await Promise.all([AsyncStorage.removeItem(ACCESS_TOKEN_KEY), AsyncStorage.removeItem(REFRESH_TOKEN_KEY), AsyncStorage.removeItem(SESSION_KEY)]); return; } await Promise.all([AsyncStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken), AsyncStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken), AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session))]); }
async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> { const { accessToken, refreshToken } = await readStoredTokens(); const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> | undefined) }; if (accessToken) headers.Authorization = `Bearer ${accessToken}`; const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers }); if (response.status === 401 && retry && refreshToken) { const refreshed = await refreshSession(refreshToken); if (refreshed) return request<T>(path, init, false); } if (!response.ok) { const message = await response.text(); throw new Error(message || `Request failed (${response.status})`); } if (response.status === 204) return undefined as T; return (await response.json()) as T; }
async function refreshSession(refreshToken: string): Promise<boolean> { try { const response = await fetch(`${API_BASE_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) }); if (!response.ok) return false; const data = (await response.json()) as AuthSession; await persistTokens(data); return true; } catch { return false; } }
export async function signIn(email: string, password: string) { const data = await request<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false); await persistTokens(data); return data; }
export async function register(displayName: string, email: string, password: string) { const data = await request<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify({ displayName, email, password }) }, false); await persistTokens(data); return data; }
export async function restoreSessionFromStorage() { const raw = await AsyncStorage.getItem(SESSION_KEY); if (!raw) return null; try { const session = JSON.parse(raw) as AuthSession; const me = await getMe(); const merged = { ...session, user: me } as AuthSession; await persistTokens(merged); return merged; } catch { await persistTokens(null); return null; } }
export async function signOut() { try { const { refreshToken } = await readStoredTokens(); if (refreshToken) { await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }, false).catch(() => undefined); } } finally { await persistTokens(null); } }
export async function getMe() { return request<MeProfile>('/me'); }
export async function getTodayWorkout() { return request<TodayWorkout>('/workouts/today'); }
export async function startWorkoutSession() { return request<TodayWorkout>('/workouts/start', { method: 'POST' }); }
export async function saveWorkoutSetResult(workoutSessionId: string, input: WorkoutSetResultInput) { return request<void>(`/workouts/${workoutSessionId}/set-results`, { method: 'POST', body: JSON.stringify(input) }); }
export async function completeWorkoutSession(workoutSessionId: string) { return request<void>(`/workouts/${workoutSessionId}/complete`, { method: 'POST' }); }
export async function getPlans() { return request<Plan[]>('/plans'); }
export async function createPlan(input: CreatePlanInput) { return request<Plan>('/plans', { method: 'POST', body: JSON.stringify(input) }); }
export async function updatePlan(planId: string, input: UpdatePlanInput) { return request<Plan>(`/plans/${planId}`, { method: 'PATCH', body: JSON.stringify(input) }); }
export async function deletePlan(planId: string) { return request<void>(`/plans/${planId}`, { method: 'DELETE' }); }
export async function activatePlan(planId: string) { return request<Plan>(`/plans/${planId}/activate`, { method: 'POST' }); }
export async function deactivatePlan(planId: string) { return request<Plan>(`/plans/${planId}/deactivate`, { method: 'POST' }); }
export async function getCompletedPlans() { return request<any[]>('/me/completed-plans'); }
export async function getWorkoutHistory() { return request<any[]>('/me/history'); }
export async function getExerciseHistory(exerciseName: string) { return request<any[]>(`/me/exercises/${encodeURIComponent(exerciseName)}/history`); }
export async function getCurrentWorkout() { return request<any>('/workouts/current'); }
