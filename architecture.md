# Workouts2.0 Technical Architecture

## 1. Recommended Stack
- **Frontend**: React Native with TypeScript for a mobile-first app.
- **State management**: Zustand or Redux Toolkit for auth/session, active plan, and UI state.
- **Backend**: Node.js with TypeScript using NestJS or Express with layered modules.
- **API style**: REST JSON APIs.
- **Database**: PostgreSQL as the primary relational store.
- **Cache / job coordination**: Redis for session/token revocation support, scheduled processing, and short-lived recommendation caches.
- **Auth**: JWT access tokens with rotating refresh tokens.
- **Hosting**: Stateless API service and mobile client; background jobs run as a separate worker process.

## 2. Application Structure
### 2.1 Mobile Frontend
Organize the app into feature modules:
- `auth`: register, sign in, sign out, session restore.
- `profile`: active plan summary, workout history, completed plans, exercise history.
- `plan-builder`: create/edit workout plans, days, exercises, sets, reps, weights.
- `current-workout`: daily workout view, completion logging, quick edits.
- `recommendations`: goal-based exercise and weight suggestions.
- `history`: completed plans and performance review.

Frontend responsibilities:
- Restore session on launch.
- Load the current workout based on date and active plan.
- Allow complete customization of recommended plans.
- Submit plan edits and workout completion events.
- Render simple workout-first screens with minimal taps.

### 2.2 Backend Service Modules
Split backend into modules:
- `AuthModule`: registration, login, token refresh, logout.
- `UserModule`: user profile and session-scoped identity.
- `PlanModule`: CRUD for workout plans, days, exercises, and plan activation.
- `WorkoutModule`: current-workout resolution, completion tracking, week progression.
- `RecommendationModule`: goal-based exercise recommendations and progressive overload suggestions.
- `HistoryModule`: completed plans and exercise performance timelines.
- `SchedulerModule`: day rollover and week advancement jobs.
- `Audit/SecurityModule`: ownership checks, validation, and rate limiting.

## 3. Core Domain Model
### 3.1 Entities
- **User**
  - `id`
  - `email`
  - `passwordHash`
  - `createdAt`, `updatedAt`
  - `lastLoginAt`

- **WorkoutProfile**
  - `id`
  - `userId`
  - `activePlanId` nullable
  - summary fields for counts/last activity if desired

- **WorkoutPlan**
  - `id`
  - `userId`
  - `name`
  - `goal` enum
  - `progressiveOverloadEnabled` boolean
  - `status` enum: `active`, `archived`, `completed`
  - `startDate`
  - `currentWeekIndex`
  - `createdAt`, `updatedAt`, `completedAt` nullable

- **WorkoutDay**
  - `id`
  - `planId`
  - `dayIndex` or `weekDay`
  - `weekIndex`
  - `title`
  - `scheduledDate` optional if calendarized
  - `isRequired`

- **WorkoutExercise**
  - `id`
  - `dayId`
  - `exerciseCatalogId` or freeform `exerciseName`
  - `displayOrder`
  - `sets`
  - `reps`
  - `weight`
  - `notes` optional

- **WorkoutCompletion**
  - `id`
  - `userId`
  - `planId`
  - `dayId`
  - `completedAt`
  - `performedSets`, `performedReps`, `performedWeights` snapshot fields

- **ExercisePerformanceEntry**
  - `id`
  - `userId`
  - `planId`
  - `dayId`
  - `exerciseName` or `exerciseCatalogId`
  - `weightUsed`
  - `repsCompleted`
  - `setsCompleted`
  - `performedAt`

- **RecommendationSnapshot** optional
  - `id`
  - `userId`
  - `planId`
  - `type` (`exercise`, `weight`)
  - `payload`
  - `createdAt`

### 3.2 Data Relationships
- One user owns one profile.
- One user owns many workout plans.
- One active plan may be referenced from the profile.
- One plan owns many workout days.
- One workout day owns many exercises.
- Completion and performance entries are always tied to a user and plan/day for isolation and history.

## 4. Database Design
Use relational tables with foreign keys and unique constraints:
- `users`
- `workout_profiles`
- `workout_plans`
- `workout_days`
- `workout_exercises`
- `workout_completions`
- `exercise_performance_entries`
- `refresh_tokens` or `session_tokens`

### Key Constraints
- `workout_plans.user_id -> users.id`
- `workout_profiles.user_id` unique
- `workout_days.plan_id -> workout_plans.id`
- `workout_exercises.day_id -> workout_days.id`
- `workout_completions.user_id`, `plan_id`, `day_id` must match ownership of the authenticated user
- Enforce one active plan per user with a partial unique index on `workout_profiles.active_plan_id`/plan status logic or a transactionally managed active-plan flag

### Indexing
- `workout_plans(user_id, status)`
- `workout_days(plan_id, week_index, day_index)`
- `workout_completions(user_id, completed_at desc)`
- `exercise_performance_entries(user_id, exercise_name, performed_at desc)`
- `refresh_tokens(user_id, expires_at)`

