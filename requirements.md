# Workouts2.0 Requirements

## 1. Purpose
Workouts2.0 shall be a mobile workout application that allows users to create, manage, follow, and review workout plans and workout history. The application shall support user accounts, personalized workout plans, workout recommendations, historical performance tracking, and plan progression based on prior performance.

## 2. Users and Access
### 2.1 User Roles
- **Authenticated User**: A person who can create an account, sign in, create and manage their own workout plans, and view their own workout history and profile data.
- **Guest User**: A person who has not signed in and may only access account creation and sign-in screens.

### 2.2 Access Rules
- Each user shall only be able to access, view, create, modify, or delete their own profile, workout plans, workout history, completed plans, and exercise history.
- User data shall not be visible to other users.
- The application shall preserve user-specific data between sessions.

## 3. Core Features
The application shall provide the following core features:
1. Account creation and sign-in.
2. User profile with active workout plan, workout history, completed plans, and exercise history.
3. Creation and management of workout plans tailored to user goals.
4. Optional progressive overload recommendations based on historical performance.
5. Workout and exercise recommendations based on user goals and active plan.
6. Full user control to customize workout plans and individual workout days.
7. Automatic determination of the current workout based on day and plan schedule.
8. Workout completion tracking at the workout level.
9. Automatic week progression when a plan’s week is completed.
10. Automatic saving of completed plans to workout history.
11. Viewing of prior plans and historical exercise performance.
12. Simple, intuitive mobile workout interface.
13. Persistent storage of user data across sessions.

## 4. Functional Requirements

### 4.1 Account Creation and Authentication
- The application shall allow a user to create an account.
- The application shall allow a user to sign in to an existing account.
- The application shall authenticate users before granting access to personal workout data.
- The application shall allow a signed-in user to sign out.

### 4.2 User Profile
- The application shall provide a profile for each authenticated user.
- The profile shall display the user’s active workout plan.
- The profile shall display workout history.
- The profile shall display completed workout plans.
- The profile shall display exercise history.
- The user shall be able to view historical workout and exercise performance from the profile.

### 4.3 Workout Plan Creation and Management
- The application shall allow users to create workout plans.
- A workout plan shall be associated with a user.
- The application shall allow users to define workout plans based on their individual goals.
- The application shall allow users to specify a schedule for a workout plan.
- The application shall allow users to create, edit, and save individual workout days within a plan.
- The user shall be able to modify their active workout plan at any time.
- The user shall be able to modify an individual workout day at any time.

### 4.4 Workout and Exercise Customization
- The application shall allow users to customize a plan by adding exercises.
- The application shall allow users to remove exercises from a plan.
- The application shall allow users to replace exercises in a plan.
- The application shall allow users to modify exercises in a plan.
- The application shall allow users to modify sets, reps, and weights for exercises.
- The application shall preserve user changes to custom workout plans.

### 4.5 Goal-Based Recommendations
- The application shall provide recommended workouts based on the user’s selected goals.
- The application shall provide recommended exercises based on the user’s selected goals and workout plan.
- Recommendations shall be presented as suggestions that the user may accept, reject, or customize.
- The user shall retain full control over the final content of their workout plan.

### 4.6 Progressive Overload
- The application shall allow users to enable progressive overload when creating a workout plan.
- The application shall allow users to disable progressive overload when creating a workout plan.
- When progressive overload is enabled, the application shall recommend increases in weight based on the user’s prior workout performance.
- Recommendations for progressive overload shall use the user’s historical performance data, including prior weights, exercises, and rep schemes.
- The application shall use previous performance to determine future recommended weights for relevant exercises.
- If progressive overload is disabled, the application shall not automatically recommend weight increases for the plan.

### 4.7 Active Workout Determination
- The application shall determine the user’s current workout based on the current day and the schedule defined by the active workout plan.
- The application shall automatically display the appropriate workout for the current day.
- When a new day begins, the application shall reflect the workout assigned to that new day.
- The application shall advance to the next week of the workout plan when the current week is completed.
- The application shall ensure the displayed workout matches the correct day and week of the active plan.

### 4.8 Workout Completion
- The application shall allow the user to mark an individual workout as completed.
- A completed workout shall be recorded in the user’s workout history.
- Completion status shall be visible for completed workouts.
- The application shall support completion tracking across the duration of a workout plan.

### 4.9 Plan Completion and History
- When a user completes an entire workout plan, the application shall save that plan to the user’s completed plans history.
- The application shall retain completed plans for later viewing.
- The user shall be able to view previously completed plans.
- The user shall be able to view historical exercise performance, including previous weights, reps, and other relevant workout data.
- Historical data shall remain associated with the correct user and relevant exercise or workout entry.

### 4.10 Data Persistence
- The application shall preserve user accounts, profile data, workout plans, workout history, completed plans, and exercise history between sessions.
- A user’s active workout plan and its current state shall persist across app restarts and sign-in sessions.
- Previously recorded workout completion data shall remain available after the user returns to the application.

### 4.11 Mobile Interface Requirements
- The application shall provide a clear and intuitive mobile user interface.
- The application shall be simple and easy to use during an actual workout.
- The workout experience shall minimize friction for viewing the current workout, updating sets, reps, and weights, and marking workouts as completed.

## 5. Data Requirements
The application shall store, at minimum, the following data elements for each user:
- Account credentials and authentication status.
- Profile information.
- Active workout plan.
- Workout plan definitions.
- Workout schedule by day and week.
- Workout completion status.
- Completed workout plans.
- Exercise definitions within plans.
- Sets, reps, and weights for each exercise.
- Historical workout entries.
- Historical exercise performance.
- Recommendation history when relevant to the active plan.
- Plan goal information.
- Progressive overload setting per plan.

