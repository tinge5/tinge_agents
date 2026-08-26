# Workouts2.0 Software Requirements Specification

## 1. Purpose
Workouts2.0 is a mobile workout application that allows users to create, customize, track, and review workout plans and workout performance over time.

## 2. Scope
The application must support account creation, sign-in, personal profiles, workout plan creation and management, workout scheduling, workout completion tracking, progressive overload recommendations, workout history, exercise history, and secure per-user data access.

## 3. User Roles
### 3.1 Guest
A person who has not signed in.

### 3.2 Authenticated User
A signed-in user who can create, view, modify, and complete workout plans and view their own profile and history.

## 4. Core User Needs
- Create an account and sign in.
- View a personal profile containing active workout plan information, workout history, completed plans, and exercise history.
- Create workout plans tailored to individual goals.
- Optionally enable progressive overload for a plan.
- Receive workout and exercise recommendations aligned to goals and active plans.
- Fully customize workout plans and workout days.
- View the correct workout for the current day.
- Mark workouts as completed.
- Preserve progress and history across sessions.
- Ensure only the account owner can access and modify their own data.

## 5. Functional Requirements

### 5.1 Account Creation and Sign-In
FR-1. The application must allow a guest to create a user account.

FR-2. The application must allow a user to sign in to a existing account.

FR-3. The application must prevent a signed-in user from accessing another user's profile, workout plans, workout history, completed plans, or exercise history.

Acceptance Criteria:
- A new user can create an account successfully.
- An existing user can sign in successfully.
- A signed-in user can view and modify only their own data.
- Attempting to access another user's data is denied.

### 5.2 User Profile
FR-4. The application must provide each authenticated user with a personal profile.

FR-5. The profile must display the user's active workout plan.

FR-6. The profile must display workout history.

FR-7. The profile must display completed workout plans.

FR-8. The profile must display exercise history.

Acceptance Criteria:
- The profile shows the currently active plan when one exists.
- The profile shows previously completed plans.
- The profile shows historical workout and exercise records.

### 5.3 Workout Plan Creation
FR-9. The application must allow a user to create a workout plan.

FR-10. The plan creation flow must allow the user to define a plan based on individual goals.

FR-11. The plan creation flow must allow the user to enable or disable progressive overload.

FR-12. When progressive overload is enabled, the application must store that choice as part of the plan.

FR-13. The application must provide recommended workouts and exercises based on the user's selected goals and workout plan.

Acceptance Criteria:
- A user can create a plan with goal-based structure.
- A user can choose whether progressive overload is enabled.
- The created plan is associated with the user who created it.
- The system provides recommendations relevant to the selected goals and plan.

### 5.4 Workout Plan Customization
FR-14. The application must allow a user to customize a workout plan.

FR-15. The user must be able to add exercises to a plan or workout day.

FR-16. The user must be able to remove exercises from a plan or workout day.

FR-17. The user must be able to replace exercises in a plan or workout day.

FR-18. The user must be able to modify exercises, sets, reps, and weights in a plan or workout day.

FR-19. The user must be able to modify their active workout plan at any time.

FR-20. The user must be able to modify individual workout days at any time.

Acceptance Criteria:
- A user can add, remove, replace, and edit exercises in a plan.
- A user can edit sets, reps, and weights for a workout day.
- Changes are reflected in the active plan after saving.

### 5.5 Workout Scheduling and Current Workout Selection
FR-21. The application must determine the user's current workout from the active workout plan based on the current day.

FR-22. When a new day begins, the application must automatically display the workout scheduled for that day.

FR-23. The application must advance to the next week of the workout plan when the current week is completed.

FR-24. The application must show the correct workout for the current schedule state of the active plan.

Acceptance Criteria:
- The workout displayed for a given date matches the active plan's schedule.
- At the start of a new day, the day-appropriate workout is shown automatically.
- After all workouts in the current week are completed according to the plan schedule, the next week is made current.

### 5.6 Workout Completion Tracking
FR-25. The application must allow a user to mark an individual workout as completed.

FR-26. Completed workouts must be recorded in the user's workout history.

FR-27. The application must capture relevant workout performance data for completed workouts, including weights and reps when available.

Acceptance Criteria:
- A user can mark a workout as completed.
- The completed workout appears in workout history.
- Relevant performance data is retained with the completed workout.

### 5.7 Progressive Overload Recommendations
FR-28. If progressive overload is enabled for a plan, the application must recommend increases in weight using the user's historical performance.

FR-29. Progressive overload recommendations must consider the user's previous weights for the same or related exercises.

FR-30. Progressive overload recommendations must consider the user's previous rep schemes.

FR-31. Progressive overload recommendations must consider the user's exercise history.

FR-32. Progressive overload recommendations must use historical performance when determining future recommended weights.

FR-33. If progressive overload is disabled, the application must not automatically apply overload-based weight increases to the plan.

Acceptance Criteria:
- For a plan with progressive overload enabled, the system recommends a future weight based on prior performance data.
- The recommendation reflects historical weights, exercises, and rep schemes.
- For a plan with progressive overload disabled, weight changes are not automatically recommended by the overload feature.

### 5.8 Workout Plan Completion and History Retention
FR-34. The application must detect when a user completes an entire workout plan.

