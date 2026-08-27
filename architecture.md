# Workout2.0 Technical Architecture

## 1. Architecture Overview
Workout2.0 will be a mobile-first full-stack application with a client app, API backend, recommendation/scheduling services, and a relational database. The system is user-centric: all plans, workouts, history, and recommendations are scoped to a single authenticated user.

### Architectural style
- Mobile client + API server
- Layered backend: controllers/routes, services, repositories, jobs
- Relational persistence with explicit ownership and history tables
- Deterministic schedule resolution based on current date and plan definition
- Recommendation engine that uses historical workout performance

## 2. Technology Stack
### Frontend
- React Native with TypeScript
- Expo for cross-platform mobile delivery
- React Navigation for screen flow
- Zustand or Redux Toolkit for local UI state
- React Query or TanStack Query for server state and caching
- Formik or React Hook Form for workout plan editing forms

### Backend
- Node.js with TypeScript
- NestJS or Express with a structured service layer
- REST API over HTTPS
- Validation with Zod or class-validator
- Background jobs with a queue worker for daily schedule refresh and completion rollups

### Database and storage
- PostgreSQL as the primary database
- Redis for session/token revocation support, caching, and scheduled job coordination
- Optional object storage is not required for core scope

### Authentication
- Email/password registration and sign-in
- JWT access tokens plus refresh tokens
- Password hashing with Argon2 or bcrypt

## 3. System Modules
### Client app modules
- Auth screens: register, sign in, session restore
- Home/Profile screen: active plan, current workout, recent history
- Plan builder/editor: create, edit, clone, reorder days, modify exercises, sets, reps, weights
- Workout session screen: current workout, logging completion, quick edits, recommendation panel
- History screens: completed plans, workout history, exercise history, performance charts

### Backend modules
- Auth module: registration, login, token refresh, logout
- User/Profile module: profile retrieval and account metadata
- Plan module: create, update, delete, activate, version plan changes
- Schedule module: resolve current workout from active plan and current date
- Completion module: mark workouts complete, roll up completed plans
- History module: workout history and exercise history queries
- Recommendation module: goal-based and progressive-overload suggestions
- Authorization module: ownership checks on every user-scoped resource

## 4. Data Model
All mutable user data is owned by one user. Use UUID primary keys and foreign keys everywhere.

### 4.1 Core entities
#### users
- id
- email
- password_hash
- display_name
- created_at
- updated_at
- last_login_at
- is_active

#### profiles
- id
- user_id (unique)
- active_plan_id (nullable)
- current_week_index
- current_day_index
- plan_started_at
- timezone
- created_at
- updated_at

#### workout_plans
- id
- user_id
- name
- goal_type
- progressive_overload_enabled
- status: draft | active | completed | archived
- current_week_count
- total_weeks
- activated_at
- completed_at
- created_at
- updated_at

#### workout_weeks
- id
- plan_id
- week_index
- created_at
- updated_at

#### workout_days
- id
- week_id
- day_index
- name
- scheduled_day_of_week
- created_at
- updated_at

#### exercises
- id
- user_id
- name
- muscle_group
- equipment
- notes
- created_at
- updated_at

#### workout_day_exercises
- id
- workout_day_id
- exercise_id
- sort_order
- sets
- reps
- target_weight
- rest_seconds
- variation_name
- created_at
- updated_at

### 4.2 Tracking and history entities
#### workout_sessions
Represents one performed workout instance.
- id
- user_id
- plan_id
- workout_day_id
- scheduled_for_date
- completed_at
- status: planned | in_progress | completed | skipped
- week_index
- day_index
- created_at
- updated_at

#### workout_session_exercises
- id
- session_id
- exercise_id
- sets
- reps
- weight
- actual_reps
- actual_weight
- rpe
- completed
- created_at
- updated_at

#### exercise_performance_history
Derived history table, populated from completed sessions.
- id
- user_id
- plan_id
- exercise_id
- workout_session_id
- performed_at
- sets
- reps
- weight
- actual_reps
- actual_weight
- recommendation_weight
- created_at

#### plan_completion_history
- id
- user_id
- plan_id
- completed_at
- summary_json
- created_at

### 4.3 Recommendation support
#### recommendation_snapshots
- id
- user_id
- plan_id
- workout_day_id
- exercise_id
- recommended_sets
- recommended_reps
- recommended_weight
- reason_code
- generated_at

### 4.4 Integrity rules
- Each workout plan belongs to exactly one user.
- Each workout day belongs to one plan week.
- Each workout session belongs to one user and one plan.
- History records are append-only.
- Plan edits update the active plan definition, but historical sessions remain immutable.

## 5. API Design
Use versioned REST endpoints under /api/v1.

### 5.1 Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /auth/session

### 5.2 Profile
- GET /me
- PATCH /me
- GET /me/dashboard

### 5.3 Plans
- GET /plans
- POST /plans
- GET /plans/:id
- PATCH /plans/:id
- DELETE /plans/:id
- POST /plans/:id/activate
- POST /plans/:id/clone

### 5.4 Plan structure
- POST /plans/:id/weeks
- PATCH /weeks/:id
- DELETE /weeks/:id
- POST /weeks/:id/days
- PATCH /days/:id
- DELETE /days/:id
- POST /days/:id/exercises
- PATCH /day-exercises/:id
- DELETE /day-exercises/:id

### 5.5 Workout execution
- GET /workouts/current
- GET /workouts/current/recommendations
- POST /workouts/:id/start
- POST /workouts/:id/complete
- PATCH /workouts/:id/exercises/:sessionExerciseId
- POST /workouts/:id/skip

### 5.6 History
- GET /history/workouts
- GET /history/workouts/:id
- GET /history/plans/completed
- GET /history/exercises
- GET /history/exercises/:exerciseId