## 6. Business Rules
1. A workout plan shall belong to exactly one user.
2. Only the owner of a plan shall be allowed to view or modify it.
3. Only one active workout plan shall be displayed as the current active plan for a user at a time unless the product explicitly supports multiple active plans.
4. The currently displayed workout shall be derived from the active plan’s schedule and the current calendar day.
5. The active workout shall change automatically when the date changes according to the plan schedule.
6. Week progression shall occur automatically when all workouts in the current week of the active plan are completed.
7. Progressive overload recommendations shall be based on historical performance for the same or comparable exercise and rep scheme.
8. User-customized changes shall override default recommendations in the saved plan state.
9. Marking a workout as completed shall persist that workout’s completion state.
10. Completing all required workouts in a plan shall move the plan into completed plan history.
11. Historical workout and exercise data shall be retained unless the user deletes it or the product defines a separate retention policy.
12. The interface shall prioritize quick access to current workout information during training sessions.

## 7. Inputs
The application shall accept the following user inputs:
- Account registration information.
- Sign-in credentials.
- Profile-related updates, if supported.
- Workout plan name and goal selection.
- Workout schedule details.
- Exercise selection.
- Sets, reps, and weights.
- Progressive overload enable/disable setting.
- Edits to exercises, workouts, and plans.
- Workout completion actions.
- Navigation and review actions for history and completed plans.

## 8. Outputs
The application shall provide the following outputs:
- Confirmation of account creation, sign-in, sign-out, and authentication errors.
- User profile views.
- Active workout plan display.
- Recommended workouts and recommended exercises.
- Recommended weight adjustments when progressive overload is enabled.
- Current workout for the current day.
- Workout and plan completion status.
- Workout history and completed plans views.
- Historical exercise performance views.
- Saved plan state reflecting user edits.

## 9. Acceptance Criteria

### 9.1 Account Access
- Given a new user, when they create an account, then the account is created and the user can sign in.
- Given an existing user, when they sign in with valid credentials, then they can access only their own data.
- Given a signed-in user, when they sign out, then their personal data is no longer accessible without reauthentication.

### 9.2 Profile Display
- Given a signed-in user, when they open their profile, then they can view their active workout plan.
- Given a signed-in user, when they open their profile, then they can view workout history, completed plans, and exercise history.

### 9.3 Plan Creation and Editing
- Given a signed-in user, when they create a workout plan, then they can define it around their goals.
- Given a signed-in user, when they edit an active workout plan, then the changes are saved and reflected immediately.
- Given a signed-in user, when they modify an individual workout day, then the changes are saved for that day in the plan.
- Given a signed-in user, when they add, remove, replace, or modify exercises, sets, reps, or weights, then the plan reflects those changes.

### 9.4 Recommendations and Progressive Overload
- Given a signed-in user and a selected goal, when the application provides recommendations, then it suggests workouts and exercises aligned with that goal.
- Given a workout plan with progressive overload enabled, when the system has prior performance data, then it recommends future weights using historical weights, exercises, and rep schemes.
- Given a workout plan with progressive overload disabled, when the user views the plan, then no automatic weight increase recommendation is applied.

### 9.5 Current Workout and Scheduling
- Given an active workout plan with a defined schedule, when the current day matches a planned workout day, then the application displays the correct workout for that day.
- Given a new calendar day, when the user opens the application, then the application displays the workout assigned to that day.
- Given completion of all workouts in the current week, when the plan advances, then the application shows the next week of the plan.

### 9.6 Workout and Plan Completion
- Given a user finishing a workout, when they mark it as completed, then the workout is stored in workout history.
- Given a user completing all required workouts in a plan, when the plan is finished, then the plan is stored in completed plans history.
- Given a completed plan, when the user views history, then the completed plan is available for review.
- Given historical exercise data, when the user views exercise history, then previous weights, reps, and related workout data are visible.

### 9.7 Data Persistence and Ownership
- Given a signed-in user, when they return to the application later, then their account, profile, workout plans, history, and completed plans remain available.
- Given two different users, when one user signs in, then they cannot access the other user’s workout plans, history, or profile information.

## 10. Non-Functional Requirements
- The application shall be designed for mobile use.
- The application shall be easy to use during an active workout.
- The application shall provide an intuitive interface with minimal steps for common workout actions.
- The application shall preserve user data across sessions.
- The application shall enforce user data isolation and privacy between accounts.
- The application shall present current workout information clearly and promptly.

## 11. Scope Boundaries
### In Scope
- User authentication.
- Personal workout plan creation and editing.
- Workout recommendations and exercise recommendations.
- Progressive overload recommendations.
- Schedule-based current workout selection.
- Workout and plan completion tracking.
- Workout and exercise history display.
- Persistent per-user data storage.
- Mobile-friendly workout interface.

### Out of Scope Unless Added Later
- Social sharing features.
- Public workout plan browsing.
- Trainer/admin account management features.
- Wearable device integrations.
- Nutrition tracking.
- Community messaging or leaderboards.

## 12. Definition of Done for Requirements
The requirements for Workouts2.0 are satisfied when the application can:
- Create and authenticate user accounts.
- Restrict data to the correct user.
- Create and manage goal-based workout plans.
- Support optional progressive overload using historical data.
- Recommend workouts and exercises.
- Display the correct workout for the current day and advance plan weeks appropriately.
- Track workout completion and archive completed plans.
- Show workout history and exercise performance history.
- Preserve data across sessions.
- Provide a simple, intuitive mobile workout experience.