FR-35. When a workout plan is completed, the application must save the completed plan to the user's profile as workout history.

FR-36. The application must preserve completed plans so the user can view them later.

FR-37. The application must preserve historical exercise performance data so the user can view prior weights, reps, and other relevant workout data.

Acceptance Criteria:
- Completing all workouts in a plan results in the plan being stored as completed.
- The completed plan remains visible in the user's profile after completion.
- Historical exercise performance is available for later review.

### 5.9 Recommendations and Guidance
FR-38. The application must provide recommended workouts and exercises based on the user's selected goals and active workout plan.

FR-39. The user must be able to accept recommendations as-is or customize them.

FR-40. Recommendations must never remove the user's ability to fully control their plan contents.

Acceptance Criteria:
- The application offers recommendations aligned to the user's selected goals.
- The user can keep, modify, or replace recommendations.
- The user's custom choices override recommendations.

## 6. Data Objects
### 6.1 User Account
A user account must contain at minimum an identity required for sign-in and a link to the user's profile data.

### 6.2 Profile
A profile must contain the user's active workout plan, workout history, completed plans, and exercise history.

### 6.3 Workout Plan
A workout plan must contain:
- An owner user.
- The user's selected goal(s).
- Active/inactive status.
- A schedule of workout days.
- Exercises assigned to each workout day.
- Sets, reps, and weights for each exercise.
- Progressive overload setting.
- Completion status.

### 6.4 Workout Day
A workout day must contain the day within the plan schedule and the exercises assigned to that day.

### 6.5 Exercise History Record
An exercise history record must contain prior exercise performance data, including weights, reps, and related workout details.

### 6.6 Workout History Record
A workout history record must contain completed workout details and performance data.

### 6.7 Completed Plan Record
A completed plan record must contain the completed workout plan and its historical performance data.

## 7. Inputs
- Account creation information.
- Sign-in credentials.
- User-selected goals.
- Workout plan structure details.
- Exercise selection and exercise changes.
- Sets, reps, and weights.
- Progressive overload enabled or disabled.
- Completion actions for workouts and plans.
- User edits to active plans and workout days.

## 8. Outputs
- Account creation confirmation.
- Sign-in confirmation.
- User profile display.
- Active workout plan display.
- Recommended workouts and exercises.
- Current day's workout.
- Workout completion confirmation.
- Updated workout history.
- Completed plans list.
- Historical exercise performance views.
- Weight recommendations when progressive overload is enabled.

## 9. Business Rules
BR-1. Each user may access only their own profile, workout plans, workout history, completed plans, and exercise history.

BR-2. A user's active workout plan must be the plan currently used to determine the day's workout.

BR-3. The current workout must be determined from the active plan and the current day.

BR-4. When the date changes to a new day, the application must present the workout for that day according to the active plan.

BR-5. When the current week of a plan is finished, the application must advance to the next week of the plan.

BR-6. Completing an individual workout must record that workout in workout history.

BR-7. Completing an entire plan must move that plan into completed plan history.

BR-8. Progressive overload weight recommendations must use prior user performance data.

BR-9. Progressive overload recommendations must be based on historical weights, exercises, and rep schemes relevant to the exercise being planned.

BR-10. Users must be able to customize any recommended plan element before saving it.

BR-11. The application must preserve completed plans and exercise history for later viewing.

## 10. Non-Functional Requirements
### 10.1 Persistence
NFR-1. User account data, profiles, active plans, workout history, completed plans, and exercise history must persist between sessions.

### 10.2 Security and Authorization
NFR-2. The application must restrict each user to their own data.

NFR-3. The application must prevent unauthorized access to another user's workout information.

### 10.3 Usability
NFR-4. The application must provide a clear and intuitive mobile interface.

NFR-5. The application must keep the workout experience simple and easy to use during an actual workout.

### 10.4 Data Integrity
NFR-6. Historical workout data must remain available after a workout plan is completed.

NFR-7. Previously completed plans must remain viewable unless the user deletes their account or otherwise removes their own data, if such a feature exists.

## 11. Acceptance Criteria by Major Workflow
### 11.1 Account Workflow
- A guest can create an account.
- A user can sign in.
- A user can remain signed in across app usage until they sign out or the session expires.

### 11.2 Plan Creation Workflow
- A user can create a goal-based workout plan.
- A user can enable or disable progressive overload.
- The created plan becomes the active plan when the user selects it as active.

### 11.3 Plan Management Workflow
- A user can edit the active plan at any time.
- A user can edit individual workout days at any time.
- A user can add, remove, replace, or modify exercises, sets, reps, and weights.

### 11.4 Workout Tracking Workflow
- The app shows the current workout for the current day.
- The user can mark the workout completed.
- The completed workout is stored in history.

### 11.5 History Workflow
- The user can view completed plans.
- The user can view prior workout performance.
- The user can view prior exercise weights and reps.

### 11.6 Progressive Overload Workflow
- When enabled, the app recommends weight increases based on historical performance.
- When disabled, the app does not auto-recommend overload-based increases.

## 12. Requirements Preservation and Change Summary
### 12.1 Existing Functionality to Preserve
- None identified from available project context.

### 12.2 Existing Functionality to Modify
- None identified from available project context.

### 12.3 New Functionality Required
- All functionality described in this document is required as new product behavior unless already present in the implementation.
