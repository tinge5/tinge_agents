# Workouts2.0 Technical Architecture

## 1. Architecture Overview
Workouts2.0 is a mobile-first application with a split architecture:
- **Mobile frontend** for authentication, plan management, daily workout execution, history, and recommendations.
- **Backend API** for user management, workout plan persistence, scheduling, completion tracking, and recommendation generation.
- **Relational database** for all user-scoped workout and profile data.
- **Background scheduler / cron worker** for day/week advancement, plan state maintenance, and recommendation precomputation where needed.

The system is strictly multi-tenant by user ownership. Every persisted workout artifact is owned by exactly one user and must be queried and mutated only through authenticated user context.

## 2. Technology Stack
### Frontend
- **React Native** with TypeScript for iOS and Android.
- **State management**: React Query for server state; lightweight local store (Zustand or Redux Toolkit) for transient UI state.
- **Navigation**: React Navigation.
- **Forms and validation**: React Hook Form + Zod.
- **Secure token storage**: platform secure storage / keychain.

### Backend
- **Node.js with NestJS** and TypeScript.
- **API style**: RESTful JSON API.
- **Validation**: class-validator or Zod at API boundary.
- **Auth**: JWT access tokens + refresh tokens.
- **Job scheduling**: NestJS scheduler / cron worker.
- **Recommendation engine**: backend service module using deterministic business rules.

### Database and Infrastructure
- **PostgreSQL** as the primary relational store.
- **ORM**: Prisma or TypeORM.
- **Caching**: optional Redis for token revocation, session refresh tracking, and scheduler coordination.
- **Object storage**: not required for core requirements.

## 3. Frontend Structure
### Core Screens
- **Auth screens**: sign up, sign in, sign out.
- **Home / Today screen**: shows current active plan workout for the current day.
- **Plan builder screen**: create and edit workout plans, goals, schedule, days, exercises, sets, reps, and weights.
- **Workout execution screen**: optimized for training session use; minimal interaction, completion actions, live set logging.
- **History screen**: completed plans, workout history, exercise history.
- **Profile screen**: active plan summary and account/profile data.
- **Recommendations panel**: contextual exercise and weight suggestions.

### Frontend Component Model
- `AuthProvider`: tracks authentication state and token lifecycle.
- `ApiClient`: attaches access token, handles refresh flow, and centralizes API error handling.
- `TodayWorkoutCard`: renders current scheduled workout.
- `PlanEditor`: manages workout plan CRUD and nested day/exercise editing.
- `WorkoutSession`: logs completion and performance data.
- `HistoryViews`: display completed plans and exercise history.
- `RecommendationWidget`: shows goal-based and progressive overload suggestions.

### Frontend Data Flow
1. User signs in or signs up.
2. Access token is stored securely and user context is loaded.
3. Home screen requests profile + active plan + current day workout.
4. Workout session submits completion and set-level performance.
5. History and profile screens read from server state and refresh after mutations.

## 4. Backend Structure
### Modules
- **Auth Module**: sign up, sign in, sign out, token refresh.
- **Users/Profile Module**: profile retrieval and profile-linked summary data.
- **Workout Plans Module**: create, read, update, delete plans; manage goals, schedule, active flag, progressive overload.
- **Workout Days Module**: nested day CRUD and day-level edits.
- **Exercises Module**: exercise catalog references and plan/day exercise assignment.
- **Workout Sessions Module**: current workout resolution, workout completion, set logging.
- **History Module**: completed plans, workout history, exercise history.
- **Recommendations Module**: goal-based exercise/workout suggestions and weight progression recommendations.
- **Scheduler Module**: advances current workout context as day/week boundaries change and maintains plan state.

### Service Responsibilities
- **Auth service**: issues and verifies JWTs, manages refresh tokens.
- **Plan service**: owns all plan lifecycle and editing operations.
- **Session service**: records live workouts and completion events.
- **History service**: converts completion events into immutable history records.
- **Recommendation service**: computes next weights from prior weights, exercises, and rep schemes.
- **Scheduling service**: determines current workout from plan schedule and calendar date.

## 5. Database / Data Model
All tables include `id`, `created_at`, `updated_at`. All user-owned records include `user_id` and must be filtered by it.

### 5.1 Users
**users**
- `id`
- `email` (unique)
- `password_hash`
- `display_name`
- `is_active`
- `last_sign_in_at`

**profiles**
- `id`
- `user_id` (unique, FK users.id)
- `active_plan_id` (nullable FK workout_plans.id)
- `current_view_date` (optional cached date for scheduling)
- `preferences_json` (optional)

