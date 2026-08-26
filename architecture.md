# Workouts2.0 Technical Architecture

## 1. Architecture Overview
Workouts2.0 is a mobile-first workout tracking application with a client-server architecture.

- **Frontend**: mobile app optimized for quick in-workout interactions
- **Backend**: REST API for authentication, workout plan management, scheduling, recommendations, completion tracking, and history
- **Database**: relational database for user-owned workout plans and historical records
- **Recommendation engine**: backend service/module that generates goal-based workouts and progressive overload suggestions using each user’s history

The system is designed for strict per-user data isolation, durable persistence across sessions, and simple mobile usability.

## 2. Recommended Technology Stack
### Frontend
- **Framework**: React Native
- **Language**: TypeScript
- **State management**: Redux Toolkit or Zustand for local UI and session state
- **Networking**: fetch/axios with typed API clients
- **Form handling**: React Hook Form
- **Validation**: Zod or Yup
- **Navigation**: React Navigation

### Backend
- **Runtime**: Node.js
- **Framework**: NestJS or Express with structured service layers
- **Language**: TypeScript
- **API style**: REST/JSON
- **Auth**: JWT access tokens plus refresh tokens
- **Validation**: class-validator/Zod DTO validation
- **Job/scheduling support**: lightweight server-side date calculation; optional background job runner for periodic cleanup or notifications

### Database and Storage
- **Primary database**: PostgreSQL
- **ORM**: Prisma or TypeORM
- **Caching/session support**: Redis optional for refresh-token/session tracking and rate limiting
- **File storage**: not required by current requirements

## 3. Frontend Structure
### 3.1 App Modules
- **Authentication screens**: sign up, sign in, session restore
- **Dashboard/home**: current workout, today’s workout, next action
- **Plan builder**: create/edit active plan, select goals, configure schedule, exercises, sets, reps, weights, progressive overload toggle
- **Workout execution screen**: simple workout flow, set completion, weight/reps entry, mark workout complete
- **Recommendations screen**: suggested workouts/exercises and editable preview before saving to plan
- **Profile/history screens**: active plan summary, workout history, completed plans, exercise history, account details

### 3.2 Frontend Responsibilities
- Store and restore auth tokens securely on device
- Fetch the signed-in user’s active plan, current workout, and histories
- Present editable forms for plans and workouts
- Allow quick completion actions during workouts
- Prevent access to protected routes when unauthenticated
- Keep interactions minimal and large-touch-friendly for mobile use

## 4. Backend Structure
### 4.1 Service Layers
- **AuthService**: account creation, login, token issuance, refresh, sign-out
- **UserService**: profile retrieval and user-owned data aggregation
- **WorkoutPlanService**: create, read, update, delete active plan and workout days
- **WorkoutExecutionService**: current workout determination, completion recording, week progression
- **RecommendationService**: goal-based exercise/workout recommendations and progressive overload suggestions
- **HistoryService**: completed plans, prior workouts, exercise history
- **Authorization guard**: enforces ownership on every protected resource

### 4.2 Domain Rules Enforcement
- Every data access query is scoped by authenticated `userId`
- Recommendations are generated only from the authenticated user’s goals, active plan, and prior performance
- Progressive overload can only suggest weights derived from the user’s historical exercise/rep scheme data
- Current workout is computed from the active plan schedule and current date
- Completion of final workout in a plan converts the plan into completed history

## 5. Database Design / Data Model
### 5.1 Core Entities
#### users
- `id` (PK)
- `email` (unique)
- `password_hash`
- `display_name`
- `created_at`
- `updated_at`

#### user_profiles
- `id` (PK)
- `user_id` (FK, unique)
- `active_plan_id` (FK, nullable)
- `created_at`
- `updated_at`

#### workout_plans
- `id` (PK)
- `user_id` (FK)
- `name`
- `goal` (enum/string)
- `is_active`
- `progressive_overload_enabled` (boolean)
- `start_date`
- `current_week_index`
- `status` (draft/active/completed/archived)
- `completed_at` (nullable)
- `created_at`
- `updated_at`

#### workout_days
- `id` (PK)
- `plan_id` (FK)
- `week_index`
- `day_index`
- `scheduled_day_of_week` or `scheduled_date` depending on plan model
- `title`
- `notes`
- `is_rest_day`
- `created_at`
- `updated_at`

