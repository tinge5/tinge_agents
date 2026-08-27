# Workouts2.0 Requirements

## 1. Purpose
Workouts2.0 is a mobile workout application that allows users to create, manage, and follow personalized workout plans, track exercise performance over time, and view workout history. The application must be simple and intuitive to use during workouts while preserving user data between sessions.

## 2. Users and Access
### 2.1 User Types
- **Authenticated user:** A person with an account who can create, view, and modify only their own workout plans, workout history, exercise history, and profile information.
- **Unauthenticated visitor:** A person who has not signed in and may only access authentication-related screens.

### 2.2 Access Control
- Each user must be able to access only their own data.
- Users must not be able to view or modify other users’ profiles, plans, histories, or workout data.
- All user-specific workout data must persist across app sessions.

## 3. Core Features
1. Account creation and sign-in.
2. User profile with workout-related history.
3. Creation and management of personalized workout plans.
4. Workout plan scheduling and automatic current-workout selection based on day and plan schedule.
5. Progressive overload recommendations based on historical performance.
6. Workout and exercise recommendations aligned to user goals.
7. Full manual customization of workout plans and workout days.
8. Workout completion tracking.
9. Workout plan completion archiving to history.
10. Viewing previous completed plans and exercise performance history.

## 4. Functional Requirements

### 4.1 Account Creation and Authentication
- The application must allow users to create an account.
- The application must allow users to sign in to an existing account.
- The application must maintain the authenticated session so that users remain signed in according to product session rules.
- The application must prevent unauthenticated users from accessing private workout data.

### 4.2 User Profile
- Each user must have a profile.
- The profile must store and display the user’s:
  - active workout plan
  - workout history
  - completed plans
  - exercise history
- The profile must allow the user to view historical workout information over time.

### 4.3 Workout Plan Creation
- Users must be able to create workout plans tailored to their individual goals.
- When creating a plan, users must be able to specify the plan’s goal(s).
- When creating a plan, users must be able to enable or disable progressive overload.
- The plan must support a workout schedule that defines which workout occurs on which day.
- The plan must support exercises with associated sets, reps, and weights.

### 4.4 Workout and Exercise Recommendations
- The application must provide recommended workouts and exercises based on the user’s selected goals and workout plan.
- Recommendations must be relevant to the selected goal(s) and the structure of the plan.
- Users must be able to accept recommendations or override them with custom selections.

### 4.5 Manual Plan Customization
Users must have full control to customize their plans at any time, including:
- adding exercises
- removing exercises
- replacing exercises
- modifying exercises
- changing sets
- changing reps
- changing weights
- modifying individual workout days
- modifying the active workout plan

### 4.6 Active Workout Plan Management
- A user must be able to designate one plan as the active workout plan.
- The application must use the active workout plan to determine the current workout to display.
- Users must be able to modify the active workout plan while it is active.

### 4.7 Daily Workout Determination
- The application must automatically determine the user’s current workout based on the current day and the schedule defined by the active workout plan.
- When a new day begins, the application must automatically display the workout assigned to that day in the active plan.
- When the current week of the workout plan is completed, the application must correctly advance to the next week of the plan.
- If the active plan does not define a workout for the current day, the application must show that no workout is scheduled for that day.

### 4.8 Progressive Overload
- Users must be able to enable progressive overload when creating a workout plan.
- If progressive overload is enabled, the application must recommend increases in weight based on the user’s historical performance.
- The application must consider the user’s previous weights, exercises, and rep schemes when determining future recommended weights.
- The application must use historical performance data to inform recommendations for future workouts.
- If insufficient historical performance data exists for a recommendation, the application must still present a reasonable recommendation or indicate that no adjustment can be determined.

### 4.9 Workout Completion
- Users must be able to mark individual workouts as completed when they finish them.
- The application must record the completion of each workout.
- Workout completion data must be available in the user’s history.

### 4.10 Plan Completion and Archiving
- When a user completes an entire workout plan, the application must save the completed plan to the user’s profile as workout history.
- Completed plans must remain viewable after archiving.
- The user must be able to view previous completed plans from their profile.

### 4.11 Exercise History
- The application must store and display exercise history for each user.
- Exercise history must include previous weights, reps, and other relevant workout data.
- The application must allow the user to review historical performance for specific exercises.

### 4.12 Data Persistence
- User accounts, profiles, active plans, completed plans, workout history, and exercise history must persist between sessions.
- Data entered or updated by the user must not be lost when the app is closed and reopened.

### 4.13 Mobile User Experience
- The application must provide a clear and intuitive mobile interface.
- The workout experience must remain simple and easy to use during an actual workout.
- Core workout actions must be easy to access from a mobile device.