### 5.2 Workout Planning
**workout_plans**
- `id`
- `user_id` (FK users.id)
- `name`
- `goal` or `goals_json`
- `progressive_overload_enabled` (boolean)
- `schedule_type`
- `schedule_json` (days/weekly structure)
- `is_active` (boolean)
- `status` (`draft`, `active`, `completed`, `archived`)
- `completed_at` (nullable)

**workout_days**
- `id`
- `plan_id` (FK workout_plans.id)
- `day_index`
- `week_index`
- `name`
- `scheduled_weekday` or `schedule_key`
- `notes`

**exercises**
- `id`
- `name`
- `muscle_group`
- `equipment`
- `goal_tags_json`

**workout_day_exercises**
- `id`
- `workout_day_id` (FK workout_days.id)
- `exercise_id` (FK exercises.id)
- `order_index`
- `sets_target`
- `reps_target`
- `weight_target`
- `weight_unit`
- `progression_rule_json`

### 5.3 Workout History and Performance
**workout_sessions**
- `id`
- `user_id` (FK users.id)
- `plan_id` (FK workout_plans.id)
- `workout_day_id` (FK workout_days.id)
- `session_date`
- `completed_at` (nullable)
- `status` (`in_progress`, `completed`, `skipped`)
- `is_current_day_session`

**exercise_performance_records**
- `id`
- `user_id` (FK users.id)
- `session_id` (FK workout_sessions.id)
- `exercise_id` (FK exercises.id)
- `workout_day_exercise_id` (nullable FK workout_day_exercises.id)
- `sets_completed`
- `reps_completed`
- `weight_used`
- `notes`

**completed_plans**
- `id`
- `user_id` (FK users.id)
- `original_plan_id` (FK workout_plans.id)
- `completed_at`
- `summary_json`

**plan_snapshots**
- `id`
- `completed_plan_id` (FK completed_plans.id)
- `snapshot_json`

### 5.4 Recommendation Support
**recommendation_cache**
- `id`
- `user_id` (FK users.id)
- `plan_id` (FK workout_plans.id)
- `exercise_id` (nullable)
- `recommendation_type`
- `payload_json`
- `computed_at`

## 6. API Design
All endpoints require authentication unless explicitly labeled public.