#### exercises
- `id` (PK)
- `name`
- `category`
- `muscle_group`
- `equipment`

#### workout_day_exercises
- `id` (PK)
- `workout_day_id` (FK)
- `exercise_id` (FK)
- `order_index`
- `target_sets`
- `target_reps`
- `target_weight`
- `recommended_weight`
- `customized_by_user` (boolean)
- `notes`

#### workout_sets
- `id` (PK)
- `workout_day_exercise_id` (FK)
- `set_number`
- `target_reps`
- `target_weight`
- `actual_reps` (nullable)
- `actual_weight` (nullable)
- `completed_at` (nullable)

#### workout_completions
- `id` (PK)
- `user_id` (FK)
- `plan_id` (FK)
- `workout_day_id` (FK)
- `completed_at`
- `week_index`
- `day_index`
- `notes`

#### exercise_performances
- `id` (PK)
- `user_id` (FK)
- `exercise_id` (FK)
- `plan_id` (FK, nullable)
- `workout_day_id` (FK, nullable)
- `set_id` (FK, nullable)
- `performed_at`
- `weight`
- `reps`
- `volume`

#### completed_plans
- `id` (PK)
- `user_id` (FK)
- `original_plan_id` (FK)
- `plan_snapshot_json`
- `completed_at`

#### auth_refresh_tokens
- `id` (PK)
- `user_id` (FK)
- `token_hash`
- `expires_at`
- `revoked_at` (nullable)
- `created_at`

### 5.2 Relationships
- One user has one profile
- One user has many workout plans
- One active profile references one current active workout plan
- One plan has many workout days
- One workout day has many exercises
- One workout day exercise has many sets
- One workout completion belongs to one user, one plan, and one workout day
- One exercise performance belongs to one user and one exercise, with optional plan/day/set linkage
- One completed plan stores a snapshot of the finished plan for history

### 5.3 Indexing and Constraints
- Unique index on `users.email`
- Unique index on `user_profiles.user_id`
- Composite indexes on `(user_id, status)` for plans and `(user_id, performed_at)` for performance history
- Composite indexes on `(plan_id, week_index, day_index)` for schedule lookup
- Foreign key constraints on all ownership and relationship fields
- Check constraints for positive reps, sets, and weights

## 6. API Design
All protected endpoints require a valid JWT access token.

### 6.1 Authentication
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in and receive tokens
- `POST /api/auth/refresh` — exchange refresh token for new access token
- `POST /api/auth/logout` — revoke refresh token
- `GET /api/auth/me` — return current session user

### 6.2 Profile
- `GET /api/profile` — return active plan, workout history, completed plans, exercise history, and basic profile data
- `PATCH /api/profile` — update profile fields as allowed

### 6.3 Workout Plans
- `GET /api/plans/active` — fetch active plan
- `POST /api/plans` — create plan
- `PATCH /api/plans/:planId` — edit plan metadata, goals, schedule, progressive overload setting
- `DELETE /api/plans/:planId` — archive or remove draft plan
- `POST /api/plans/:planId/activate` — set a plan as active
- `PATCH /api/plans/:planId/days/:dayId` — modify an individual workout day
- `POST /api/plans/:planId/days/:dayId/exercises` — add exercise to a workout day
- `PATCH /api/plans/:planId/days/:dayId/exercises/:exerciseLinkId` — modify exercise configuration
- `DELETE /api/plans/:planId/days/:dayId/exercises/:exerciseLinkId` — remove exercise from day

### 6.4 Recommendations
- `GET /api/recommendations/workouts?goal=...` — recommended workouts based on goal and plan context
- `GET /api/recommendations/exercises?goal=...` — recommended exercises
- `GET /api/recommendations/progressive-overload?exerciseId=...&repScheme=...` — historical weight recommendation when enabled

### 6.5 Current Workout and Scheduling
- `GET /api/workouts/current` — determine and return the current workout for today
- `GET /api/workouts/schedule` — return schedule for the active plan

### 6.6 Completion and History
- `POST /api/workouts/:workoutDayId/complete` — mark workout day complete
- `POST /api/plans/:planId/complete` — complete entire plan and snapshot history
- `GET /api/history/plans` — completed plans
- `GET /api/history/exercises` — exercise history and performance details
- `GET /api/history/workouts` — prior workout completions