## 5. Data Requirements
The application must maintain, at minimum, the following data entities:

### 5.1 User Profile Data
- User identifier
- Account credentials and authentication state
- Active workout plan reference
- Workout history references
- Completed plan references
- Exercise history references

### 5.2 Workout Plan Data
- Plan identifier
- Plan name
- Goal(s)
- Active/inactive state
- Schedule by day
- Exercise list
- Exercise details including sets, reps, and weights
- Progressive overload enabled/disabled state
- Plan completion status

### 5.3 Workout Performance Data
- Workout date
- Workout/day reference
- Completion status
- Exercise performance details
- Weight used
- Reps performed
- Set data
- Historical progression information

## 6. Business Rules
1. A user may only access and modify their own data.
2. A user may have one active workout plan at a time unless the product later defines otherwise.
3. The current workout is determined by the active workout plan and the current day.
4. When a week defined by the active plan ends, the next week in the plan must become the current week.
5. If progressive overload is enabled, future recommendations must be based on the user’s historical performance.
6. Workout recommendations must align with the selected goal(s) and plan structure.
7. Users may override recommendations with manual edits.
8. A completed workout plan must be archived to the user’s history when the plan is fully completed.
9. Historical workout and exercise data must remain available after completion and archiving.
10. Data must persist across sessions.

## 7. Inputs
### 7.1 User Inputs
- Account registration information
- Sign-in credentials
- Workout goal selection
- Workout plan name/details
- Progressive overload selection
- Schedule selection
- Exercise selection
- Set, rep, and weight values
- Plan and workout day edits
- Workout completion action

### 7.2 System Inputs
- Current date/day
- Historical workout performance data
- Historical exercise performance data
- Active workout plan schedule

## 8. Outputs
- Account creation and sign-in status
- Current workout for the day
- Recommended workouts and exercises
- Recommended weight adjustments when progressive overload is enabled
- Active workout plan details
- Workout completion confirmation
- Archived completed plan records
- Workout history views
- Exercise history views
- Profile information and stored workout records

## 9. Acceptance Criteria
### 9.1 Authentication
- Given a new user, when they create an account, then the account is created and the user can sign in.
- Given an existing user, when they sign in with valid credentials, then they gain access to their own profile and workout data.
- Given an unauthenticated user, when they attempt to access private workout data, then access is denied.

### 9.2 Profile and Data Storage
- Given a signed-in user, when they open their profile, then they can view their active workout plan, workout history, completed plans, and exercise history.
- Given a user who has completed workouts or plans, when they return later, then their data remains available.

### 9.3 Plan Creation and Customization
- Given a user creating a plan, when they select goals and configure the plan, then the plan is created with those settings.
- Given a user creating or editing a plan, when they enable progressive overload, then the plan stores that setting.
- Given a user editing a plan, when they add, remove, replace, or modify exercises, sets, reps, or weights, then the plan reflects the changes.

### 9.4 Recommendations
- Given a user with selected goals and a plan, when recommendations are requested, then the application provides workouts and exercises aligned with the goals and plan.
- Given progressive overload is enabled and historical performance exists, when recommendations are generated, then weight recommendations reflect previous weights, exercises, and rep schemes.

### 9.5 Current Workout Determination
- Given an active workout plan with a schedule, when the current day matches a scheduled workout, then the application displays that workout.
- Given a new day begins, when the user opens the app, then the current workout shown matches the new day’s scheduled workout.
- Given a plan includes multiple weeks, when one week is completed, then the application advances to the next week of the plan.

### 9.6 Workout Completion and History
- Given a user finishes a workout, when they mark it as completed, then the completion is recorded.
- Given a user completes an entire workout plan, when the final workout is completed, then the plan is saved in workout history as a completed plan.
- Given a user views completed plans, then they can see previous plans and their associated performance history.
- Given a user views exercise history, then they can see previous weights, reps, and related exercise data.

### 9.7 Access and Privacy
- Given two different users, when one user signs in, then they can only view and edit their own data.
- Given any user, when they attempt to access another user’s workout history or profile information, then the application prevents access.

## 10. Non-Functional Requirements
- The application must be mobile-friendly.
- The interface must be clear, intuitive, and usable during workouts.
- The application must preserve data between sessions.
- The application must protect user privacy and data access.
- The application must provide a simple workout experience optimized for quick interaction.

## 11. Scope Clarifications
- This specification defines the required user-facing behavior and data handling expectations for Workouts2.0.
- The specification does not prescribe implementation details, architecture, technology stack, or algorithms beyond the functional requirement that recommendations and progressive overload must use historical performance data.