### 6.1 Auth
- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/signout`
- `POST /auth/refresh`
- `GET /auth/me`

### 6.2 Profile
- `GET /profile`
- `PATCH /profile`
- `GET /profile/active-plan`
- `GET /profile/history`

### 6.3 Workout Plans
- `GET /plans`
- `POST /plans`
- `GET /plans/:planId`
- `PATCH /plans/:planId`
- `DELETE /plans/:planId`
- `POST /plans/:planId/activate`
- `POST /plans/:planId/complete`
- `GET /plans/:planId/schedule/current`

### 6.4 Workout Days and Exercises
- `POST /plans/:planId/days`
- `PATCH /days/:dayId`
- `DELETE /days/:dayId`
- `POST /days/:dayId/exercises`
- `PATCH /day-exercises/:id`
- `DELETE /day-exercises/:id`
- `POST /day-exercises/:id/replace`

### 6.5 Sessions and History
- `GET /workouts/today`
- `GET /workouts/current`
- `POST /workouts/:sessionId/start`
- `PATCH /workouts/:sessionId`
- `POST /workouts/:sessionId/complete`
- `GET /workouts/history`
- `GET /workouts/exercises/history`
- `GET /workouts/completed-plans`

### 6.6 Recommendations
- `GET /recommendations/workouts`
- `GET /recommendations/exercises`
- `GET /recommendations/weights?exerciseId=&dayExerciseId=`

### 6.7 API Behavior
- All reads and writes are scoped by the authenticated user.
- Plan/day/exercise mutations validate ownership recursively.
- Completion endpoints persist immutable session and history records.
- Current workout endpoints resolve the active plan and schedule based on server time.

## 7. Authentication and Authorization
### Authentication
- Email/password sign-up and sign-in.
- Passwords stored using strong adaptive hashing (bcrypt or Argon2).
- Short-lived JWT access token; longer-lived refresh token.
- Refresh token rotation supported.

### Authorization
- Every request is resolved to a `user_id` from the validated token.
- Resource-level checks enforce ownership on plans, days, sessions, and history.
- Unauthenticated access is rejected with `401`.
- Unauthorized access to another user’s data is rejected with `403`.

### Data Isolation Rules
- Queries must always include `user_id` scoping.
- Nested resources must verify parent ownership before mutation.
- Completed plan and workout history records are user-private and immutable.

## 8. Security
- Enforce HTTPS/TLS.
- Store passwords only as salted hashes.
- Protect JWTs with short expiry and refresh token rotation.
- Store refresh tokens securely; optionally hash them in the database.
- Validate all request payloads and reject malformed nested writes.
- Prevent IDOR by server-side ownership checks on every entity access.
- Apply rate limiting to authentication endpoints.
- Use input sanitization for user-entered plan notes and names.
- Log security-sensitive events without storing secrets.
- Return minimal error details for auth failures.

## 9. Scheduling and Day Advancement
### Server-Side Resolution
The backend determines the current workout based on:
- authenticated user
- active plan
- plan schedule
- current server date/time
- current week/day indexes

### Advancement Rules
- When the day changes, the current workout endpoint resolves the next scheduled workout automatically.
- When the final workout of a week has passed, the scheduler rolls the plan context into the next week.
- The scheduler may persist computed current state in profile or session metadata, but the source of truth remains the plan schedule plus dates.

### Background Jobs
- Daily reconciliation job updates active-plan context for users with active plans.
- Completion finalization job marks plans completed when all scheduled workouts are finished.
- Optional cache refresh job computes recommended weights for active users.

## 10. Recommendation Engine
### Inputs
- User goals.
- Active plan structure.
- Exercise history.
- Historical weights.
- Prior rep schemes.
- Recent completion outcomes.

### Outputs
- Recommended workouts and exercises aligned with plan goals.
- Future weight recommendation when progressive overload is enabled.

### Recommendation Logic
- Prefer exercises already used successfully by the user for the same or similar goal tags.
- Use the most recent completed performance as the baseline.
- Increase weight only when prior rep targets were met according to progression rules.
- If history is sparse, fall back to plan defaults and goal-based templates.
- Always scope recommendations to the same user’s history.

## 11. Data Flow Summary
1. User authenticates and receives tokens.
2. Frontend loads profile and active plan.
3. Backend resolves current workout for today from active plan schedule.
4. User edits plan/days/exercises; backend validates ownership and persists changes.
5. User completes workout; backend stores session and exercise performance records.
6. History service updates workout history and completed plan state.
7. Recommendation service uses stored performance to compute future exercises and weights.
8. Scheduler advances current workout context as calendar days change.

## 12. Major Component Relationships
- `Auth Module` authenticates the user and provides identity to all other modules.
- `Profile Module` reads active plan, history summaries, and user settings.
- `Workout Plans Module` owns plan creation and editing.
- `Workout Days` and `Exercises` are children of plans and are always accessed through plan ownership.
- `Workout Sessions` captures live workout execution and feeds the `History Module`.
- `Recommendations Module` consumes history and plan data, never raw cross-user data.
- `Scheduler Module` depends on plans and profile active-plan references to determine the daily workout.

## 13. Implementation Guidance
### Must Preserve
- User authentication boundary and privacy isolation across all user data.
- A single active plan per user for daily workout display.
- Historical records for completed workouts, completed plans, and exercise performance.

### Must Create
- Auth API and token lifecycle.
- Profile aggregation endpoints.
- Plan/day/exercise CRUD endpoints.
- Workout session completion pipeline.
- Recommendation service and scheduling job.

### Should Modify During Implementation
- Any pre-existing mobile entry point to integrate authentication state and routing.
- Any existing API client to support JWT refresh and secure storage.
- Any existing data layer to add user ownership, plan scheduling, and history tables.

## 14. Non-Functional Alignment
- **Usability**: keep the Today screen as the default landing page after login.
- **Reliability**: store immutable workout history records and completed plan snapshots.
- **Performance**: resolve the current workout with indexed lookups on `user_id`, `plan_id`, `status`, and `session_date`.
- **Maintainability**: isolate auth, plan, session, history, recommendation, and scheduler modules.

## 15. Recommended File Structure for Implementation
If these files do not already exist, create them in the application root or appropriate source directories:
- `architecture.md`
- backend auth, profile, plans, sessions, history, recommendations, and scheduler modules
- frontend auth, today workout, plan editor, workout session, history, and profile screens
- shared API client, token storage, validation schemas, and domain models
- database migration/schema files for all tables described above

If existing files already cover these responsibilities, preserve them and extend them rather than duplicating functionality.