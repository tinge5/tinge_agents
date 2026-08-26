# Workouts2.0 Requirements

## 1. Purpose
Workouts2.0 shall be a mobile workout application that enables users to create accounts, sign in, manage personal workout plans, follow scheduled workouts, track exercise performance, and review workout history over time.

## 2. Users and Roles
### 2.1 End User
- A registered user who can create, view, modify, and complete their own workout plans.
- A user can view their own workout history, completed plans, exercise history, and profile information.

### 2.2 Guest User
- A visitor who has not signed in.
- A guest user may access only authentication-related functions and shall not access personal workout data.

## 3. Authentication and Account Management
### 3.1 Account Creation
The system shall allow a user to create an account.

### 3.2 Sign-In
The system shall allow a user to sign in to their account.

### 3.3 Session Continuity
The system shall preserve user data between sessions so that a signed-in user can return later and continue using their saved data.

### 3.4 Access Restriction
The system shall ensure that only an authenticated user can access that user’s workout plans, workout history, exercise history, completed plans, and profile data.

## 4. Profile Data
The system shall provide each user with a personal profile that stores and displays at least the following data:
- Active workout plan
- Workout history
- Completed plans
- Exercise history

## 5. Workout Plan Management
### 5.1 Plan Creation
The system shall allow a user to create workout plans tailored to the user’s individual goals.

### 5.2 Goal-Based Planning
The system shall allow a user to select workout goals when creating a plan.

### 5.3 Plan Editing
The system shall allow a user to modify their active workout plan at any time.

### 5.4 Workout Day Editing
The system shall allow a user to modify an individual workout day at any time.

### 5.5 Exercise and Set Configuration
The system shall allow a user to customize a plan by adding, removing, replacing, or modifying:
- Exercises
- Sets
- Reps
- Weights

### 5.6 Active Plan Storage
The system shall store the user’s active workout plan in the user’s profile.

## 6. Progressive Overload
### 6.1 User Choice
When creating a workout plan, the system shall allow the user to enable or disable progressive overload.

### 6.2 Recommendation Behavior
If progressive overload is enabled, the system shall recommend increases in weight based on the user’s previous weights, exercises, and rep schemes.

### 6.3 Historical Basis
The system shall use the user’s historical performance when determining future recommended weights.

### 6.4 Recommendation Constraints
The system shall not recommend a future weight increase unless the recommendation is derived from the user’s historical workout data for the relevant exercise and rep scheme.

## 7. Workout and Exercise Recommendations
### 7.1 Goal-Based Recommendations
The system shall provide recommended workouts and exercises based on the user’s selected goals and workout plan.

### 7.2 User Control Over Recommendations
The system shall allow the user to fully customize any recommended workout or exercise before using it in an active plan.

## 8. Scheduling and Current Workout Determination
### 8.1 Current Workout Identification
The system shall automatically determine the user’s current workout based on the current day and the schedule defined by the user’s active workout plan.

### 8.2 New Day Behavior
When a new day begins, the system shall automatically display the workout assigned to that day according to the active workout plan.

### 8.3 Weekly Advancement
The system shall correctly advance to the next week of the workout plan when the current week is completed.

### 8.4 Schedule Consistency
The system shall follow the schedule defined by the active workout plan when determining the current workout.

## 9. Completion Tracking
### 9.1 Workout Completion
The system shall allow the user to mark an individual workout as completed.

### 9.2 Plan Completion
When a user completes an entire workout plan, the system shall save that completed plan to the user’s profile as workout history.

### 9.3 Completion Record
The system shall preserve completed plans so that the user can view them later.

## 10. Historical Data
### 10.1 Workout History
The system shall allow users to view previous completed plans.

### 10.2 Exercise History
The system shall allow users to view historical exercise performance.

### 10.3 Performance Details
The system shall retain and display historical workout data including, at minimum:
- Previous weights
- Reps
- Other relevant workout data

### 10.4 History Visibility
The system shall show workout history and exercise history only for the signed-in user’s own account.

## 11. Data Ownership and Privacy
### 11.1 Per-User Data Isolation
The system shall ensure that each user can only access and modify their own workout plans, workout history, exercise history, completed plans, and profile information.

### 11.2 Unauthorized Access Prevention
The system shall prevent a user from viewing or editing another user’s workout data.

