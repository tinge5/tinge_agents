import { RootState } from '@/shared/store';

const mock = {
  me: { id: 'u1', email: 'demo@workouts.app', displayName: 'Demo Athlete' },
  plans: [
    { id: 'p1', name: 'Strength Base', goals: ['strength', 'hypertrophy'], isActive: true, progressiveOverloadEnabled: true, status: 'active', currentWeekIndex: 0, days: [{ id: 'd1', dayOfWeek: 1, title: 'Push', exercises: [{ id: 'e1', exerciseName: 'Bench Press', setsTarget: 3, repsTarget: 8, weightTarget: 100 }] }, { id: 'd2', dayOfWeek: 3, title: 'Pull', exercises: [{ id: 'e2', exerciseName: 'Row', setsTarget: 3, repsTarget: 10, weightTarget: 80 }] }] }
  ],
};

export async function apiGet(path: string, _state?: RootState) {
  if (path === '/me') return mock.me;
  if (path === '/plans') return mock.plans;
  if (path === '/workouts/today') return { status: 'scheduled', workout: mock.plans[0].days[0] };
  if (path === '/recommendations/plan') return { workouts: ['Upper', 'Lower'], exercises: ['Bench Press', 'Squat'], note: 'Aligned with strength and hypertrophy goals' };
  if (path.startsWith('/history')) return { items: [] };
  return null;
}
