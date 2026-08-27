# Workout2.0 Requirements Specification

## 1. Purpose
Workout2.0 is a mobile workout application that allows users to create accounts, sign in, build and manage workout plans, track workout completion and exercise history, and receive workout and weight recommendations based on their goals and past performance. The application must support a simple, intuitive workout experience and preserve user data between sessions.

## 2. Users and Access
### 2.1 User Type
- **Authenticated end user**: A person who creates an account, signs in, and manages personal workout data.

### 2.2 Access Rules
- Each user must only be able to access, view, create, update, and delete their own account data, profile, workout plans, workout history, completed plans, and exercise history.
- No user may view or modify another user's workout data.

## 3. Core Features
### 3.1 Account Creation and Sign-In
- The application must allow a user to create an account.
- The application must allow a user to sign in to an existing account.
- The application must maintain the user session across app usage so that returning users remain authenticated until they sign out or their session expires.

### 3.2 User Profile
- Each user must have a personal profile.
- The profile must store and display:
  - The user’s active workout plan.
  - The user’s workout history.
  - The user’s completed workout plans.
  - The user’s exercise history.

### 3.3 Workout Plan Creation and Management
- Users must be able to create workout plans tailored to their individual goals.
- When creating a plan, users must be able to specify the goal the plan is intended to support.
- When creating a plan, users must be able to enable or disable progressive overload.
- Users must be able to view and edit their workout plans.
- Users must be able to modify their active workout plan at any time.
- Users must be able to modify individual workout days at any time.

### 3.4 Recommended Workouts and Exercises
- The application must provide recommended workouts and exercises based on the user’s selected goals and workout plan.
- Recommendations must be presented as suggestions only; users must retain full control over plan content.

### 3.5 Workout Customization
Users must be able to fully customize workout plans, including the ability to:
- Add exercises.
- Remove exercises.
- Replace exercises.
- Modify exercises.
- Change sets.
- Change reps.
- Change weights.

### 3.6 Progressive Overload Recommendations
- If progressive overload is enabled for a plan, the application must recommend increased weights based on the user’s prior workout performance.
- Recommendations must use the user’s historical performance, including previous exercises, previous weights, and rep schemes, when determining future recommended weights.
- The application must not automatically override a user’s chosen workout values; recommendations must be visible and usable by the user.

### 3.7 Current Workout Determination and Scheduling
- The application must determine the user’s current workout based on the current day and the schedule defined by the user’s active workout plan.
- When a new day begins, the application must automatically display the workout assigned to that day in the active plan.
- When the current week of the plan is completed, the application must correctly advance to the next week of the workout plan.
- The application must always show the workout corresponding to the user’s current plan schedule.

### 3.8 Workout Completion Tracking
- Users must be able to mark individual workouts as completed when they finish them.
- When a user completes an entire workout plan, the application must save that plan to the user’s profile as completed workout history.
- Completed plans must remain viewable as historical records.

### 3.9 Workout History and Exercise History
- The application must preserve historical workout data for each user.
- The application must allow users to view previous completed plans.
- The application must allow users to view historical exercise performance, including at minimum:
  - Previous weights.
  - Previous reps.
  - Other relevant workout data associated with completed or performed exercises.

### 3.10 Mobile User Experience
- The application must provide a clear and intuitive mobile interface.
- The interface must support a simple workout flow suitable for use during an actual workout session.
- The primary workout experience must minimize unnecessary complexity and allow fast access to the current workout.

### 3.11 Data Persistence
- User data must persist between sessions.
- The application must preserve account information, active workout plans, completed plans, workout history, and exercise history after the app is closed and reopened.

## 4. Functional Requirements
### 4.1 Authentication and Identity
- FR-1: The system must support user registration.
- FR-2: The system must support user sign-in.
- FR-3: The system must associate all workout data with a single authenticated user account.
- FR-4: The system must prevent cross-account access to private data.

### 4.2 Profile Data
- FR-5: The system must provide a user profile page or view.
- FR-6: The profile must display the user’s active workout plan.
- FR-7: The profile must display the user’s workout history.
- FR-8: The profile must display the user’s completed plans.
- FR-9: The profile must display the user’s exercise history.

### 4.3 Plan Creation and Editing
- FR-10: The system must allow users to create workout plans.
- FR-11: The system must allow users to define the goal for a workout plan.
- FR-12: The system must allow users to enable or disable progressive overload on a plan.
- FR-13: The system must allow users to edit any workout plan they own.
- FR-14: The system must allow users to edit the active workout plan.
- FR-15: The system must allow users to edit individual workout days.
- FR-16: The system must allow users to add, remove, replace, and modify exercises in a plan.
- FR-17: The system must allow users to change sets, reps, and weights in a plan.

### 4.4 Recommendation Behavior
- FR-18: The system must provide workout and exercise recommendations based on the user’s selected goals.
- FR-19: The system must provide recommendations based on the structure and content of the user’s workout plan.
- FR-20: If progressive overload is enabled, the system must provide weight recommendations based on prior user performance.
- FR-21: The system must use historical performance data when generating future weight recommendations.

### 4.5 Schedule and Current Workout
- FR-22: The system must determine the current workout from the active plan and the current day.
- FR-23: The system must automatically present the correct workout for the current day.
- FR-24: The system must advance to the next week of the plan after completion of the current week according to the plan schedule.
- FR-25: The system must reflect plan schedule changes when a user edits the active plan.

