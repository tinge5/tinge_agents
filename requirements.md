# Workouts2.0 Requirements Specification

## 1. Product Overview
Workouts2.0 is a mobile workout application that allows users to create, manage, and complete personalized workout plans, track workout history, and review past exercise performance. The application must preserve user data across sessions and ensure that each user can access only their own data.

## 2. Users and Roles
### 2.1 End User
A registered person who can create an account, sign in, manage a personal workout profile, build and modify workout plans, complete workouts, and review workout history.

### 2.2 System
The application itself, which must manage account access, workout scheduling, plan progression, recommendations, history tracking, and data isolation between users.

## 3. Core Features
The application must provide the following core capabilities:
1. Account creation and sign-in.
2. User profile storage and display.
3. Creation and editing of workout plans.
4. Automatic workout recommendation based on user goals and active plans.
5. Optional progressive overload recommendations based on historical performance.
6. Current-day workout determination and week progression.
7. Workout completion tracking.
8. Persistence of active plans, completed plans, exercise history, and workout history.
9. Viewing of historical plans and exercise performance.
10. Mobile-friendly workout interface optimized for use during exercise.

## 4. Functional Requirements

### 4.1 Account Creation and Authentication
1. The application must allow a user to create an account.
2. The application must allow a user to sign in to an existing account.
3. The application must prevent unauthenticated users from accessing private user data.
4. The application must maintain a separate account for each user.

### 4.2 User Profile
1. Each user must have a profile.
2. A user profile must store and display the following data at minimum:
   - Active workout plan
   - Workout history
   - Completed plans
   - Exercise history
3. The profile must allow the user to review prior workout activity and past plans.
4. The profile must show only the currently signed-in user’s data.

### 4.3 Workout Plan Creation and Management
1. The application must allow users to create workout plans tailored to their individual goals.
2. When creating a plan, the user must be able to specify the workout goal or goals that the plan is intended to support.
3. The application must allow the user to define workout days within a plan.
4. The application must allow the user to customize a plan by adding, removing, replacing, or modifying:
   - Exercises
   - Sets
   - Reps
   - Weights
5. The user must be able to modify the active workout plan at any time.
6. The user must be able to modify individual workout days at any time.
7. The application must allow the user to designate one plan as the active workout plan.
8. The application must store the user’s active workout plan in the user profile.

### 4.4 Workout and Exercise Recommendations
1. The application must provide recommended workouts and exercises based on the user’s selected goals and active workout plan.
2. Recommendations must be presented as suggestions only and must not prevent the user from customizing the plan.
3. The application must allow users to fully control and override recommended exercises, sets, reps, and weights.
4. The application must support different workout plans for different user goals.

### 4.5 Progressive Overload
1. When creating a workout plan, the user must be able to enable or disable progressive overload.
2. If progressive overload is enabled, the application must recommend increases in weight using the user’s historical performance data.
3. Weight recommendations must consider, at minimum:
   - Previous weights used
   - Exercises performed
   - Rep schemes completed
4. The application must use the user’s historical performance to inform future recommended weights.
5. If sufficient historical data is not available, the application must still allow the user to continue using the plan without blocking workout completion.
6. Progressive overload recommendations must be user-specific and must not use data from other users.

### 4.6 Current Workout Determination and Schedule Progression
1. The application must determine the user’s current workout based on the current day and the schedule defined by the active workout plan.
2. The application must automatically display the workout appropriate for the current day when the user opens the app.
3. When a new day begins, the application must present the workout for that day according to the active plan schedule.
4. The application must advance to the next week of the workout plan when the current week has been completed.
5. The application must preserve the user’s position within the plan across app sessions.
6. The application must allow the user to review upcoming and past workout days within the active plan.

### 4.7 Workout Completion
1. The user must be able to mark an individual workout as completed when finished.
2. The application must record completion of the workout day and associated exercise performance data.
3. The application must preserve completed workout information in the user’s history.
4. Completing a workout must not delete or overwrite prior completed workout records.

### 4.8 Plan Completion and History
1. When a user completes an entire workout plan, the application must save the completed plan to the user’s profile as workout history.
2. The application must allow users to view previous completed plans.
3. The application must allow users to view historical exercise performance, including at minimum:
   - Previous weights
   - Previous reps
   - Other relevant workout data captured during workouts
4. The application must retain completed plans and exercise history unless the user explicitly removes them, if removal is supported by the product.
5. The application must clearly distinguish between the active workout plan and completed plans.

### 4.9 Data Persistence
1. The application must preserve user data between sessions.
2. Persisted user data must include at minimum:
   - Account information
   - Profile data
   - Active workout plan
   - Workout history
   - Completed plans
   - Exercise history
3. If the user signs out and later signs back in, previously saved data must still be available.
4. Data entered or updated during a workout must remain available after app closure and restart.

