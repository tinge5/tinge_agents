# Workouts2.0 Requirements

## 1. Purpose
Workouts2.0 is a mobile workout application that enables users to create and manage personalized workout plans, track workout performance over time, and view workout history in a simple, mobile-friendly experience.

## 2. Users and Access

### 2.1 User Roles
- **Authenticated User**: A person who can create, view, modify, and complete their own workout plans and view their own history.
- **Unauthenticated Visitor**: A person who has not signed in and may only access authentication-related screens.

### 2.2 Access Control
- Each user shall only be able to access and modify their own account, profile, workout plans, completed plans, workout history, and exercise history.
- No user shall be able to view or edit another user’s private workout data.

## 3. Core Features

### 3.1 Account Creation and Sign-In
- Users shall be able to create an account.
- Users shall be able to sign in to their account.
- Users shall be able to sign out of their account.
- The application shall preserve user-specific data between sessions.

### 3.2 User Profile
- Each user shall have a profile.
- The profile shall store and display:
  - Active workout plan
  - Workout history
  - Completed plans
  - Exercise history
- The user shall be able to view their historical exercise performance from the profile.

### 3.3 Workout Plan Creation and Management
- Users shall be able to create workout plans tailored to their individual goals.
- When creating a workout plan, users shall be able to specify workout goals.
- When creating a workout plan, users shall be able to enable or disable progressive overload.
- Users shall be able to customize workout plans by adding, removing, replacing, and modifying:
  - Exercises
  - Sets
  - Reps
  - Weights
- Users shall be able to modify their active workout plan at any time.
- Users shall be able to modify individual workout days at any time.
- Users shall be able to save a workout plan and make it their active workout plan.

### 3.4 Recommended Workouts and Exercises
- The application shall provide recommended workouts and exercises based on the user’s selected goals and workout plan.
- Recommendations shall be presented in a way that users can accept, customize, or replace.
- Users shall retain full control over all plan content and shall not be forced to use recommendations.

### 3.5 Progressive Overload Recommendations
- If progressive overload is enabled for a workout plan, the application shall automatically recommend future weight increases based on the user’s historical performance.
- Recommendation logic shall use the user’s previous weights, exercises, and rep schemes as part of the historical performance considered.
- Progressive overload recommendations shall be applied only to the user’s own historical data.
- The user shall be able to override any recommended weight before saving or completing a workout.

### 3.6 Current Workout Determination
- The application shall automatically determine the user’s current workout based on:
  - The current day
  - The schedule defined by the user’s active workout plan
- When a new day begins, the application shall display the workout assigned to that day according to the active plan.
- When the current week of the workout plan is completed, the application shall advance to the next week of the plan.
- If the active plan has no workout scheduled for the current day, the application shall clearly indicate that there is no workout scheduled.

### 3.7 Workout Completion Tracking
- Users shall be able to mark individual workouts as completed.
- The application shall record completed workouts in the user’s workout history.
- When a user completes an entire workout plan, the completed plan shall be saved to the user’s profile as workout history.
- Users shall be able to view completed plans at any time.

### 3.8 Exercise and Performance History
- The application shall store exercise history for the user.
- Exercise history shall include previous performance data such as:
  - Exercise name
  - Weight used
  - Reps completed
  - Set information
  - Other relevant workout data associated with completed workouts
- Users shall be able to view previous weights, reps, and other relevant workout performance data.

### 3.9 Mobile Experience
- The application shall provide a clear and intuitive mobile interface.
- The interface shall support a simple workout experience suitable for use during an actual workout.
- The interface shall minimize unnecessary complexity while the user is actively exercising.

## 4. Functional Requirements

### 4.1 Authentication
- The application shall require authentication for access to user-specific workout data.
- The application shall allow an authenticated user to remain associated with their account across sessions unless they sign out.

### 4.2 Data Persistence
- The application shall persist user account information, profile data, workout plans, completed plans, workout history, and exercise history between sessions.
- The application shall restore previously saved user data when the user signs back in.

### 4.3 Plan Data Structure Requirements
Each workout plan shall support storing, at minimum:
- Plan name
- Goal or goal category
- Active/inactive status
- Schedule by day and week
- Exercises within each workout day
- Sets, reps, and weights for each exercise
- Progressive overload enabled/disabled state
- Completion status

### 4.4 Workout Data Updates
- The application shall allow users to update workout plan content before, during, and after a workout.
- The application shall record changes to workout performance so that historical data remains available for future recommendations and review.

