# Workouts2.0 — Software Requirements

## 1. Purpose
Workouts2.0 is a mobile workout application that enables users to create and manage personalized workout plans, track workout execution over time, view historical performance, and receive workout recommendations based on goals and prior activity.

## 2. Users and Access
### 2.1 User Types
- **Authenticated user**: A registered user who can create, view, update, and complete their own workout plans and view their own workout history and profile.
- **Unauthenticated visitor**: A user who has not signed in and may only access account creation and sign-in functions.

### 2.2 Access Rules
- Each user must be able to access only their own account, profile, workout plans, workout history, completed plans, and exercise history.
- User data must persist between app sessions.
- The application must prevent cross-user access, modification, or viewing of private workout data.

## 3. Core Features
### 3.1 Account Management
- Users must be able to create an account.
- Users must be able to sign in to an existing account.
- Users must be able to sign out of their account.
- The application must associate all workout data with the signed-in user account.

### 3.2 User Profile
Each user profile must allow storage and viewing of:
- Active workout plan
- Workout history
- Completed plans
- Exercise history

### 3.3 Workout Plan Creation and Management
Users must be able to:
- Create workout plans tailored to individual goals.
- Select a workout goal when creating a plan.
- Enable or disable progressive overload for a plan.
- Add, remove, replace, and modify exercises in a workout plan.
- Add, remove, replace, and modify sets, reps, and weights for exercises.
- Modify the active workout plan at any time.
- Modify individual workout days at any time.
- Save changes to workout plans and have those changes reflected immediately in the user’s active plan.

### 3.4 Recommended Workouts and Exercises
- The application must provide recommended workouts and exercises based on the user’s selected goals and workout plan.
- Recommendations must be presented in a way that still allows the user to fully customize the plan.
- Recommendations must not prevent the user from changing exercises, sets, reps, or weights.

### 3.5 Progressive Overload
- When progressive overload is enabled for a workout plan, the application must recommend future weight increases based on the user’s historical performance.
- Recommendation logic must consider at minimum:
  - Previous weights used
  - Exercises performed
  - Rep schemes completed
- The application must use historical performance when determining recommended future weights.
- Users must be able to turn progressive overload on or off when creating a plan.
- If progressive overload is disabled, the system must not automatically recommend weight increases for that plan.

### 3.6 Workout Schedule and Current Workout Determination
- The application must automatically determine the user’s current workout based on the current day and the schedule defined by the active workout plan.
- When a new day begins, the application must display the workout appropriate for that day.
- When the current week of the plan is completed, the application must advance to the next week of the workout plan.
- The current workout shown to the user must always align with the plan schedule and the current date.

### 3.7 Workout Completion
- Users must be able to mark individual workouts as completed.
- When a user completes an entire workout plan, the completed plan must be saved to the user’s profile as workout history.
- Completed plans must remain viewable after completion.

### 3.8 Historical Data and Performance Review
Users must be able to view:
- Previous completed workout plans
- Historical exercise performance
- Previous weights used
- Previous reps completed
- Other relevant workout data associated with past workouts and plans

### 3.9 Mobile User Experience
- The application must provide a clear and intuitive mobile interface.
- The interface must support a simple workout experience suitable for use during an actual workout.
- The application must make it easy for users to quickly view the current workout, log completion, and review or edit workout details.

## 4. Functional Requirements
### 4.1 Authentication Requirements
- The system shall allow a user to register a new account.
- The system shall allow a user to sign in to an existing account.
- The system shall allow a signed-in user to sign out.
- The system shall maintain authenticated access state across sessions when appropriate.

### 4.2 Profile Requirements
- The system shall create and maintain a profile for each user account.
- The system shall store the user’s active workout plan in the profile.
- The system shall store workout history in the profile.
- The system shall store completed plans in the profile.
- The system shall store exercise history in the profile.
- The system shall display these profile sections to the authenticated user.

### 4.3 Workout Plan Requirements
- The system shall allow a user to create a workout plan.
- The system shall allow a user to define goals for the plan.
- The system shall allow a user to enable progressive overload for the plan.
- The system shall allow a user to disable progressive overload for the plan.
- The system shall allow a user to define workout days and schedule structure.
- The system shall allow a user to add exercises to workout days.
- The system shall allow a user to edit exercises, sets, reps, and weights.
- The system shall allow a user to remove exercises from a workout day.
- The system shall allow a user to replace exercises in a workout day.
- The system shall allow a user to modify the active workout plan at any time.
- The system shall allow a user to modify a specific workout day at any time.

### 4.4 Recommendation Requirements
- The system shall recommend workouts and exercises based on the user’s selected goals.
- The system shall recommend workouts and exercises based on the user’s workout plan.
- The system shall recommend future weights using historical performance when progressive overload is enabled.
- The system shall use prior weights, exercises, and rep schemes as part of its recommendation basis.

