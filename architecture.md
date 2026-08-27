# Workouts2.0 Architecture

## 1. Technology Stack
- **Mobile frontend:** React Native with TypeScript.
- **State management:** Redux Toolkit for global app state; React Query for server state and caching.
- **Navigation:** React Navigation.
- **Backend API:** Node.js with TypeScript using NestJS.
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Authentication:** JWT access tokens plus rotating refresh tokens stored securely on device.
- **Background jobs/scheduling:** Backend scheduler using a queue/cron worker (for plan rollover, daily workout resolution, and archiving triggers).
- **API style:** REST JSON.
- **Validation:** Zod or class-validator on request DTOs.
- **Logging/monitoring:** Structured server logs and error tracking.

## 2. System Overview
The system is a client-server mobile application. The mobile app handles authentication screens, profile views, plan creation/editing, daily workout display, completion tracking, and history views. The backend owns all persistence, authorization, workout recommendation logic, progressive overload calculations, schedule resolution, and archival rules. The database stores all user-owned plans, schedules, workout instances, exercise performance, and completed history.

## 3. Frontend Structure
### 3.1 App Shell
- **Auth flow:** sign up, sign in, session restore, sign out.
- **Main shell:** bottom tabs or stack routes for Today, Plans, Profile, and History.

### 3.2 Core Screens
- **Authentication screens:** register, sign in.
- **Today screen:** shows current workout determined from active plan and current date.
- **Plan builder/editor:** create plan, set goals, toggle progressive overload, manage schedule, and add/edit/remove exercises.
- **Workout detail screen:** quick workout execution UI, set logging, completion action.
- **Recommendations panel:** recommended workouts/exercises and weight adjustments, with accept/override actions.
- **Profile screen:** active plan summary, completed plans, workout history, exercise history.
- **History screens:** completed plans detail, workout history timeline, exercise-specific history.

### 3.3 Frontend State
- Auth state: session tokens, user identity, session status.
- UI state: selected plan, selected day, editing drafts, modal state.
- Server state: profile, plans, current workout, recommendations, history, and exercise analytics.

### 3.4 Mobile UX Rules
- Primary workout actions must be one-tap accessible.
- Forms should be segmented into small steps.
- Workout logging must support large tap targets and minimal navigation.
- Offline UI may cache the last loaded workout plan and history, but server remains source of truth.

## 4. Backend Structure
### 4.1 Modules
- **Auth module:** registration, login, token refresh, sign out.
- **Users/Profile module:** user profile retrieval and summary data.
- **Plans module:** CRUD for workout plans, plan activation, plan customization, schedule management.
- **Workouts module:** current workout resolution, workout retrieval, workout completion.
- **Recommendations module:** goal-based exercise/workout recommendations.
- **Progressive overload module:** recommendation of future weights from historical performance.
- **History module:** workout history, completed plans, exercise history.
- **Archival module:** plan completion detection and archival into history.

### 4.2 Service Responsibilities
- Enforce ownership on every user-scoped read/write.
- Resolve current workout from active plan + current date/day-of-week + plan week index.
- Maintain one active plan per user.
- Record workout completion and generate exercise performance snapshots.
- Archive fully completed plans while preserving historical records.
- Compute recommendations from goal metadata, exercise structure, and historical performance.

## 5. Data Model
### 5.1 User
- `id`
- `email`
- `passwordHash`
- `displayName`
- `createdAt`
- `updatedAt`

### 5.2 Session / Refresh Token
- `id`
- `userId`
- `tokenHash`
- `expiresAt`
- `revokedAt`
- `createdAt`

### 5.3 WorkoutPlan
- `id`
- `userId`
- `name`
- `goals` (array or normalized relation)
- `isActive`
- `progressiveOverloadEnabled`
- `status` (`draft`, `active`, `completed`, `archived`)
- `currentWeekIndex`
- `createdAt`
- `updatedAt`

### 5.4 WorkoutPlanDay
- `id`
- `planId`
- `dayOfWeek`
- `weekIndex`
- `title`
- `position`

### 5.5 WorkoutPlanExercise
- `id`
- `planDayId`
- `exerciseName`
- `exerciseId` optional if using canonical catalog
- `setsTarget`
- `repsTarget`
- `weightTarget`
- `order`
- `notes`

