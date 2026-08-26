# Workouts2.0 — Software Requirements Specification

## 1. Overview
Workouts2.0 is a mobile workout application that allows users to create and manage personalized workout plans, track workout completion and exercise history, and view historical performance over time. The application must support account creation and sign-in, preserve user data between sessions, and ensure that each user can only access their own workout-related data.

The application must provide a simple, clear, and intuitive mobile experience that is suitable for use during an active workout.

## 2. Users and Roles
### 2.1 End User
A registered individual who can:
- Create an account
- Sign in and sign out
- Create, view, modify, and complete workout plans
- View workout history, completed plans, and exercise history
- View recommended workouts and exercise recommendations based on goals and plan settings

### 2.2 Guest / Unauthenticated Visitor
A visitor who has not signed in. A guest must not be able to access any personal workout plans, history, or profile data.

## 3. Core Product Features
### 3.1 Account Creation and Authentication
The application must allow a user to create an account and sign in to access their personal data.

### 3.2 User Profile
Each user must have a profile that stores and displays:
- Active workout plan
- Workout history
- Completed plans
- Exercise history

### 3.3 Workout Plan Creation and Management
The application must allow users to create workout plans tailored to their personal goals.

### 3.4 Progressive Overload Support
When creating or editing a workout plan, the user must be able to enable or disable progressive overload.

### 3.5 Recommended Workouts and Exercises
The application must recommend workouts and exercises based on the user’s selected goals and workout plan.

### 3.6 Workout Customization
Users must have full control to customize their plans, including modifying exercises, sets, reps, and weights.

### 3.7 Workout Scheduling and Daily Progression
The application must determine the current workout based on the current day and the active workout plan’s schedule.

### 3.8 Workout Completion Tracking
Users must be able to mark individual workouts as completed.

### 3.9 Plan Completion and History
When a user completes an entire workout plan, it must be saved to the user’s profile as workout history.

### 3.10 Data Persistence and Isolation
User data must persist between sessions, and each user must only access and modify their own data.

## 4. Functional Requirements

### 4.1 Account Creation
1. The application must allow a new user to create an account.
2. The application must require sign-in before a user can access personal workout data.
3. The application must associate all workout plans, workout history, completed plans, and exercise history with the signed-in user account.

### 4.2 Sign-In and Sign-Out
1. The application must allow a registered user to sign in.
2. The application must allow a signed-in user to sign out.
3. After sign-out, the application must not display the user’s private workout data unless the user signs in again.

### 4.3 Profile Data
1. The application must provide a profile for each user.
2. The profile must display the user’s active workout plan.
3. The profile must display completed plans.
4. The profile must display workout history.
5. The profile must display exercise history.

### 4.4 Workout Plan Creation
1. The application must allow a user to create a workout plan.
2. The user must be able to define the plan based on their individual goals.
3. The user must be able to specify a workout schedule for the plan.
4. The user must be able to add exercises to a plan.
5. The user must be able to define sets, reps, and weights for exercises in a plan.
6. The user must be able to designate one workout plan as active.

### 4.5 Workout Plan Customization
1. The user must be able to modify an active workout plan at any time.
2. The user must be able to modify an individual workout day at any time.
3. The user must be able to add exercises to a plan or workout day.
4. The user must be able to remove exercises from a plan or workout day.
5. The user must be able to replace exercises in a plan or workout day.
6. The user must be able to modify sets, reps, and weights for any exercise in a plan.

### 4.6 Progressive Overload
1. When creating or editing a workout plan, the user must be able to enable progressive overload.
2. When progressive overload is enabled, the application must recommend increased weights for future workouts.
3. The recommended weight must be based on the user’s previous weights, exercises, and rep schemes.
4. The application must use the user’s historical performance when determining future recommended weights.
5. The user must be able to accept, ignore, or override the recommended weight.
6. If progressive overload is disabled, the application must not automatically recommend increasing weights based on progressive overload logic.

### 4.7 Recommended Workouts and Exercises
1. The application must provide recommended workouts based on the user’s selected goals and workout plan.
2. The application must provide recommended exercises based on the user’s selected goals and workout plan.
3. Recommendations must be visible to the user before or during workout plan creation and editing.
4. The user must be able to ignore recommendations and customize the plan manually.

### 4.8 Workout Scheduling and Current Workout Determination
1. The application must determine the current workout based on the current day and the active workout plan’s schedule.
2. When a new day begins, the application must display the workout associated with that day for the active plan.
3. The application must advance to the next week of the workout plan when the current week is completed.
4. The application must continue to show the correct workout for the active day and week until the schedule changes or the plan is completed.

### 4.9 Workout Completion
1. The user must be able to mark an individual workout as completed.
2. A completed workout must be recorded in the user’s workout history.
3. Completion status must be visible for workouts that have been completed.

### 4.10 Plan Completion
1. When a user completes all workouts in a workout plan, the plan must be marked as completed.
2. The completed plan must be saved to the user’s profile as workout history.
3. The active workout plan must no longer be treated as active after the plan is fully completed, unless the user explicitly starts or activates it again.

### 4.11 Exercise History
1. The application must store historical exercise performance for each user.
2. Exercise history must include previous weights.
3. Exercise history must include previous reps.
4. Exercise history must include other relevant workout data associated with completed exercises and workouts.
5. The user must be able to view exercise history for past workouts and completed plans.

### 4.12 Data Persistence
1. The application must preserve user data between sessions.
2. Data available before a user signs out must remain available after the user signs back in.
3. Completed plans, workout history, and exercise history must remain accessible to the user unless deleted by a supported user action.

