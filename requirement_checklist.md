# Requirements Checklist Extracted from requirements.md

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
- User can select workout goals during plan creation.
- User can modify the active workout plan at any time.
- User can modify an individual workout day at any time.
- User can customize plan details by adding, removing, replacing, or modifying:
  - Exercises
  - Sets
  - Reps
  - Weights
- The active workout plan is stored in the user profile.

### Progressive overload
- User can enable or disable progressive overload during plan creation.
- If enabled, the system recommends weight increases based on the user’s previous weights, exercises, and rep schemes.
- Progressive overload recommendations use the user’s historical performance.
- The system must not recommend future weight increases unless derived from the user’s historical workout data for the relevant exercise and rep scheme.
- If progressive overload is disabled, no progressive overload weight increases are applied.

### Workout and exercise recommendations
- The system provides recommended workouts and exercises based on selected goals and workout plan.
- The user can fully customize any recommended workout or exercise before using it in an active plan.

### Scheduling and current workout determination
- The system automatically determines the current workout based on the current day and the active workout plan schedule.
- When a new day begins, the app displays the workout assigned to that day.
- The system correctly advances to the next week when the current week is completed.
- Current workout determination follows the active workout plan schedule consistently.

### Completion tracking and history
- User can mark an individual workout as completed.
- When an entire plan is completed, the system saves the completed plan to the user profile as workout history.
- Completed plans are preserved for later viewing.
- Users can view previous completed plans.
- Users can view historical exercise performance.
- Historical workout data retained/displayed includes at minimum previous weights, reps, and other relevant workout data.
- Workout history and exercise history are visible only to the signed-in user who owns them.

### Data ownership and privacy
- Each user can access and modify only their own workout plans, workout history, exercise history, completed plans, and profile information.
- The system prevents viewing or editing another user’s workout data.

### Inputs the system must accept
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

### Outputs the system must provide
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

## Non-functional and business-rule requirements to validate

### Security and privacy
- Per-user data isolation must be enforced.
- Unauthorized access to another user’s data must be prevented.
- Guest users must not access personal workout data.

### Persistence and reliability
- User data must persist across sessions.
- Historical workout data must be preserved for recommendations and history review.

### Usability
- The app must provide a clear and intuitive mobile interface.
- The workout flow must be simple and easy to use during an actual workout.

### Core business rules
- Workout data belongs only to the owning user.
- Workout/exercise recommendations are based on the user’s selected goals and plan.
- Progressive overload recommendations are based on the user’s own prior workout performance.
- The active workout plan schedule determines which workout is shown on a given day.
- Completing the current week advances the plan to the next week.
- Completing an entire plan records it in completed plan history.

## Acceptance criteria checklist
- New account creation creates a new user profile.
- Valid sign-in grants access to that user’s data.
- Invalid sign-in denies access.
- Signed-in user profile shows active plan, workout history, completed plans, and exercise history.
- Guest access to profile data is denied.
- Plan creation supports goal-based definition.
- Edits to active plans and workout days are saved.
- Custom exercise/set/rep/weight changes are reflected in the plan.
- With progressive overload enabled, future recommendations are based on historical performance.
- With progressive overload disabled, weight increases are not applied.
- Recommendations align with selected goals and active plan.
- Recommended workouts/exercises can be customized before use.
- Scheduled workout for the current day is shown correctly.
- On a new day, the app shows the new day’s assigned workout.
- After the final workout of a week, the next requested workout advances to the next week.
- Marking a workout complete records completion.
- Completing a full plan saves it to workout history.
- Viewing history shows prior completed plans and exercise performance data.
- Different users can access only their own workout data.
- Returning users still have their saved data.
- Mobile workout interaction is clear and easy to use.