## 12. Mobile Usability
### 12.1 Mobile Interface
The system shall provide a clear and intuitive mobile interface.

### 12.2 Workout Simplicity
The system shall keep the workout experience simple and easy to use during an actual workout.

## 13. Inputs
The system shall accept, at minimum, the following user inputs:
- Account creation details
- Sign-in credentials
- Selected workout goals
- Workout plan name or identifier
- Workout schedule details
- Exercises
- Sets
- Reps
- Weights
- Progressive overload enablement choice
- Workout completion status
- Plan and day modifications

## 14. Outputs
The system shall provide, at minimum, the following outputs:
- Account creation confirmation
- Sign-in confirmation
- Active workout plan display
- Current workout display
- Recommended workouts and exercises
- Recommended weight changes when progressive overload is enabled
- Workout completion confirmation
- Completed plan history display
- Exercise history display
- Profile data display

## 15. Business Rules
### 15.1 Ownership Rule
Each user’s workout data shall belong only to that user.

### 15.2 Recommendation Rule
Workout and exercise recommendations shall be based on the user’s selected goals and plan.

### 15.3 Progressive Overload Rule
Progressive overload recommendations shall be based on the user’s own prior workout performance.

### 15.4 Schedule Rule
The active workout plan schedule shall determine which workout is shown on any given day.

### 15.5 Week Progression Rule
When the current week of the active plan is completed, the system shall advance to the next week of the plan.

### 15.6 Completion Rule
An entire plan that has been completed shall be recorded as completed plan history.

## 16. Acceptance Criteria
### 16.1 Account Creation and Sign-In
- Given a new user, when the user creates an account, then the system shall create a new user profile.
- Given a registered user, when the user signs in with valid credentials, then the system shall grant access to that user’s data.
- Given invalid sign-in credentials, when the user attempts to sign in, then the system shall deny access.

### 16.2 Profile Access
- Given a signed-in user, when the user opens the profile, then the system shall display the user’s active workout plan, workout history, completed plans, and exercise history.
- Given a guest user, when the user attempts to access profile data, then the system shall deny access.

### 16.3 Plan Creation and Editing
- Given a signed-in user, when the user creates a workout plan, then the system shall allow the user to define the plan based on the user’s goals.
- Given a signed-in user, when the user modifies an active plan or workout day, then the system shall save the changes to that user’s active plan.
- Given a signed-in user, when the user customizes exercises, sets, reps, or weights, then the system shall reflect the updated plan configuration.

### 16.4 Progressive Overload
- Given a plan with progressive overload enabled, when the system prepares future recommendations, then it shall base weight recommendations on the user’s historical performance.
- Given a plan with progressive overload disabled, when the system prepares workout recommendations, then it shall not apply progressive overload weight increases.

### 16.5 Recommendations
- Given a user-selected goal and active workout plan, when recommendations are generated, then the system shall provide workouts and exercises aligned with those inputs.
- Given a recommendation, when the user customizes it, then the system shall allow the user to change or replace it before use.

### 16.6 Current Workout and Scheduling
- Given an active workout plan with a defined schedule, when the current day matches a scheduled workout day, then the system shall display the workout assigned to that day.
- Given the start of a new day, when the user opens the app, then the system shall show the workout for the new day according to the active plan.
- Given completion of the final workout in the current week, when the next scheduled workout is requested, then the system shall advance to the next week of the plan.

### 16.7 Completion and History
- Given a user marks a workout as completed, then the system shall record the workout completion.
- Given a user completes an entire workout plan, then the system shall save that plan to workout history.
- Given a signed-in user, when the user views history, then the system shall display prior completed plans and exercise performance data.

### 16.8 Data Isolation and Persistence
- Given two different users, when one user signs in, then that user shall be able to access only their own workout data.
- Given a returning user, when the user signs in again later, then the user’s saved data shall still be available.

### 16.9 Mobile Usability
- Given a mobile device user, when the user interacts with the app during a workout, then the interface shall be clear and easy to use.

## 17. Scope Clarifications
- The system shall support workout planning, tracking, and history features described in this document.
- The system shall not expose one user’s data to another user.
- The system shall preserve historical workout data needed to support future recommendations and history review.