### 4.5 History and Reporting
- The application shall allow the user to view:
  - Active plan details
  - Past completed plans
  - Workout completion history
  - Exercise performance history
- Historical data shall remain associated with the correct user account.

## 5. Business Rules
- A user shall only have one active workout plan at a time unless the product defines otherwise in future requirements.
- The current workout displayed to the user shall always correspond to the current day and the active plan’s schedule.
- Progressive overload recommendations shall be based on the user’s own historical data only.
- Recommendations shall not remove the user’s ability to manually edit a plan.
- Completing all workouts in a plan shall mark the plan as completed and move it to the user’s history.
- Completed plans shall remain viewable after completion.
- Workout and exercise history shall not be deleted when a plan is completed.

## 6. Inputs
The application shall accept the following user and system inputs:
- Account registration details
- Sign-in credentials
- Workout goal selection
- Workout plan details
- Schedule selection by day/week
- Exercise selections
- Set, rep, and weight values
- Progressive overload enable/disable choice
- Manual edits to plans and workout days
- Completion status for individual workouts
- Workout performance entries completed during training
- Date and time information used to determine the current workout

## 7. Outputs
The application shall present the following outputs to the user:
- Account creation and sign-in results
- Profile view with active plan and history
- Recommended workouts and exercises
- Active workout for the current day
- Workout plan details and editable workout days
- Progressive overload weight recommendations
- Workout completion confirmation
- Completed plan history
- Exercise history and historical performance views
- Notifications or clear status indicators when there is no workout scheduled for a day

## 8. Data Requirements
- Each user record shall be uniquely identified.
- Each workout plan shall be associated with exactly one user.
- Each completed plan shall remain linked to the user who completed it.
- Each exercise history record shall be linked to the relevant user and workout activity.
- Stored performance data shall include enough information to support future recommended weights and historical review.

## 9. Non-Functional Requirements
- The application shall be usable on mobile devices.
- The application shall provide a simple, intuitive interface optimized for workout use.
- The application shall preserve data across sessions.
- The application shall enforce per-user data isolation and privacy.
- The application shall present workout information quickly enough to be practical during live workouts.

## 10. Acceptance Criteria

### 10.1 Account and Access
- Given a new user, when they create an account, then they can sign in successfully.
- Given a signed-in user, when they sign out and return later, then their data remains stored and accessible after sign-in.
- Given one user account, when another user signs in, then they cannot access the first user’s plans or history.

### 10.2 Profile and History
- Given a signed-in user, when they open their profile, then they can see their active workout plan, workout history, completed plans, and exercise history.
- Given a completed workout or plan, when the user views their history, then the completed item appears there.
- Given prior workout performance exists, when the user views exercise history, then previous weights, reps, and other relevant performance data are visible.

### 10.3 Plan Creation and Editing
- Given a user creating a plan, when they specify goals and workout structure, then the plan can be saved.
- Given a plan exists, when the user enables progressive overload, then the system can recommend increased weights based on prior performance.
- Given any workout plan or workout day, when the user edits exercises, sets, reps, or weights, then those changes are saved and reflected in the plan.

### 10.4 Recommendations and Progressive Overload
- Given a plan with recommendations available, when the user reviews the plan, then recommended workouts or exercises are shown.
- Given progressive overload is enabled and prior performance exists, when future weights are recommended, then the recommendation reflects historical weights, exercises, and rep schemes.
- Given a recommendation is shown, when the user changes it manually, then the user’s selection is preserved.

### 10.5 Current Workout and Scheduling
- Given a user has an active plan, when the current day matches a scheduled workout, then the correct workout for that day is displayed automatically.
- Given a new day begins, when the user opens the app, then the workout for that day is displayed according to the active plan.
- Given the current week of a plan is finished, when the schedule advances, then the next week of the plan becomes active.
- Given no workout is scheduled for the current day, when the user opens the app, then the app clearly indicates that no workout is scheduled.

### 10.6 Completion Tracking
- Given a user finishes a workout, when they mark it as completed, then the workout is saved to history.
- Given a user finishes all workouts in a plan, when the final workout is completed, then the full plan is saved as completed in the profile.
- Given a plan is completed, when the user views history later, then the completed plan remains available.

## 11. Out of Scope / Not Specified
The following items are not specified by the request and shall not be assumed without additional requirements:
- Social sharing features
- Public community features
- Nutrition tracking
- Wearable device integration
- Subscription or payment features
- Coach or trainer multi-user management features
- Platform-specific implementation details