### 4.10 Security and Privacy
1. Each user must only be able to access and modify their own workout plans, workout history, and profile information.
2. The application must prevent one user from viewing or editing another user’s private data.
3. The application must require sign-in before accessing private workout data.
4. The application must keep user-specific workout recommendations, plan history, and exercise history isolated per account.

### 4.11 Mobile Experience and Usability
1. The application must provide a clear and intuitive mobile interface.
2. The workout experience must be simple and easy to use during an actual workout.
3. The application must present workout information in a way that minimizes friction while exercising.
4. The user must be able to access the current workout and completion controls quickly from the mobile interface.

## 5. Inputs
The application must accept the following inputs from the user:
1. Account credentials for sign-in.
2. Account details for account creation.
3. Workout goals.
4. Workout plan structure, including workout days.
5. Exercises, sets, reps, and weights.
6. Progressive overload preference.
7. Edits to active plans and workout days.
8. Workout completion actions.
9. Workout performance data entered during or after workouts.

## 6. Outputs
The application must present the following outputs:
1. Authentication success or failure status.
2. User profile information.
3. Active workout plan.
4. Recommended workouts and exercises.
5. Current workout for the active day.
6. Suggested weight increases when progressive overload is enabled.
7. Workout completion confirmation.
8. Completed plans and historical workout records.
9. Historical exercise performance data.

## 7. Business Rules
1. Every user must have one or more workout plans associated with their account, with at least one plan optionally designated as active.
2. Only one workout plan may be the active plan at a time for a given user, unless the product explicitly supports multiple active plans in a future requirement.
3. Recommended workouts must align with the user’s stated goals and active plan structure.
4. Progressive overload recommendations must be derived from the user’s own history.
5. A completed workout plan must be stored as historical data and must remain viewable after completion.
6. Plan modifications must remain under user control even when recommendations are present.
7. The current workout must be determined by the active plan’s schedule and the current day.
8. The application must move to the next week of the plan after the current week’s scheduled workouts are completed.
9. User data must remain isolated by account.

## 8. Acceptance Criteria

### 8.1 Account Creation and Sign-In
- Given a new user, when they create an account, then the account is created successfully and a profile is available.
- Given a registered user, when they sign in with valid credentials, then they gain access to their own workout data.
- Given invalid credentials, when a user attempts to sign in, then access is denied.

### 8.2 Profile Data
- Given a signed-in user, when they open their profile, then they can view their active workout plan, workout history, completed plans, and exercise history.
- Given one user, when they view their profile, then no data belonging to another user is visible.

### 8.3 Plan Creation and Editing
- Given a signed-in user, when they create a workout plan, then they can define goals, exercises, sets, reps, weights, and workout days.
- Given an active plan, when the user edits it, then the updated plan is saved and used going forward.
- Given an individual workout day, when the user modifies it, then the updated day is reflected in the active plan.
- Given a recommended plan or workout, when the user customizes it, then the user’s changes take precedence.

### 8.4 Progressive Overload
- Given a plan with progressive overload enabled, when historical performance exists, then the application recommends weight increases based on the user’s prior weights, exercises, and rep schemes.
- Given a plan with progressive overload disabled, when the user views the plan, then no overload-based weight recommendation is required.
- Given limited or missing history, when progressive overload is enabled, then the user can still proceed with the workout.

### 8.5 Scheduling and Current Workout
- Given an active plan, when the user opens the app on a given day, then the application displays the workout scheduled for that day.
- Given a new calendar day, when the user opens the app, then the application shows the workout corresponding to the new day based on the plan schedule.
- Given that a week of the plan has been completed, when the schedule advances, then the application moves to the next week of the plan.

### 8.6 Completion and History
- Given a workout in progress, when the user marks it as completed, then the completion is saved.
- Given a completed workout plan, when the user reviews history, then the completed plan is available in their profile.
- Given historical exercise data, when the user reviews past performance, then previous weights, reps, and other recorded workout details are visible.

### 8.7 Persistence and Security
- Given a signed-in user, when they sign out and sign back in, then their saved data remains available.
- Given two different users, when one signs in, then only that user’s own workout plans, history, and profile data are accessible.
- Given any private data, when an unauthenticated person attempts to access it, then access is blocked.

### 8.8 Mobile Usability
- Given a mobile device, when the user opens the app during a workout, then the current workout and completion actions are easy to find and use.
- Given the app interface, when viewed on mobile, then it remains clear and intuitive for workout use.

## 9. Non-Functional Requirements
1. The application must be suitable for mobile use.
2. The application must maintain user data persistence across sessions.
3. The application must support secure account-based access control.
4. The application must prioritize ease of use during active workouts.

## 10. Out of Scope
The following are not specified by this requirements document:
1. Specific technology stack.
2. Database design.
3. User interface visual design details.
4. Specific exercise library contents.
5. Integration with external devices or third-party services, unless added in a future requirement.
6. Social features, sharing, or community functionality.