### 4.6 Completion and History
- FR-26: The system must allow users to mark individual workouts as completed.
- FR-27: The system must record completion events for workouts.
- FR-28: The system must move a fully completed workout plan into the user’s completed plan history.
- FR-29: The system must preserve completed plans for future viewing.
- FR-30: The system must preserve exercise performance history across completed and completed/recorded workouts.

### 4.7 Persistence and Session Continuity
- FR-31: The system must persist user data between sessions.
- FR-32: The system must restore each user’s personal data when they return to the application.
- FR-33: The system must preserve the user’s active workout state across app restarts.

## 5. Inputs
The application must accept the following inputs from users:
- Account registration information.
- Sign-in credentials.
- Workout plan name and structure.
- Selected workout goal.
- Progressive overload enable/disable setting.
- Workout schedule details.
- Exercises to include in a plan.
- Exercise details including sets, reps, and weights.
- Edits to existing plans, workout days, and exercises.
- Workout completion status for individual workouts.
- Data associated with completed workouts and exercise performance.

## 6. Outputs
The application must present the following outputs:
- Account creation confirmation and sign-in state.
- User profile views.
- Active workout plan display.
- Current workout for the current day.
- Recommended workouts and exercises.
- Recommended weights when progressive overload is enabled.
- Editable workout plan views.
- Workout completion confirmation.
- Completed plan history.
- Exercise history and performance summaries including previous weights and reps.

## 7. Business Rules
- BR-1: A workout plan belongs to exactly one user.
- BR-2: Only the owner of a plan may access or modify that plan.
- BR-3: The active workout plan must represent the plan currently in use by the user.
- BR-4: Progressive overload recommendations are required only when the feature is enabled for a plan.
- BR-5: Weight recommendations must be based on the user’s historical workout performance rather than generic values alone.
- BR-6: Users retain final control over all workout content and may override recommendations.
- BR-7: A completed workout plan must be retained as historical data after completion.
- BR-8: Workout and exercise history must remain available for future review.
- BR-9: The current workout displayed by the application must match the active plan schedule for the current day.
- BR-10: The application must automatically progress through the workout plan timeline according to the defined schedule.

## 8. Data Requirements
The application must store, at minimum, the following data per user:
- Account and authentication data.
- Profile data.
- Active workout plan data.
- Workout plan definitions.
- Workout day definitions.
- Exercise definitions.
- Sets, reps, and weights for each exercise.
- Goal associated with each plan.
- Progressive overload setting for each plan.
- Workout completion records.
- Completed plans.
- Exercise history.
- Historical performance data used for recommendations.

## 9. Acceptance Criteria
### 9.1 Account Management
- AC-1: A new user can register an account successfully.
- AC-2: A registered user can sign in successfully.
- AC-3: After signing in, the user can access only their own workout data.

### 9.2 Profile and History
- AC-4: The user profile displays the active workout plan.
- AC-5: The user profile displays completed workout plans.
- AC-6: The user profile displays workout history.
- AC-7: The user profile displays exercise history.

### 9.3 Plan Creation and Editing
- AC-8: A user can create a workout plan for a selected goal.
- AC-9: A user can enable or disable progressive overload when creating or editing a plan.
- AC-10: A user can add, remove, replace, and modify exercises in a plan.
- AC-11: A user can change sets, reps, and weights in a plan.
- AC-12: A user can edit the active workout plan at any time.
- AC-13: A user can edit an individual workout day at any time.

### 9.4 Recommendations
- AC-14: The application provides workout and exercise recommendations based on the user’s goal and plan.
- AC-15: When progressive overload is enabled, the application provides recommended weight increases based on prior performance.
- AC-16: Recommendations reflect historical performance data such as prior weights, reps, and exercise patterns.

### 9.5 Scheduling and Current Workout
- AC-17: The application displays the correct workout for the current day based on the active plan.
- AC-18: The application advances to the next workout week when the current week is completed.
- AC-19: If the active plan schedule changes, the displayed current workout updates accordingly.

### 9.6 Completion and History
- AC-20: A user can mark an individual workout as completed.
- AC-21: When all workouts in a plan are completed, the plan is saved to completed history.
- AC-22: Completed plans remain available for later viewing.
- AC-23: Exercise history remains available and includes prior weights and reps.

### 9.7 Persistence and Security
- AC-24: User data remains available after the application is closed and reopened.
- AC-25: A user cannot access another user’s profile, plans, workout history, or exercise history.
- AC-26: The application preserves the user’s active workout state between sessions.

## 10. Scope Clarifications
- The application must define workout behavior, tracking, and recommendations for individual users only.
- The application must prioritize a simple, mobile-friendly workout experience.
- The application must support the storage and review of historical workout performance.
- The application must not expose another user’s data under any circumstance.

## 11. Non-Functional Requirements
### 11.1 Usability
- The application must be easy to use during a live workout.
- The primary workout flow must be simple, clear, and mobile-friendly.

### 11.2 Data Integrity
- The application must preserve workout and profile data accurately between sessions.
- Historical workout records must remain associated with the correct user and plan.

### 11.3 Privacy and Access Control
- The application must enforce user-level privacy for all personal workout information.

### 11.4 Consistency
- The application must consistently show the current workout based on the active plan schedule and current date.
- The application must consistently apply progressive overload rules when enabled.