### 4.5 Schedule and Day Progression Requirements
- The system shall determine the current workout from the active workout plan and the current day.
- The system shall show the appropriate workout when a new day begins.
- The system shall advance to the next week of the workout plan when the current week is completed.
- The system shall reflect schedule progression automatically without requiring the user to manually advance the plan.

### 4.6 Completion and History Requirements
- The system shall allow a user to mark a workout as completed.
- The system shall record completion status for individual workouts.
- The system shall move a completed plan into workout history when the entire plan is finished.
- The system shall preserve completed plans for later viewing.
- The system shall preserve historical exercise performance data, including previous weights and reps.

### 4.7 Data Ownership and Privacy Requirements
- The system shall restrict each user’s workout data to that user only.
- The system shall prevent users from viewing or modifying another user’s workout plans.
- The system shall prevent users from viewing or modifying another user’s workout history or profile information.
- The system shall preserve user data between sessions.

## 5. Inputs
The application must accept the following user inputs:
- Account registration details
- Sign-in credentials
- Workout goal selection
- Plan name and plan details
- Choice to enable or disable progressive overload
- Exercise selection
- Exercise replacement selection
- Set, rep, and weight values
- Workout day schedule configuration
- Workout completion status updates
- Plan modification updates
- Profile and history viewing requests

## 6. Outputs
The application must provide the following outputs:
- Account creation confirmation or sign-in status
- Current user profile information
- Active workout plan details
- Recommended workouts and exercises
- Recommended weight adjustments when progressive overload is enabled
- Current workout based on the current date and plan schedule
- Workout completion confirmation
- Completed plan history
- Exercise history and performance history
- Validation or error messages when user input is invalid or unauthorized

## 7. Business Rules
- A user may only access data associated with their own account.
- A workout plan must belong to exactly one user.
- A user may have one active workout plan at a time unless the product defines otherwise.
- A completed workout plan must be saved to the user’s workout history.
- Progression recommendations for weight increases must be based on historical performance when progressive overload is enabled.
- Users must remain free to customize all workout plan elements even when recommendations are provided.
- The current workout must be determined by the active plan schedule and the current day.
- When the current week of a plan ends, the next week of the plan must become active automatically.
- A workout must be marked complete before it can be counted toward plan completion.
- A plan is considered complete only when all required workouts in the plan are completed.

## 8. Constraints
- The application must be mobile-first and usable during an active workout.
- The interface must remain simple and intuitive.
- The system must preserve data across sessions.
- The system must ensure user isolation and privacy for all profile and workout data.
- The system must support dynamic plan changes after creation.
- The system must support historical data review for prior workouts and completed plans.

## 9. Acceptance Criteria
### 9.1 Account Creation and Sign-In
- Given a new user, when they register with valid information, then an account is created successfully.
- Given an existing user, when they sign in with valid credentials, then they are authenticated successfully.
- Given an unauthenticated user, when they attempt to access private workout data, then access is denied.

### 9.2 Profile Visibility
- Given an authenticated user, when they open their profile, then they can view their active workout plan, workout history, completed plans, and exercise history.
- Given an authenticated user, when they view their profile after a new session, then their data is still available.

### 9.3 Workout Plan Creation and Editing
- Given an authenticated user, when they create a workout plan, then the plan is saved to their account.
- Given an authenticated user, when they enable progressive overload, then the plan is marked as using progressive overload.
- Given an authenticated user, when they add, remove, replace, or modify exercises, sets, reps, or weights, then the plan updates accordingly.
- Given an authenticated user, when they modify their active plan or a workout day, then the changes are reflected in the current plan.

### 9.4 Recommendations
- Given a user with a defined goal and workout plan, when recommendations are requested, then the system provides relevant workouts and exercises.
- Given a plan with progressive overload enabled, when historical performance exists, then the system recommends future weights informed by that history.
- Given a plan with progressive overload disabled, when the user views the plan, then no automatic weight progression recommendation is applied.

### 9.5 Schedule Behavior
- Given an active workout plan, when the current day changes, then the app displays the workout assigned to the new day.
- Given a plan where the current week is completed, when the schedule progresses, then the next week becomes active automatically.
- Given a user opening the app at any time, when the active plan exists, then the app shows the correct current workout for that day.

### 9.6 Completion and History
- Given a user finishing a workout, when they mark it completed, then the completion is saved.
- Given a user completing all required workouts in a plan, when the plan is finished, then it is moved into completed plans/history.
- Given an authenticated user, when they view a completed plan, then the plan remains available for review.
- Given an authenticated user, when they view exercise history, then previous weights, reps, and relevant performance data are shown.

### 9.7 Data Privacy
- Given two different users, when one user signs in, then they cannot access the other user’s plan or history.
- Given a user modifies their own plan, when the update is saved, then only their data changes.

## 10. Out of Scope
The following are not defined by these requirements:
- Social features such as sharing, following, or community feeds
- Trainer/admin management tools
- Nutrition tracking
- Payment/subscription processing
- Wearable device integration
- Detailed algorithmic implementation for recommendation scoring
- Specific visual design system or branding rules
- Specific data storage technology or architecture