## 5. API Design
All private endpoints require bearer auth.

### 5.1 Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/session`

### 5.2 Profile
- `GET /me`
- `GET /me/profile`
- `GET /me/history`
- `GET /me/exercise-history`

### 5.3 Plans
- `GET /plans`
- `POST /plans`
- `GET /plans/:planId`
- `PATCH /plans/:planId`
- `DELETE /plans/:planId`
- `POST /plans/:planId/activate`
- `POST /plans/:planId/archive`

### 5.4 Workout Days and Exercises
- `POST /plans/:planId/days`
- `PATCH /days/:dayId`
- `DELETE /days/:dayId`
- `POST /days/:dayId/exercises`
- `PATCH /exercises/:exerciseId`
- `DELETE /exercises/:exerciseId`
- `POST /exercises/:exerciseId/replace`

### 5.5 Current Workout and Completion
- `GET /current-workout`
- `POST /workouts/:dayId/complete`
- `POST /plans/:planId/complete`
- `GET /workouts/:dayId/history`

### 5.6 Recommendations
- `GET /recommendations?planId=...`
- `GET /recommendations/exercises?goal=...`
- `GET /recommendations/weights?planId=...&exerciseId=...`

## 6. Authentication and Authorization
- Register with hashed passwords using Argon2 or bcrypt.
- Issue short-lived access tokens and longer-lived refresh tokens.
- Store refresh tokens hashed in the database or revoke them in Redis.
- Mobile client stores tokens in secure OS storage.
- Authorize every request by user identity extracted from the access token.
- All plan/day/exercise/history operations must verify ownership by `userId` before reads or writes.
- Reject cross-user access with `403 Forbidden` and unknown resources with `404` where appropriate.

## 7. Security Controls
- TLS for all traffic.
- Password hashing with a strong adaptive hash.
- Input validation on all DTOs.
- Parameterized queries/ORM protection against injection.
- Rate limiting on auth endpoints.
- CSRF protection if any cookie-based auth is introduced; otherwise prefer bearer tokens.
- Audit log for sign-in, plan activation, completion, and security-relevant failures.
- Data minimization: only expose the authenticated user’s records.
- Optional row-level security in PostgreSQL if the deployment model supports it.

## 8. Data Flow
### 8.1 Sign-in and Session Restore
1. User registers or logs in.
2. Backend validates credentials and issues tokens.
3. Client stores tokens securely.
4. On app launch, client restores session via refresh or session check.

### 8.2 Plan Creation and Editing
1. Client sends plan definition, goal, and progressive overload flag.
2. Backend validates ownership and persists plan, days, and exercises in a transaction.
3. If set active, profile `activePlanId` is updated.
4. Client re-reads the current workout to reflect changes immediately.

### 8.3 Current Workout Resolution
1. Client requests `GET /current-workout`.
2. Backend loads the active plan for the authenticated user.
3. Scheduler logic maps current date to week/day.
4. Backend returns the matching day, exercises, and applicable recommendations.

### 8.4 Workout Completion and History
1. User marks a workout complete.
2. Backend stores a completion snapshot and exercise performance entries.
3. If the plan is fully complete, backend marks the plan completed, archives it, and preserves it in history.
4. Exercise history becomes queryable for future recommendations.

## 9. Scheduling and Progression
- Use server-side date calculations as the source of truth.
- Derive the current week/day from `startDate`, plan cadence, and stored `currentWeekIndex`.
- Run a scheduled job daily to reconcile plan progression and close out completed weeks if needed.
- When a new day starts, the current workout endpoint automatically resolves to the new day.
- When a week is completed, increment the active week index transactionally.
- Do not require user action to advance schedule state.

## 10. Recommendations
### 10.1 Goal-Based Recommendations
- Map plan goals to starter exercise templates and common structures.
- Return recommended exercises and plan scaffolds as suggestions only.
- Users can override every suggested field.

### 10.2 Progressive Overload Recommendations
- Enabled only when the plan flag is true.
- Use the user’s prior weights, exercised movements, completed reps, and set completion history.
- Produce suggested next weights conservatively from recent successful performance.
- Persist recommendation snapshots optionally for UI reuse.
- Never auto-increase weights when the flag is disabled.

## 11. Major Component Relationships
- **Mobile app** communicates only with backend APIs.
- **Auth module** issues identity used by all other modules.
- **Plan module** owns persistent structure of plans, days, and exercises.
- **Workout module** reads plan structure plus current date to compute today’s workout and records completions.
- **History module** reads immutable completion/performance records.
- **Recommendation module** consumes goals and history to produce suggestions.
- **Scheduler module** maintains time-based progression state and plan-week rollovers.
- **Profile module** aggregates active plan, history, and exercise timelines for the user dashboard.

## 12. Existing Files Guidance
- **Preserve**: `requirements.md` as the source of truth.
- **Create**: `architecture.md` with this finalized architecture.
- **Modify**: no existing implementation files are assumed by this architecture; implementation agents should add stack-specific project files as needed after this document.