### 4.13 Access Control and Data Isolation
1. A user must only be able to view their own profile, plans, workout history, completed plans, and exercise history.
2. A user must only be able to modify their own workout plans and workout data.
3. No user must be able to view or modify another user’s workout data.
4. The application must not expose private workout data to unauthenticated visitors.

## 5. Inputs
### 5.1 Account Inputs
- Account creation details required by the application
- Sign-in credentials required by the application

### 5.2 Profile and Goal Inputs
- User-selected workout goals
- User preferences relevant to workout planning

### 5.3 Workout Plan Inputs
- Plan name or identifier
- Training goal for the plan
- Workout schedule
- Exercises included in each workout/day
- Sets, reps, and weights for each exercise
- Progressive overload setting
- Manual modifications to any workout day or exercise

### 5.4 Workout Completion Inputs
- User action to mark a workout as completed
- User confirmation or adjustment of workout performance data, if supported

## 6. Outputs
### 6.1 Profile Outputs
- Active workout plan
- Workout history
- Completed plans
- Exercise history

### 6.2 Workout Outputs
- Current workout for the active day
- Recommended workouts
- Recommended exercises
- Recommended weights when progressive overload is enabled
- Completion status for workouts and plans

### 6.3 Historical Outputs
- Previous plans completed by the user
- Historical exercise performance including previous weights and reps
- Workout history across prior sessions

## 7. Business Rules
1. Each user account must have its own isolated workout data set.
2. A workout plan may be active or completed.
3. Only one active workout plan must be associated with a user at a time unless the product explicitly supports multiple active plans; if multiple active plans are supported, the application must clearly identify the current active plan used for daily workout display.
4. The current workout must be determined by the active plan’s schedule and the current day.
5. At the start of a new day, the application must show the workout assigned to that day.
6. At the end of a completed week, the application must move to the next week in the plan.
7. If progressive overload is enabled, the application must base future weight recommendations on prior user performance.
8. Users must always be able to manually override recommendations by editing the plan.
9. Completing all workouts in a plan must move that plan into completed history.
10. Historical workout and exercise records must remain available after a plan is completed.

## 8. Constraints and Non-Functional Requirements
1. The application must be suitable for use on mobile devices.
2. The user interface must be clear and intuitive.
3. The workout experience must remain simple and easy to use during an actual workout.
4. The application must preserve data between sessions.
5. The application must protect each user’s private data from access by other users.

## 9. Data Persistence Requirements
1. The application must retain user account data across sessions.
2. The application must retain active plans, completed plans, workout history, and exercise history across sessions.
3. The application must retain the state of each workout plan, including completion progress and schedule position.
4. The application must retain historical performance data needed to support workout recommendations and progressive overload.

## 10. Security and Access Control Requirements
1. Users must authenticate before accessing personal workout data.
2. The application must enforce per-user access control for all personal workout and profile data.
3. A user must not be able to access another user’s account, plans, or histories.
4. The application must not display private user data to unauthenticated visitors.

## 11. Acceptance Criteria
### 11.1 Account Access
- Given a new visitor, when they create an account, then they can sign in and access a personal profile.
- Given a registered user, when they sign in, then they can access only their own workout data.
- Given a signed-in user, when they sign out, then their private workout data is no longer accessible without sign-in.

### 11.2 Profile Visibility
- Given a signed-in user, when they open their profile, then they can see their active workout plan.
- Given a signed-in user, when they open their profile, then they can see workout history, completed plans, and exercise history.

### 11.3 Plan Creation and Customization
- Given a signed-in user, when they create a workout plan, then they can define it based on personal goals.
- Given a signed-in user, when they edit a workout plan, then they can add, remove, replace, or modify exercises, sets, reps, and weights.
- Given a signed-in user, when they modify an active plan or workout day, then the updated plan is reflected in the current workout display.

### 11.4 Progressive Overload
- Given a plan with progressive overload enabled, when the user has prior workout performance data, then the application recommends future weight increases based on that history.
- Given a plan with progressive overload disabled, when the user views the plan, then the application does not apply progressive overload recommendations.

### 11.5 Recommendations
- Given a signed-in user with goals and a workout plan, when the application displays plan guidance, then it provides recommended workouts and exercises relevant to those goals and plan.
- Given a recommendation, when the user customizes the plan, then the user can override the recommendation.

### 11.6 Scheduling and Daily Display
- Given an active workout plan with a defined schedule, when the current day matches a scheduled workout day, then the application displays the correct workout for that day.
- Given a new day, when the application is opened, then it displays the workout assigned to the current day.
- Given a completed week in the active plan, when the next scheduled workout period begins, then the application advances to the next week of the plan.

### 11.7 Completion Tracking
- Given a workout in progress, when the user marks it as completed, then the completion is saved in workout history.
- Given all workouts in a plan are completed, when the final workout is marked complete, then the plan is saved as completed history.

### 11.8 History and Persistence
- Given a completed workout plan, when the user views historical data later, then the completed plan remains available in their profile.
- Given prior completed workouts, when the user views exercise history, then previous weights, reps, and other relevant workout data are available.
- Given a user signs out and signs back in, when they return to the app, then their prior workout data is still available.

### 11.9 Data Isolation
- Given two different users, when one user signs in, then they can view only their own plans and histories.
- Given one signed-in user, when they attempt to access another user’s data, then access is denied.

## 12. Out of Scope
The following are not defined by this requirements specification:
- Nutrition tracking
- Social sharing
- Coaching or messaging features
- Payment or subscription handling
- Wearable device integrations
- External analytics or reporting beyond the user’s own history
