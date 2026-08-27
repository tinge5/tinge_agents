const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '.data');
const DB_FILE = path.join(DATA_DIR, 'workout2.json');
const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 60;
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], refreshTokens: [], nextIds: {}, plans: [], sessions: [], performance: [], completedPlans: [], recommendations: [] }, null, 2));
  }
}

function loadDb() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function uid(prefix) { return `${prefix}_${crypto.randomUUID()}`; }
function sha256(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }
function nowIso() { return new Date().toISOString(); }
function json(res, code, body, cookies = []) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Set-Cookie': cookies });
  res.end(JSON.stringify(body));
}
function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = []; req.on('data', c => chunks.push(c)); req.on('end', () => {
      const raw = Buffer.concat(chunks).toString() || '{}';
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}
function getAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return token;
}
function signToken(payload, secret, ttlMs) {
  const exp = Date.now() + ttlMs;
  const data = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}
function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  if (expected !== sig) return null;
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  if (payload.exp < Date.now()) return null;
  return payload;
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function requireUser(req, db) {
  const payload = verifyToken(getAuth(req), JWT_SECRET);
  if (!payload) return null;
  return db.users.find(u => u.id === payload.sub && u.isActive);
}
function publicUser(u, db) {
  const profile = db.profiles.find(p => p.userId === u.id) || null;
  return { id: u.id, email: u.email, displayName: u.displayName, createdAt: u.createdAt, profile };
}
function ensureProfile(db, userId) {
  let profile = db.profiles.find(p => p.userId === userId);
  if (!profile) { profile = { id: uid('prof'), userId, activePlanId: null, currentWeekIndex: 0, currentDayIndex: 0, planStartedAt: null, timezone: 'UTC', createdAt: nowIso(), updatedAt: nowIso() }; db.profiles.push(profile); }
  return profile;
}
function currentWorkout(db, userId) {
  const profile = ensureProfile(db, userId);
  const plan = db.plans.find(p => p.id === profile.activePlanId && p.userId === userId) || null;
  if (!plan) return null;
  const weeks = db.weeks.filter(w => w.planId === plan.id).sort((a,b)=>a.weekIndex-b.weekIndex);
  const week = weeks[profile.currentWeekIndex] || weeks[0];
  if (!week) return { plan, workout: null, profile };
  const days = db.days.filter(d => d.weekId === week.id).sort((a,b)=>a.dayIndex-b.dayIndex);
  const day = days[profile.currentDayIndex] || days[0] || null;
  if (!day) return { plan, workout: null, profile };
  const exercises = db.dayExercises.filter(de => de.workoutDayId === day.id).sort((a,b)=>a.sortOrder-b.sortOrder).map(de => ({ ...de, exercise: db.exercises.find(e => e.id === de.exerciseId) }));
  return { plan, workout: { ...day, exercises }, profile };
}
function recommendationForExercise(db, userId, plan, dayExercise) {
  const history = db.performance.filter(p => p.userId === userId && p.exerciseId === dayExercise.exerciseId).slice(-3);
  const last = history[history.length - 1];
  const suggestedWeight = plan.progressiveOverloadEnabled && last ? Math.round((last.actualWeight || last.weight || dayExercise.targetWeight || 0) * 1.025) : (dayExercise.targetWeight ?? 0);
  return { exercise_id: dayExercise.exerciseId, suggested_sets: dayExercise.sets, suggested_reps: dayExercise.reps, suggested_weight: suggestedWeight, rationale: plan.progressiveOverloadEnabled ? 'Based on prior performance' : 'Plan-based suggestion', based_on_history: history.map(h => h.id) };
}