### 5.6 WorkoutSession
Represents a scheduled or completed workout instance.
- `id`
- `userId`
- `planId`
- `planDayId`
- `scheduledDate`
- `actualDate`
- `weekIndex`
- `status` (`scheduled`, `in_progress`, `completed`, `skipped`)
- `completedAt`

### 5.7 WorkoutSetResult
- `id`
- `workoutSessionId`
- `exerciseName`
- `exerciseId` optional
- `setNumber`
- `reps`
- `weight`
- `completed`

### 5.8 ExerciseHistoryEntry
- `id`
- `userId`
- `exerciseName`
- `exerciseId` optional
- `workoutSessionId`
- `date`
- `sets`
- `reps`
- `weight`
- `volume`
- `rpe` optional

### 5.9 PlanCompletionArchive
- `id`
- `userId`
- `planId`
- `completedAt`
- `summarySnapshot` (plan structure, goals, schedule, totals)

### 5.10 RecommendationSnapshot
- `id`
- `userId`
- `planId`
- `contextType` (`plan_creation`, `daily_workout`, `progressive_overload`)
- `payload`
- `generatedAt`

## 6. Database Relationships
- A **User** has many **WorkoutPlans**, **WorkoutSessions**, **ExerciseHistoryEntries**, and **PlanCompletionArchives**.
- A **WorkoutPlan** has many **WorkoutPlanDays** and one active flag per user.
- A **WorkoutPlanDay** has many **WorkoutPlanExercises**.
- A **WorkoutSession** belongs to one user, one plan, and one plan day.
- A **WorkoutSession** has many **WorkoutSetResults**.
- **ExerciseHistoryEntry** is derived from completed workout sessions and is queryable by exercise.
- **PlanCompletionArchive** stores completed plan snapshots without deleting the original historical workout data.

## 7. API Design
### 7.1 Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/session`

### 7.2 Profile
- `GET /me`
- `GET /me/history`
- `GET /me/exercises/:exerciseName/history`
- `GET /me/completed-plans`

### 7.3 Plans
- `GET /plans`
- `POST /plans`
- `GET /plans/:planId`
- `PATCH /plans/:planId`
- `DELETE /plans/:planId`
- `POST /plans/:planId/activate`
- `POST /plans/:planId/deactivate`
- `PATCH /plans/:planId/days/:dayId`
- `POST /plans/:planId/days`
- `DELETE /plans/:planId/days/:dayId`
- `POST /plans/:planId/days/:dayId/exercises`
- `PATCH /plans/:planId/days/:dayId/exercises/:exerciseId`
- `DELETE /plans/:planId/days/:dayId/exercises/:exerciseId`

### 7.4 Current Workout and Completion
- `GET /workouts/today`
- `GET /workouts/current`
- `POST /workouts/:workoutSessionId/start`
- `POST /workouts/:workoutSessionId/complete`
- `PATCH /workouts/:workoutSessionId/sets/:setResultId`
- `POST /workouts/:workoutSessionId/sets`

### 7.5 Recommendations
- `GET /recommendations/plan`
- `GET /recommendations/workout/:planId`
- `GET /recommendations/exercises`
- `GET /recommendations/progressive-overload?exerciseName=...`

### 7.6 History and Archives
- `GET /history/workouts`
- `GET /history/workouts/:workoutSessionId`
- `GET /history/plans/:planId`
- `GET /history/exercises/:exerciseName`

## 8. Authentication and Authorization
- Use email/password registration with strong password hashing (Argon2 preferred, bcrypt acceptable).
- Use JWT access tokens for API access and refresh tokens for session continuity.
- Store refresh tokens hashed in the database; store tokens securely on mobile using Keychain/Keystore.
- Protect all user-specific routes with auth guards.
- Enforce row-level ownership checks in service layer for every resource fetch/mutation.
- Never accept userId from the client as authority; derive it from the authenticated token.
- Use short-lived access tokens and revoke refresh tokens on logout or suspected compromise.

## 9. Security
- TLS for all traffic.
- Password hashing with modern adaptive algorithm.
- Input validation on every endpoint.
- Parameterized queries through ORM.
- Authorization checks on every query and mutation.
- Rate limiting on authentication endpoints.
- Audit-safe logging: do not log passwords, tokens, or full workout secrets.
- CSRF protection if cookies are used; otherwise use bearer tokens plus secure storage.
- Optional device/session revocation for lost devices.

