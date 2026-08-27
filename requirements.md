# Workouts2.0 — Software Requirements Specification

## 1. Purpose
Workouts2.0 is a mobile workout application that allows users to create, manage, follow, and track personalized workout plans. The application must support account-based user access, workout scheduling, workout history, exercise history, and performance-based recommendations, while keeping the workout experience simple and easy to use during actual training sessions.

## 2. Scope
The application shall:
- Allow users to create accounts and sign in.
- Provide each user with a private profile.
- Allow users to create, customize, and manage workout plans.
- Support progressive overload recommendations based on historical workout performance.
- Recommend workouts and exercises based on user goals and plan structure.
- Automatically display the correct workout for the current day based on the active plan schedule.
- Allow users to mark workouts as completed.
- Preserve workout plans, workout history, and exercise history across sessions.
- Restrict each user to their own data.

## 3. Users and Roles
### 3.1 Primary User
A registered mobile user who:
- Creates an account and signs in.
- Creates and manages workout plans.
- Views and edits their profile and workout data.
- Completes workouts and tracks progress.

### 3.2 Authenticated System User State
The application must recognize whether a user is authenticated and only allow access to personal workout and profile data after sign-in.

## 4. Core Features
### 4.1 Account and Authentication
The application shall allow users to:
- Create an account.
- Sign in to an existing account.
- Sign out of the application.

### 4.2 User Profile
Each user shall have a profile that stores and displays:
- Active workout plan.
- Workout history.
- Completed plans.
- Exercise history.

### 4.3 Workout Plan Creation and Management
The application shall allow users to:
- Create a workout plan tailored to their individual goals.
- Select goals when creating a plan.
- Enable or disable progressive overload for a plan.
- Add exercises to workouts and workout days.
- Remove exercises from workouts and workout days.
- Replace exercises.
- Modify exercise details, including sets, reps, and weights.
- Modify an active workout plan at any time.
- Modify individual workout days at any time.

### 4.4 Workout Recommendations
The application shall:
- Recommend workouts and exercises based on the user’s selected goals.
- Recommend future weights when progressive overload is enabled.
- Use the user’s prior workout performance, including historical weights, exercises, and rep schemes, when recommending future weights.

### 4.5 Daily Workout Display and Scheduling
The application shall:
- Determine the current workout based on the current day and the schedule defined by the user’s active workout plan.
- Automatically display the appropriate workout for the current day.
- Automatically advance to the next day’s workout when the day changes.
- Automatically advance to the next week of the workout plan when the current week is completed.

### 4.6 Workout Completion and History
The application shall allow users to:
- Mark individual workouts as completed.
- Complete an entire workout plan.
- Save completed plans to workout history.
- View previous completed plans.
- View historical exercise performance, including previous weights, reps, and other relevant workout data.

### 4.7 Data Persistence and Privacy
The application shall:
- Preserve user data between sessions.
- Ensure each user can access only their own workout plans, workout history, exercise history, and profile information.

### 4.8 Mobile User Experience
The application shall provide:
- A clear and intuitive mobile interface.
- A simple workout experience optimized for use during an active workout session.

## 5. Functional Requirements

### 5.1 Account Management
FR-1: The system shall allow a user to create a new account.

FR-2: The system shall allow a user to sign in using valid account credentials.

FR-3: The system shall allow a user to sign out.

FR-4: The system shall prevent unauthenticated users from accessing private profile data and workout data.

### 5.2 Profile Management
FR-5: The system shall create a unique profile for each user account.

FR-6: The system shall display the user’s active workout plan in the profile.

FR-7: The system shall display the user’s workout history in the profile.

FR-8: The system shall display the user’s completed plans in the profile.

FR-9: The system shall display the user’s exercise history in the profile.

### 5.3 Workout Plan Creation
FR-10: The system shall allow a user to create a workout plan.

FR-11: The system shall allow a user to define the goals for a workout plan.

FR-12: The system shall allow a user to enable or disable progressive overload for a workout plan.

FR-13: The system shall allow a user to define a schedule for a workout plan.

FR-14: The system shall allow a user to add exercises to a workout plan.