### 6.7 API Behavior
- All write endpoints verify ownership using authenticated `userId`
- Validation errors return 400
- Unauthorized requests return 401
- Forbidden cross-user access returns 403
- Not found returns 404

## 7. Authentication and Authorization
### 7.1 Authentication Model
- Email/password registration
- Passwords stored as salted hashes using Argon2 or bcrypt
- Short-lived JWT access token for API access
- Long-lived refresh token stored hashed in database and on device
- Secure token storage on mobile using platform secure storage

### 7.2 Authorization Model
- All protected resources are filtered by `userId`
- User role is implicitly standard end user; no admin features are required
- Guests can only access auth routes
- Cross-user access is blocked at both route guard and data query layers

## 8. Security Requirements
- Use HTTPS for all API traffic
- Hash passwords with a strong adaptive hashing algorithm
- Store refresh tokens hashed server-side
- Rotate refresh tokens on refresh
- Implement request validation on every write endpoint
- Protect against mass assignment by explicit DTO mapping
- Apply rate limiting to auth endpoints
- Use server-side ownership checks for every resource lookup and mutation
- Encode dates/time zones consistently in UTC
- Sanitize input strings and constrain numeric workout fields to safe ranges
- Return minimal error details to clients

## 9. Data Flow
### 9.1 Registration and Login
1. User submits registration or login details from mobile app
2. Backend validates input and creates or verifies credentials
3. Backend issues access token and refresh token
4. Frontend stores tokens securely and loads session data

### 9.2 Plan Creation and Editing
1. User selects goals and configures a plan
2. Frontend sends plan definition to backend
3. Backend validates and persists the plan and nested workout days/exercises/sets
4. Backend updates the active plan reference in the profile if activated
5. Frontend refreshes current plan state

### 9.3 Current Workout Determination
1. User opens the app on a given day
2. Frontend requests current workout
3. Backend resolves the active plan schedule using current date and week index
4. Backend returns the correct workout day and any recommendations

### 9.4 Progressive Overload Recommendation
1. User requests a recommendation or opens a planned workout with overload enabled
2. Backend queries historical exercise performance for the same exercise and rep scheme
3. Backend computes a safe future weight suggestion based only on prior data
4. Frontend displays the recommended change as editable

### 9.5 Completion and History
1. User marks sets or a workout day complete
2. Backend stores completion records and exercise performance entries
3. If the final workout in a plan is completed, backend snapshots the plan into completed history
4. Profile and history screens read from history tables to display prior data

## 10. Major Component Relationships
- **Mobile app** is the only client
- **API layer** mediates all access to user data
- **Auth module** protects all non-auth endpoints
- **Plan module** owns active plan creation and edits
- **Workout execution module** reads schedule and records completions
- **Recommendation module** reads goals and historical performance to generate suggestions
- **History module** aggregates completed plans and exercise history for the profile screen
- **Database** persists all user-owned state and historical records

## 11. Implementation Structure
### 11.1 Frontend Project Structure
- `src/screens/auth`
- `src/screens/home`
- `src/screens/plans`
- `src/screens/workout`
- `src/screens/history`
- `src/components`
- `src/api`
- `src/store`
- `src/navigation`
- `src/utils`

### 11.2 Backend Project Structure
- `src/modules/auth`
- `src/modules/users`
- `src/modules/plans`
- `src/modules/workouts`
- `src/modules/recommendations`
- `src/modules/history`
- `src/common/guards`
- `src/common/dto`
- `src/common/interceptors`
- `src/database`

### 11.3 Files to Preserve, Modify, or Create
- **Preserve**: `requirements.md` as the source of truth for scope and behavior
- **Create**: `architecture.md` as the finalized architecture document
- **Create**: frontend app entry, navigation, screens, API client, secure token storage, and state store files in the implementation phase
- **Create**: backend module, controller, service, DTO, guard, entity/model, and migration files in the implementation phase
- **Modify**: any future implementation files to align with the defined data model, API contracts, and ownership rules

## 12. Summary of Core Design Decisions
- Use a mobile-first React Native frontend with TypeScript
- Use a TypeScript REST backend with layered services and JWT auth
- Use PostgreSQL for durable per-user workout plans and history
- Model plans, workout days, exercises, sets, completions, and performance history explicitly
- Enforce strict per-user access control at every layer
- Generate recommendations from goals and historical workout data only
- Support current workout calculation from schedule and date-based progression
- Persist completed plans and exercise history for future review and recommendations