## 10. Data Flow
### 10.1 Sign-in Flow
1. User submits credentials.
2. Backend validates credentials and issues access/refresh tokens.
3. App stores refresh token securely and access token in memory.
4. App loads `GET /me` and `GET /plans`.

### 10.2 Daily Workout Flow
1. App calls `GET /workouts/today`.
2. Backend reads the active plan and current date/day.
3. Backend resolves the matching plan day and current week.
4. Backend returns today’s workout or no-workout response.

### 10.3 Workout Completion Flow
1. User logs sets/reps/weights in workout UI.
2. App saves set updates during the session.
3. User taps complete.
4. Backend persists `WorkoutSession` completion, generates `ExerciseHistoryEntry` records, updates plan progression, and checks if the plan is finished.
5. If plan is complete, backend archives it into `PlanCompletionArchive` and marks plan completed/archived.

### 10.4 Recommendation Flow
1. App requests plan/workout/exercise recommendations.
2. Backend uses plan goals, plan structure, and historical performance.
3. If progressive overload is enabled, backend compares recent history, target reps/sets, and achieved performance to suggest adjusted weight.
4. Backend returns recommendations and confidence/insufficient-data indicators.

## 11. Scheduling and Current Workout Resolution
- Treat the active plan as the source of truth for the current workout.
- Determine the workout by server-side current date and the plan’s `weekIndex` + `dayOfWeek` mapping.
- Advance week index when the defined schedule spans multiple weeks or when a completed week boundary is crossed.
- If no workout exists for the current day, return an explicit `no_schedule` state.
- Recompute current workout on each request; optionally persist a daily materialized workout session for traceability.
- A background job should reconcile missed day rollovers, create pending workout sessions if desired, and complete archival tasks.

## 12. Recommendations and Progressive Overload
- Recommendation engine uses:
  - selected goals
  - plan structure and exercise order
  - past exercise performance
  - recent completion trends
  - current targets and rep schemes
- For progressive overload, recommend modest increases only when recent performance meets or exceeds targets.
- If data is sparse, return a conservative suggestion or an `insufficient_history` flag.
- Users may accept recommendations or manually override them; overrides are stored as plan edits and become the new source of truth.

## 13. Component Relationships
- **UI screens** call **frontend hooks/services**.
- Frontend services call **REST APIs**.
- **API controllers** delegate to domain services.
- **Domain services** read/write **PostgreSQL** through **Prisma**.
- **Workout completion service** emits derived history and archival updates.
- **Recommendation service** reads plan configuration plus historical performance.
- **Scheduler/worker** performs day rollover reconciliation and plan archival maintenance.

## 14. Suggested Project Structure
### Frontend
- `src/app/`
- `src/features/auth/`
- `src/features/plans/`
- `src/features/workouts/`
- `src/features/history/`
- `src/features/profile/`
- `src/shared/components/`
- `src/shared/api/`
- `src/shared/store/`
- `src/shared/utils/`

### Backend
- `src/modules/auth/`
- `src/modules/users/`
- `src/modules/plans/`
- `src/modules/workouts/`
- `src/modules/recommendations/`
- `src/modules/history/`
- `src/modules/archival/`
- `src/shared/guards/`
- `src/shared/interceptors/`
- `src/shared/validation/`
- `prisma/schema.prisma`

## 15. Existing Files and Change Strategy
- **Preserve:** `requirements.md`.
- **Create:** `architecture.md` as the implementation blueprint.
- **Create later during implementation:** frontend app entry, feature modules, backend modules, Prisma schema, migration files, API client, auth/session utilities, workout scheduling utilities, recommendation engine, and history/archival services.
- **Modify only if they already exist during implementation:** application entry files, routing/navigation setup, build configuration, and environment configuration to wire in the architecture above.

## 16. Implementation Notes
- Keep the data model normalized enough to support history queries while allowing efficient plan and workout retrieval.
- Derive exercise history from immutable workout completion records to avoid data loss.
- Keep plan edits versioned logically through new snapshots or updated plan-day/exercise rows.
- Favor server-side computation for schedule resolution, archival, and recommendations to ensure consistency across devices.
- Maintain a simple mobile UI with minimal friction during active workouts.