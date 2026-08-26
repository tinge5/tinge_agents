# Requirements Test Checklist

Extracted from `./requirements.md`.

## Functional requirements to verify

### Account creation and sign-in
- [ ] User can create an account.
- [ ] Existing user can sign in.
- [ ] Signed-in user can sign out.
- [ ] User-specific data persists between sessions.
- [ ] Unauthenticated users are blocked from private workout data.

### User profile
- [ ] Each user has a profile.
- [ ] Profile stores and displays active workout plan.
- [ ] Profile stores and displays workout history.
- [ ] Profile stores and displays completed plans.
- [ ] Profile stores and displays exercise history.
- [ ] User can view historical workout performance data.

### Workout plan creation
- [ ] User can create workout plans tailored to goals.
- [ ] User can specify one or more plan goals.
- [ ] User can enable or disable progressive overload during plan creation.
- [ ] Plan includes a schedule of workout days.
- [ ] Plan includes exercises for each workout day.
- [ ] Plan supports sets, reps, and weights for exercises.
- [ ] Created plan can be assigned as the active workout plan.

### Workout and exercise recommendations
- [ ] App provides recommended workouts/exercises based on selected goals and active plan.
- [ ] Recommendations are shown before or during plan editing.
- [ ] User can accept, modify, replace, or remove recommendations.
- [ ] User retains final control over plan contents.

### Plan and workout customization
- [ ] User can modify the active workout plan at any time.
- [ ] User can modify an individual workout day at any time.
- [ ] User can add exercises to a workout day.
- [ ] User can remove exercises from a workout day.
- [ ] User can replace exercises in a workout day.
- [ ] User can modify sets, reps, and weights for any exercise.
- [ ] User can edit a scheduled workout before or after it is displayed for the day.

### Workout scheduling and current-day behavior
- [ ] App determines current workout from current day and active plan schedule.
- [ ] On a new day, app displays that day’s workout from the active plan.
- [ ] App advances to the next scheduled workout day according to schedule.
- [ ] After current week is completed, app advances to next week.
- [ ] Repeating weekly schedules are handled correctly until plan completion.

### Workout completion and history
- [ ] User can mark an individual workout as completed.
- [ ] Completed workout is recorded in workout history.
- [ ] When entire plan is completed, completed plan is saved to profile/history.
- [ ] User can view previously completed plans.
- [ ] User can view historical exercise performance for completed and in-progress workouts.

### Historical performance tracking
- [ ] Previous exercise weights are stored.
- [ ] Previous exercise reps are stored.
- [ ] Other relevant workout performance data is stored.
- [ ] Historical data is associated to the correct user and exercise.

### Progressive overload
- [ ] Progressive overload can be enabled or disabled per plan.
- [ ] With progressive overload enabled, app recommends increased weight based on prior performance.
- [ ] Recommendations use same-user, same-exercise history when available.
- [ ] Recommendations consider prior weights, exercises, and rep schemes.
- [ ] User can manually override recommended weight.
- [ ] If history is insufficient, user can still proceed without being blocked.

### Data persistence
- [ ] Accounts, profiles, plans, workouts, completion status, and exercise history persist between sessions.
- [ ] Active workout plan persists per user between sessions.
- [ ] Current progress within a workout plan persists between sessions.
- [ ] Completed plans persist as historical records.

### Privacy and access control
- [ ] Each user can access only their own profile and workout data.
- [ ] Each user can modify only their own plans, history, and profile information.
- [ ] App does not expose another user’s plans, history, or profile data.
- [ ] Authentication is required before personal workout data can be viewed or changed.

### Required inputs support
- [ ] App accepts account creation details.
- [ ] App accepts sign-in credentials.
- [ ] App accepts goal selection for workout plans.
- [ ] App accepts workout plan name/identifier.
- [ ] App accepts progressive overload preference.
- [ ] App accepts workout day schedule.
- [ ] App accepts exercise selection.
- [ ] App accepts sets, reps, and weights.
- [ ] App accepts workout completion status.
- [ ] App accepts manual edits to workouts and plans.

### Required outputs/presentation
- [ ] App shows account and sign-in status.
- [ ] App shows active workout plan details.
- [ ] App shows recommended workouts and exercises.
- [ ] App shows recommended weights when progressive overload is enabled.
- [ ] App shows current day workout view.
- [ ] App shows week progression status.
- [ ] App shows workout completion status.
- [ ] App shows historical workout and exercise performance views.
- [ ] App shows completed plan records.

### Mobile UX expectations
- [ ] Mobile UI is clear and intuitive.
- [ ] UI makes it easy to start, review, and complete a workout during an active session.
- [ ] UI prioritizes fast access to active workout, exercises, sets, reps, and weights.
- [ ] Workout information is presented simply and readably.

### Business rules to verify
- [ ] Authenticated user owns all workout data associated with their account.
- [ ] Only one active plan instance exists per user at a time unless otherwise defined.
- [ ] Current workout must match active plan schedule for the current day.
- [ ] Completed workouts remain in workout history.
- [ ] Completed workout plans remain in completed-plan history after the plan ends.
- [ ] Progressive overload recommendations are derived from historical performance, not unrelated data.
- [ ] User edits override generated recommendations.

## Explicit non-functional requirements to verify
- [ ] Secure access control for private workout data.
- [ ] Persistence/reliability of stored user data between sessions.
- [ ] Mobile usability: clear, intuitive experience suitable during active workouts.
- [ ] Readability and fast access to key workout information on mobile.
- [ ] Data privacy and user isolation.

## Acceptance-criteria-driven test targets
- [ ] New user account creation grants access to authenticated features.
- [ ] Existing user sign-in loads that user’s own data.
- [ ] Unauthenticated private-data access is denied.
- [ ] Signed-in profile view shows active plan, workout history, completed plans, and exercise history.
- [ ] Completed workout/plan data remains available in later sessions.
- [ ] Plan creation supports goals, schedule, exercises, sets, reps, weights, and progressive overload choice.
- [ ] Plan/workout-day edits are reflected in saved active plan.
- [ ] Exercise add/remove/replace/modify changes are saved.
- [ ] Progressive overload enabled + sufficient history yields increased weight recommendation.
- [ ] Progressive overload disabled does not force automatic increases.
- [ ] User-selected values override recommendations.
- [ ] Current-day schedule displays corresponding workout.
- [ ] Opening app on a new day shows workout for that day.
- [ ] Week completion advances to correct next-week workout.
- [ ] Marking workout complete stores it in history.
- [ ] Completed plan appears in profile history.
- [ ] Exercise history displays prior weights, reps, and other workout data.
- [ ] Different users can access only their own plans/history.
- [ ] Cross-user modification attempts are denied.

## Out of scope reminders
- Medical diagnosis/treatment guidance.
- Social/community features.
- Payments/subscriptions.
- Public visibility of workout plans/history.