FR-15: The system shall allow a user to specify sets, reps, and weights for exercises in a workout plan.

FR-16: The system shall save a created workout plan to the user’s account.

### 5.4 Workout Plan Recommendations
FR-17: The system shall recommend workouts and exercises based on the user’s selected goals and workout plan.

FR-18: The system shall recommend future weights for exercises when progressive overload is enabled.

FR-19: The system shall base weight recommendations on historical user performance data.

FR-20: The system shall consider previous weights used by the user.

FR-21: The system shall consider previous exercises performed by the user.

FR-22: The system shall consider previous rep schemes completed by the user.

### 5.5 Workout Plan Customization
FR-23: The system shall allow a user to modify their active workout plan.

FR-24: The system shall allow a user to modify individual workout days.

FR-25: The system shall allow a user to add exercises to an existing workout plan or workout day.

FR-26: The system shall allow a user to remove exercises from an existing workout plan or workout day.

FR-27: The system shall allow a user to replace an exercise with another exercise.

FR-28: The system shall allow a user to modify an exercise’s sets, reps, and weights.

### 5.6 Workout Scheduling and Daily Display
FR-29: The system shall determine the current workout based on the current day and the schedule of the user’s active workout plan.

FR-30: The system shall display the workout assigned to the current day automatically.

FR-31: The system shall advance the displayed workout to match the next day when a new day begins.

FR-32: The system shall advance to the next week of the workout plan when the current week is completed.

### 5.7 Workout Completion and History Tracking
FR-33: The system shall allow a user to mark an individual workout as completed.

FR-34: The system shall record completion of workouts in workout history.

FR-35: The system shall save a completed workout plan to the user’s profile as completed history.

FR-36: The system shall allow a user to view previous completed plans.

FR-37: The system shall allow a user to view historical exercise performance data.

FR-38: The system shall store previous weights, reps, and other relevant workout data for completed exercises.

### 5.8 Data Persistence and Access Control
FR-39: The system shall preserve all user-specific workout and profile data between sessions.

FR-40: The system shall ensure that each user can view only their own profile, workout plans, workout history, completed plans, and exercise history.

FR-41: The system shall ensure that each user can modify only their own profile and workout data.

## 6. Data Requirements
### 6.1 User Data
The system shall store, at minimum:
- User account identity.
- Authentication state.
- User profile.
- Active workout plan.
- Workout plan goals.
- Workout schedule.
- Workout days.
- Exercise definitions.
- Sets, reps, and weights.
- Workout completion records.
- Completed plans.
- Exercise history.
- Historical performance data.

### 6.2 Workout Plan Data
Each workout plan shall include:
- Plan name or identifier.
- Selected goal(s).
- Progressive overload enabled/disabled status.
- Workout schedule.
- One or more workout days.
- Exercises assigned to each workout day.
- Sets, reps, and weights for exercises.
- Completion state.

### 6.3 Historical Performance Data
The system shall retain enough historical workout information to support:
- Exercise history review.
- Previous weight review.
- Previous rep review.
- Future weight recommendation when progressive overload is enabled.

## 7. Business Rules
BR-1: A user must be signed in to access personal workout or profile data.

BR-2: Each user’s workout plans, workout history, completed plans, and exercise history shall be isolated from other users.

BR-3: A workout plan may optionally enable progressive overload.

BR-4: When progressive overload is enabled, the system shall use the user’s historical workout performance to recommend future weights.

BR-5: Recommended weights shall be informed by past weights, exercises, and rep schemes completed by the same user.

BR-6: The active workout plan shall determine the default workout shown to the user.

BR-7: The workout shown to the user shall correspond to the current day according to the active plan schedule.

BR-8: When the final workout of a week is completed and the next day begins, the system shall advance the active plan into the next week’s scheduled workouts.

BR-9: When an entire workout plan is completed, it shall be moved into completed plan history while remaining viewable by the user.

BR-10: Users may customize their plans at any time, including after activation.

## 8. User Inputs
The application shall accept the following user inputs:
- Account creation details.
- Sign-in credentials.
- Workout goal selections.
- Workout plan names or identifiers.
- Progressive overload selection.
- Workout schedule details.
- Exercise additions, removals, replacements, and edits.
- Set, rep, and weight values.
- Workout completion actions.
- Navigation requests to view current, previous, or completed plans.

