# QA Requirement Checklist Extracted from requirements.md

Source: `./requirements.md`

## Functional requirements to validate

### Authentication and account management
- User can create an account.
- User can sign in with valid credentials.
- Invalid sign-in credentials are denied.
- Signed-in user data persists between sessions.
- Only authenticated users can access workout plans, workout history, exercise history, completed plans, and profile data.
- Guest users can access only authentication-related functions.

### Profile data
- Each user profile stores and displays:
  - Active workout plan
  - Workout history
  - Completed plans
  - Exercise history

### Workout plan management
- User can create workout plans tailored to individual goals.
- User can select workout goals when creating a plan.
- User can modify active workout plan at any time.
- User can modify an individual workout day at any time.
- User can customize plan by adding, removing, replacing, or modifying:
  - Exercises
  - Sets
  - Reps
  - Weights
- Active workout plan is stored in the user profile.

### Progressive overload
- User can enable or disable progressive overload when creating a plan.
- If enabled, system recommends weight increases based on previous weights, exercises, and rep schemes.
- Recommendations use the user’s historical performance.
- System must not recommend a weight increase unless derived from that user’s historical data for the relevant exercise and rep scheme.
- If disabled, no progressive overload weight increases are applied.

### Recommendations
- System provides recommended workouts and exercises based on selected goals and active plan.
- User can fully customize any recommendation before using it in an active plan.

### Scheduling and current workout determination
- System automatically determines the current workout based on current day and active plan schedule.
- On a new day, the app displays the workout assigned to that day.
- System correctly advances to the next week when current week is completed.
- Current workout determination follows the active plan schedule.

### Completion tracking and history
- User can mark an individual workout as completed.
- When an entire plan is completed, the plan is saved to the user profile as workout history/completed plan history.
- Completed plans are preserved and viewable later.
- User can view previous completed plans.
- User can view historical exercise performance.
- Historical workout data retained/displayed includes at minimum:
  - Previous weights
  - Reps
  - Other relevant workout data
- Workout history and exercise history are visible only to the signed-in user’s own account.

### Data ownership and privacy
- Each user can only access and modify their own workout plans, workout history, exercise history, completed plans, and profile information.
- System prevents users from viewing or editing another user’s workout data.

### Inputs accepted
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

### Outputs provided
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

## Non-functional / quality requirements to validate
- Mobile interface is clear and intuitive.
- Workout experience is simple and easy to use during an actual workout.
- User data persists between sessions.
- User-scoped data isolation/privacy is enforced.
- Historical workout data is preserved to support recommendations and review.

## Key acceptance criteria checklist
- New account creation creates a new user profile.
- Valid sign-in grants access to the correct user’s data.
- Invalid sign-in denies access.
- Signed-in profile shows active plan, workout history, completed plans, and exercise history.
- Guest access to profile/personal data is denied.
- Plan creation supports goal-based definition.
- Active plan and workout day edits are saved.
- Exercise/set/rep/weight customization is reflected in plan configuration.
- Progressive overload enabled => recommendations based on user history.
- Progressive overload disabled => no overload increases applied.
- Recommendations align with user goal and active plan.
- Recommendations can be customized before use.
- Current day shows scheduled workout.
- New day shows the newly scheduled workout.
- Completing the final workout in a week advances to the next week.
- Marking a workout completed records completion.
- Completing an entire plan saves it to workout history.
- History view shows prior completed plans and exercise performance.
- One user can access only their own workout data.
- Returning user still has saved data available.
- Mobile usage is clear and easy during workouts.