### 5.7 Recommendation payloads
Recommendations must be advisory only and never auto-apply.
Response fields:
- exercise_id
- suggested_sets
- suggested_reps
- suggested_weight
- confidence or rationale
- based_on_history references

## 6. Authentication and Authorization
### Authentication
- Use JWT access tokens for API requests.
- Use refresh tokens stored securely in HttpOnly secure cookies or platform secure storage.
- Passwords are hashed with Argon2id preferred, bcrypt acceptable.
- Enforce password policy and rate limiting on auth endpoints.

### Authorization
- All plan, workout, profile, and history endpoints require authentication.
- Every query must be filtered by authenticated user_id.
- Ownership checks occur in service layer before read/write/delete operations.
- Cross-user IDs must return 404 or 403 without leaking existence details.
- Active plan operations may only target the authenticated user’s plan.

## 7. Security Controls
- HTTPS everywhere
- Secure token storage on device
- HttpOnly refresh cookies if web-compatible auth is used
- Input validation on every request body, path, and query param
- Output encoding on client-rendered content
- Rate limiting and brute-force protection on auth and workout mutation endpoints
- Audit-safe logs without sensitive personal data or raw passwords
- Server-side ownership enforcement, never client-trusted ownership
- Prepared statements/ORM protection against SQL injection
- Principle of least privilege for database access
- CSRF protection if cookies are used for authentication

## 8. Scheduling and Current Workout Resolution
### Deterministic current workout logic
- The active profile stores plan start date, current week, current day, and timezone.
- On app launch and on each current-workout request, the server resolves the current workout from:
  1. user timezone
  2. active plan
  3. plan schedule definition
  4. current date
- The server advances the week/day indexes when the calendar boundary is crossed according to the plan schedule.
- If a user edits the active plan, the schedule resolver recalculates the current workout from the updated structure.
- Completed workouts are recorded per session and do not alter historical data.

### Background job
- A daily scheduler runs to reconcile active plans, roll forward week/day pointers, and finalize completed plans when all scheduled sessions are marked completed.
- The app must still resolve current workout on demand so the UI is always correct even if the scheduler runs late.

## 9. Recommendation Engine
### Inputs
- Goal type
- Plan structure
- Exercise selection and ordering
- Previous weights, reps, completion status, and rpe
- Progressive overload flag

### Behavior
- If progressive overload is disabled, recommendations focus on workouts and exercise selection only.
- If enabled, the engine recommends a weight increase based on historical performance for the same exercise and similar rep schemes.
- Use recent successful sessions, completed reps, and prior target weight trends.
- Recommendations remain suggestions only; the user can override them.

### Output rules
- Never persist recommendation as an enforced value in the plan automatically.
- Persist recommendation snapshots for traceability and future tuning.

## 10. Data Flow
1. User registers or signs in.
2. Client stores tokens securely and loads the user session.
3. Client requests profile and active plan.
4. Server validates user identity, loads profile, and resolves current workout.
5. Client displays current workout and recommendations.
6. User edits plan or workout day; server validates ownership and persists changes.
7. User completes a workout; server records workout session, exercise performance, and completion history.
8. If a plan is fully completed, the server marks it completed and retains it in historical records.
9. Historical exercise data feeds subsequent recommendation generation.

## 11. Component Relationships
- UI screens call client service layers, not the database directly.
- Client service layers call REST APIs and manage cached server state.
- Controllers expose endpoints and delegate to domain services.
- Domain services coordinate schedule resolution, plan editing, completion tracking, and recommendations.
- Repositories encapsulate PostgreSQL access.
- Background jobs update schedule pointers and completion rollups.
- History and recommendation modules read from completed sessions and performance records.

## 12. Implementation Structure
### Backend source organization
- src/modules/auth
- src/modules/users
- src/modules/plans
- src/modules/workouts
- src/modules/history
- src/modules/recommendations
- src/modules/scheduler
- src/common/guards
- src/common/interceptors
- src/common/validators
- src/database/migrations
- src/database/seeds

### Frontend source organization
- app/screens/auth
- app/screens/profile
- app/screens/plans
- app/screens/workout
- app/screens/history
- app/components
- app/hooks
- app/services/api
- app/state
- app/utils

## 13. Preserved, Modified, and Created Files
### Preserve
- Existing project configuration and dependency lockfiles should be preserved unless required by implementation.
- Any current source files not conflicting with the architecture should be retained and adapted instead of removed.

### Modify
- Application entrypoints to wire auth, routing, and API clients.
- Existing environment configuration to add database, JWT, and scheduler settings.
- Existing navigation and screen files to support profile, plan editor, workout flow, and history.
- Existing backend bootstrap files to register modules, middleware, and background jobs.

### Create
- architecture.md
- Database migration files for users, profiles, plans, plan structure, sessions, history, and recommendation snapshots
- Auth, plan, workout, history, recommendation, and scheduler modules
- Mobile screens for auth, dashboard, workout session, plan editor, and history views
- Shared DTOs, validators, guards, and repository classes

## 14. Recommended Defaults
- Use PostgreSQL UUID keys for all tables.
- Use UTC storage with per-user timezone preference for display and schedule resolution.
- Treat completed workout sessions as append-only records.
- Keep recommendations non-blocking and user-controlled.
- Prefer a single active plan per user.
- If multiple drafts exist, only one plan may be marked active at a time.

## 15. Operational Notes
- All user data must be isolated by authenticated user ID.
- The active workout displayed in the UI must always come from server-resolved state.
- The client may cache the latest profile and active workout for offline viewing, but server state is authoritative.
- The system must support fast workout access with minimal taps from launch to current workout.
- Completed plan history and exercise performance history must remain queryable indefinitely unless a user explicitly deletes their account.
