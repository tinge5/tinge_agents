# Requirements Checklist Extracted from `requirements.md`

## Functional Requirements to Validate

### Authentication and Account Management
- Allow user account creation.
- Allow registered users to sign in.
- Deny access on invalid sign-in credentials.
- Preserve user data between sessions.
- Restrict workout/profile/history access to authenticated users only.
- Guest users may access only authentication-related functions.

### Profile Data
- Provide a personal profile per user.
- Profile must store/display at least:
  - Active workout plan
  - Workout history
  - Completed plans
  - Exercise history

### Workout Plan Management
- Allow users to create workout plans tailored to individual goals.
- Allow users to select workout goals during plan creation.
- Allow editing of the active workout plan at any time.
- Allow editing of an individual workout day at any time.
- Allow customization by adding/removing/replacing/modifying:
  - Exercises
  - Sets
  - Reps
  - Weights
- Store the active workout plan in the user profile.

### Progressive Overload
- Allow user to enable/disable progressive overload during plan creation.
- If enabled, recommend weight increases based on:
  - Previous weights
  - Exercises
  - Rep schemes
- Use the user’s historical performance as the basis for recommendations.
- Do not recommend increases unless derived from relevant historical workout data.
- If disabled, do not apply progressive overload increases.

### Workout and Exercise Recommendations
- Provide recommended workouts/exercises based on selected goals and active plan.
- Allow full user customization of recommendations before use.

### Scheduling and Current Workout Determination
- Automatically determine current workout from current day and active plan schedule.
- On a new day, automatically display that day’s assigned workout.
- Advance to the next week when the current week is completed.
- Follow active plan schedule consistently when determining current workout.

### Completion Tracking and History
- Allow user to mark an individual workout as completed.
- Record workout completion.
- When an entire plan is completed, save it to the user profile as workout history.
- Preserve completed plans for later viewing.
- Allow users to view previous completed plans.
- Allow users to view exercise performance history.
- Retain/display historical workout data including at minimum:
  - Previous weights
  - Reps
  - Other relevant workout data

### Data Ownership and Privacy
- Ensure each user can access/modify only their own:
  - Workout plans
  - Workout history
  - Exercise history
  - Completed plans
  - Profile information
- Prevent viewing/editing another user’s workout data.
- Show workout history and exercise history only for the signed-in user’s own account.

### Required Inputs
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

### Required Outputs
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

## Non-Functional / Quality Requirements to Validate
- User data must persist across sessions.
- Per-user data isolation/privacy must be enforced.
- Unauthorized access to another user’s data must be prevented.
- Mobile interface must be clear and intuitive.
- Workout flow during active use must remain simple and easy to use.
- Historical data must be preserved sufficiently to support recommendations and history review.

## High-Priority Acceptance Checklist
- New user registration creates a new user profile.
- Valid sign-in grants access to that user’s data.
- Invalid sign-in denies access.
- Signed-in user profile shows active workout plan, workout history, completed plans, and exercise history.
- Guest user cannot access profile data.
- Signed-in user can create a goal-based workout plan.
- Signed-in user can modify active plan and workout day; changes are saved.
- Signed-in user can customize exercises/sets/reps/weights.
- Progressive overload enabled => recommendations use the user’s history.
- Progressive overload disabled => no overload increases applied.
- Recommendations align to selected goals and active plan.
- User can customize recommendations before use.
- Current day shows scheduled workout from active plan.
- New day shows newly scheduled workout.
- Completing final workout of week advances plan to next week.
- Marking a workout complete records completion.
- Completing an entire plan saves it to workout history.
- Signed-in user can view completed plans and exercise performance history.
- One user can access only their own data.
- Returning user still has saved data on later sign-in.
- Mobile workout interaction is clear and easy to use.