async function handler(req, res) {
  const db = loadDb();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';
  if (url.pathname === '/health') return json(res, 200, { ok: true });

  if (url.pathname === '/api/v1/auth/register' && method === 'POST') {
    const body = await parseBody(req);
    if (!body.email || !body.password) return json(res, 400, { error: 'email_and_password_required' });
    if (db.users.some(u => u.email === body.email)) return json(res, 409, { error: 'email_exists' });
    const user = { id: uid('usr'), email: body.email.toLowerCase(), passwordHash: sha256(body.password), displayName: body.displayName || body.email.split('@')[0], createdAt: nowIso(), updatedAt: nowIso(), lastLoginAt: nowIso(), isActive: true };
    db.users.push(user); ensureProfile(db, user.id);
    const accessToken = signToken({ sub: user.id }, JWT_SECRET, ACCESS_TOKEN_TTL_MS);
    const refreshToken = signToken({ sub: user.id, typ: 'refresh' }, JWT_SECRET, REFRESH_TOKEN_TTL_MS);
    db.refreshTokens.push({ token: sha256(refreshToken), userId: user.id, expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS });
    saveDb(db);
    return json(res, 201, { user: publicUser(user, db), accessToken, refreshToken });
  }

  if (url.pathname === '/api/v1/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const user = db.users.find(u => u.email === String(body.email || '').toLowerCase() && u.passwordHash === sha256(body.password || ''));
    if (!user) return json(res, 401, { error: 'invalid_credentials' });
    user.lastLoginAt = nowIso(); user.updatedAt = nowIso();
    const accessToken = signToken({ sub: user.id }, JWT_SECRET, ACCESS_TOKEN_TTL_MS);
    const refreshToken = signToken({ sub: user.id, typ: 'refresh' }, JWT_SECRET, REFRESH_TOKEN_TTL_MS);
    db.refreshTokens.push({ token: sha256(refreshToken), userId: user.id, expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS });
    saveDb(db);
    return json(res, 200, { user: publicUser(user, db), accessToken, refreshToken });
  }

  if (url.pathname === '/api/v1/auth/refresh' && method === 'POST') {
    const body = await parseBody(req);
    const token = body.refreshToken;
    const payload = verifyToken(token, JWT_SECRET);
    const stored = db.refreshTokens.find(t => t.token === sha256(token) && t.expiresAt > Date.now());
    if (!payload || !stored) return json(res, 401, { error: 'invalid_refresh_token' });
    const accessToken = signToken({ sub: payload.sub }, JWT_SECRET, ACCESS_TOKEN_TTL_MS);
    return json(res, 200, { accessToken });
  }

  if (url.pathname === '/api/v1/auth/logout' && method === 'POST') {
    const body = await parseBody(req);
    if (body.refreshToken) db.refreshTokens = db.refreshTokens.filter(t => t.token !== sha256(body.refreshToken));
    saveDb(db); return json(res, 200, { ok: true });
  }

  const user = requireUser(req, db);
  if (!user) return json(res, 401, { error: 'unauthorized' });
  ensureProfile(db, user.id);

  if (url.pathname === '/api/v1/me' && method === 'GET') return json(res, 200, { user: publicUser(user, db) });
  if (url.pathname === '/api/v1/me/dashboard' && method === 'GET') {
    const current = currentWorkout(db, user.id);
    return json(res, 200, { profile: publicUser(user, db), activePlan: current.plan, currentWorkout: current.workout, recommendations: current.workout ? current.workout.exercises.map(ex => recommendationForExercise(db, user.id, current.plan, ex)) : [], workoutHistory: db.sessions.filter(s => s.userId === user.id), completedPlans: db.completedPlans.filter(p => p.userId === user.id), exerciseHistory: db.performance.filter(p => p.userId === user.id) });
  }
  if (url.pathname === '/api/v1/plans' && method === 'GET') return json(res, 200, db.plans.filter(p => p.userId === user.id));
  if (url.pathname === '/api/v1/plans' && method === 'POST') {
    const body = await parseBody(req);
    const plan = { id: uid('plan'), userId: user.id, name: body.name || 'New Plan', goalType: body.goalType || 'hypertrophy', progressiveOverloadEnabled: !!body.progressiveOverloadEnabled, status: 'draft', currentWeekCount: 0, totalWeeks: 1, activatedAt: null, completedAt: null, createdAt: nowIso(), updatedAt: nowIso() };
    db.plans.push(plan); saveDb(db); return json(res, 201, plan);
  }
  if (url.pathname === '/api/v1/workouts/current' && method === 'GET') {
    const current = currentWorkout(db, user.id);
    return json(res, 200, current);
  }
  if (url.pathname === '/api/v1/workouts/current/recommendations' && method === 'GET') {
    const current = currentWorkout(db, user.id);
    const recs = current.workout ? current.workout.exercises.map(ex => recommendationForExercise(db, user.id, current.plan, ex)) : [];
    return json(res, 200, recs);
  }
  if (url.pathname === '/api/v1/workouts/current/complete' && method === 'POST') {
    const current = currentWorkout(db, user.id);
    if (!current.plan || !current.workout) return json(res, 404, { error: 'no_current_workout' });
    const session = { id: uid('ses'), userId: user.id, planId: current.plan.id, workoutDayId: current.workout.id, scheduledForDate: nowIso().slice(0,10), completedAt: nowIso(), status: 'completed', weekIndex: current.profile.currentWeekIndex, dayIndex: current.profile.currentDayIndex, createdAt: nowIso(), updatedAt: nowIso() };
    db.sessions.push(session);
    current.workout.exercises.forEach(ex => db.performance.push({ id: uid('perf'), userId: user.id, planId: current.plan.id, exerciseId: ex.exerciseId, workoutSessionId: session.id, performedAt: nowIso(), sets: ex.sets, reps: ex.reps, weight: ex.targetWeight, actualReps: ex.reps, actualWeight: ex.targetWeight, recommendationWeight: recommendationForExercise(db, user.id, current.plan, ex).suggested_weight, createdAt: nowIso() }));
    const allDays = db.days.filter(d => db.weeks.find(w => w.id === d.weekId && w.planId === current.plan.id));
    if (db.sessions.filter(s => s.planId === current.plan.id && s.userId === user.id && s.status === 'completed').length >= allDays.length) {
      current.plan.status = 'completed'; current.plan.completedAt = nowIso(); db.completedPlans.push({ id: uid('cpl'), userId: user.id, planId: current.plan.id, completedAt: nowIso(), summaryJson: JSON.stringify({ sessions: db.sessions.length }), createdAt: nowIso() });
    }
    saveDb(db); return json(res, 200, { ok: true, session });
  }
  if (url.pathname === '/api/v1/history/workouts' && method === 'GET') return json(res, 200, db.sessions.filter(s => s.userId === user.id));
  if (url.pathname === '/api/v1/history/plans/completed' && method === 'GET') return json(res, 200, db.completedPlans.filter(p => p.userId === user.id));
  if (url.pathname === '/api/v1/history/exercises' && method === 'GET') return json(res, 200, db.performance.filter(p => p.userId === user.id));

  return json(res, 404, { error: 'not_found' });
}

http.createServer(handler).listen(process.env.PORT || 3000, () => {
  ensureStorage();
  console.log('Workout2.0 backend running');
});