## 9. System Outputs
The application shall provide the following outputs:
- Account creation confirmation.
- Sign-in success or failure.
- User profile display.
- Active workout plan display.
- Recommended workouts and exercises.
- Recommended weights when progressive overload is enabled.
- Current day workout display.
- Workout completion confirmation.
- Workout history display.
- Completed plans display.
- Exercise history display.
- Historical performance details, including prior weights and reps.

## 10. Acceptance Criteria
### 10.1 Authentication
AC-1: Given a valid new user, when the user creates an account, then the system shall create a profile and allow sign-in.

AC-2: Given a registered user, when the user signs in with valid credentials, then the system shall grant access to their private workout data.

AC-3: Given an unauthenticated user, when the user attempts to access private workout or profile data, then the system shall deny access.

### 10.2 Profile Data
AC-4: Given a signed-in user, when the user views their profile, then the system shall display the active workout plan, workout history, completed plans, and exercise history.

### 10.3 Plan Creation and Editing
AC-5: Given a signed-in user, when the user creates a workout plan with a goal and schedule, then the system shall save the plan to the user’s account.

AC-6: Given a signed-in user, when the user enables progressive overload for a plan, then the system shall treat the plan as eligible for weight recommendations based on historical performance.

AC-7: Given a signed-in user, when the user modifies an active workout plan or workout day, then the system shall save the updates and reflect them in the next displayed workout.

AC-8: Given a signed-in user, when the user adds, removes, replaces, or edits exercises, sets, reps, or weights, then the system shall persist the changes.

### 10.4 Recommendations
AC-9: Given a plan with selected goals, when the system generates workout or exercise recommendations, then the recommendations shall align with the selected goals.

AC-10: Given a plan with progressive overload enabled and available history, when the system recommends future weights, then the recommendation shall be based on prior weights, exercises, and rep schemes from the same user.

### 10.5 Scheduling
AC-11: Given an active workout plan with a defined schedule, when the current day matches a scheduled workout day, then the system shall display that day’s workout.

AC-12: Given a new day, when the user opens the application, then the system shall display the workout assigned to the new day.

AC-13: Given a completed week in the active plan, when the next scheduled day begins, then the system shall advance to the next week of the plan.

### 10.6 Completion and History
AC-14: Given a workout in progress, when the user marks it completed, then the system shall record the completion.

AC-15: Given an entire plan has been completed, when completion is finalized, then the system shall save the plan to completed workout history.

AC-16: Given a signed-in user, when the user views workout history, then the system shall show previous completed plans.

AC-17: Given a signed-in user, when the user views exercise history, then the system shall show prior weights, reps, and other relevant workout data.

### 10.7 Privacy and Persistence
AC-18: Given a user signs out and later signs back in, when the user returns, then their workout plans and histories shall still be available.

AC-19: Given two different users, when each user signs in, then each shall see only their own profile and workout data.

## 11. Non-Functional Requirements
### 11.1 Usability
NFR-1: The application shall provide a clear and intuitive mobile user interface.

NFR-2: The application shall minimize friction during workout use by making the current workout easy to find and complete.

### 11.2 Data Integrity
NFR-3: The application shall preserve user workout data accurately between sessions.

NFR-4: The application shall maintain a reliable record of workout completion and exercise history.

### 11.3 Security and Privacy
NFR-5: The application shall prevent one user from accessing or modifying another user’s workout or profile data.

### 11.4 Reliability
NFR-6: The application shall retain historical workout information required for future review and recommendations.

## 12. Out of Scope
The following are not required unless added later:
- Social features.
- Public leaderboards.
- Coach or trainer management tools.
- Nutrition tracking.
- Wearable device integrations.
- Payment or subscription handling.
- Community content or shared workout plans.
- External device synchronization.

## 13. Requirements Summary
Workouts2.0 shall provide authenticated, private, persistent workout planning and tracking for each user. It shall support personalized plan creation, editable workout structure, historical performance tracking, daily workout scheduling, and progressive overload recommendations based on the user’s own past performance.
