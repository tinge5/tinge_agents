# Social Calendar Frontend Prototype Architecture

## 1. Purpose and Scope
This document defines the implementation architecture for a **frontend-only React Native prototype** that validates three core capabilities using **deterministic local sample data**:

1. Calculating overlapping availability across selected fictional friends.
2. Recommending activities based on shared availability and group constraints.
3. Simulating invitations with accept/decline responses and calendar updates on acceptance.

### In Scope
- React Native app built with **Expo**.
- Local demo data only; no backend, database, or live APIs.
- Simple demo-user selection instead of real authentication.
- Manual/demo location selection.
- Availability calculation, recommendation logic, and invitation workflow implemented as testable utility modules.
- Local calendar updates when invitations are accepted.

### Out of Scope
- Real authentication, account creation, or password flows.
- Backend APIs, cloud storage, server-side logic, or production infrastructure.
- External calendar integrations (Google/Apple/Microsoft), email, SMS, push notifications.
- Social media integrations, contact imports, or third-party friend discovery.
- Payments, reservations, analytics, or multi-device sync.

## 2. Recommended Technology Stack
- **React Native + Expo**: fastest path for a course prototype and easy local execution.
- **TypeScript**: preferred for explicit data models and safer utility logic.
- **React Navigation**: simple stack + tab navigation.
- **Plain React state or lightweight Context + useReducer**: sufficient for local prototype state.
- **No backend library required**.
- Optional styling: **StyleSheet** or a minimal UI helper library only if it keeps implementation small.

## 3. High-Level Architecture
The app is split into four layers:

1. **Presentation layer**
   - Screens and reusable UI components.
   - No business rules embedded in screen components.

2. **State layer**
   - Global prototype state: current demo user, selected friends, date range, filters, invitations, and local calendars.
   - Managed via Context + reducer or a small app store module.

3. **Domain logic layer**
   - Availability calculation.
   - Recommendation filtering and ranking.
   - Invitation creation and response handling.

4. **Data layer**
   - Deterministic local mock data for users, friends, events, activities, and invitations.
   - Read/write only in memory during the session.

## 4. Screen and Navigation Plan
Use a **bottom tab navigator** or a small stack with tabs if preferred. Keep the number of screens minimal.

### Required Screens
1. **Demo Entry / User Selection Screen**
   - Choose the active demo user.
   - Choose or confirm demo location.
   - Clear label that this is sample data.

2. **Calendar Screen**
   - Show the selected user’s agenda/calendar events.
   - Allow add/edit/remove of simple mock events.
   - Link to group planning.

3. **Friends & Group Selection Screen**
   - Display fictional friends.
   - Select multiple friends for availability calculation.
   - Show selected members clearly.

4. **Shared Availability Screen**
   - Show overlapping free time slots for the current user + selected friends.
   - Allow date range selection.
   - Empty state when no common availability exists.

5. **Recommendations Screen**
   - Show recommended activities that fit the chosen slot and constraints.
   - Include budget, location, and interest filters.
   - Show why an activity is suggested.

6. **Invitation Details Screen**
   - Create and review an invitation.
   - Simulate accept or decline.
   - Show invitation status and calendar update outcome.

### Navigation Flow
- Demo Entry -> Calendar or Friends/Group Selection.
- Friends/Group Selection -> Shared Availability -> Recommendations -> Invitation Details.
- Calendar remains accessible throughout for confirmation of events.

## 5. Component and Module Responsibilities
Keep business logic separate from presentation so it can be tested independently.

### Presentation Components
- **AppShell / NavigationContainer**: root navigation setup.
- **DemoUserPicker**: selects active user and demo location.
- **CalendarView**: renders event list or agenda.
- **EventCard**: displays one event.
- **FriendSelector**: checkbox/chip UI for selected friends.
- **AvailabilitySlotCard**: renders one shared free slot.
- **ActivityCard**: renders recommendation details and rationale.
- **InvitationStatusBadge**: Pending / Accepted / Declined.
- **EmptyState**: reusable no-results UI.
- **ErrorState**: reusable local error UI.

### Domain Utilities
- **availabilityService**: computes shared free intervals.
- **recommendationService**: filters and ranks activities.
- **invitationService**: creates invitations and handles responses.
- **calendarService**: reads and mutates local mock calendars.

### State Modules
- **appState / appReducer**: stores current user, selected friends, filters, computed slots, recommendations, and invitations.
- **demoData**: static seed data for users, friends, events, and activities.

## 6. Proposed Folder Structure
Minimal implementation-ready structure:

```text
src/
  app/
    navigation/
      AppNavigator.tsx
    AppShell.tsx
  screens/
    DemoEntryScreen.tsx
    CalendarScreen.tsx
    FriendsScreen.tsx
    AvailabilityScreen.tsx
    RecommendationsScreen.tsx
    InvitationScreen.tsx
  components/
    DemoUserPicker.tsx
    CalendarView.tsx
    EventCard.tsx
    FriendSelector.tsx
    AvailabilitySlotCard.tsx
    ActivityCard.tsx
    InvitationStatusBadge.tsx
    EmptyState.tsx
    ErrorState.tsx
  state/
    AppContext.tsx
    appReducer.ts
    selectors.ts
  data/
    demoData.ts
    demoUsers.ts
    demoFriends.ts
    demoEvents.ts
    demoActivities.ts
  domain/
    types.ts
    availabilityService.ts
    recommendationService.ts
    invitationService.ts
    calendarService.ts
    dateUtils.ts
  utils/
    formatters.ts
    validation.ts
  tests/
    availabilityService.test.ts
    recommendationService.test.ts
    invitationService.test.ts
```

If a smaller codebase is preferred, `demoData.ts` can hold all static seed data in one file.

## 7. Data Model Design
Use simple TypeScript interfaces. All IDs are strings. Dates should be stored in ISO-8601 strings to keep logic deterministic.

### 7.1 Demo User
```ts
type DemoUser = {
  id: string;
  name: string;
  homeLocation: string;
  interests: string[];
  budgetLevel: 'low' | 'medium' | 'high';
  calendarIds: string[];
};
```

### 7.2 Friend
Friends can reuse the same structure as demo users, with a relationship label.
```ts
type Friend = DemoUser & {
  relationship: 'friend' | 'coworker' | 'classmate';
};
```

### 7.3 Calendar Event
```ts
type CalendarEvent = {
  id: string;
  ownerId: string;
  title: string;
  startISO: string;
  endISO: string;
  location?: string;
  status?: 'confirmed' | 'tentative';
  source?: 'seeded' | 'accepted-invitation' | 'manual';
};
```

### 7.4 Activity
```ts
type Activity = {
  id: string;
  title: string;
  category: string;
  location: string;
  durationMinutes: number;
  costLevel: 'low' | 'medium' | 'high';
  interestTags: string[];
  minParticipants: number;
  maxParticipants: number;
  description: string;
};
```

### 7.5 Time Slot
```ts
type TimeSlot = {
  startISO: string;
  endISO: string;
  durationMinutes: number;
};
```

### 7.6 Invitation
```ts
type InvitationStatus = 'draft' | 'pending' | 'accepted' | 'declined';

type Invitation = {
  id: string;
  organizerId: string;
  invitedFriendIds: string[];
  activityId: string;
  timeSlot: TimeSlot;
  location: string;
  status: InvitationStatus;
  createdAtISO: string;
  respondedAtISO?: string;
  responseNote?: string;
  confirmedEventId?: string;
};
```

## 8. Deterministic Demo Data Requirements
Provide a small local dataset with:
- At least 3 demo users/friends.
- Distinct calendars with overlapping and conflicting events.
- At least one case with **no shared availability**.
- Activities covering different categories, budgets, locations, and interests.
- A manual/demo location selection that affects filtering.

Seed data should be stable and predictable so the same input always yields the same output.

## 9. Shared Availability Calculation
The availability engine must be a pure function operating on local event data.

### Inputs
- Selected date range.
- Current demo user.
- Selected friends.
- Their events.
- Daily window, if needed, such as 9:00–18:00.

### Approach
1. Build each participant’s busy intervals for the selected date range.
2. Normalize all times to ISO strings or UTC consistently.
3. Merge overlapping busy intervals for each person.
4. Compute free intervals by subtracting busy intervals from the daily working window.
5. Intersect all participants’ free intervals to get common availability.
6. Filter out slots shorter than a minimum threshold, e.g. 30 minutes.

### Edge Cases
- Overlapping events within one calendar.
- Adjacent events touching at endpoints.
- Different time zones are out of scope; use one consistent locale/time basis.
- If no slots remain, return an empty array and a reason string for the UI.
- If selected friends list is empty, default to the current user only or show a prompt to select friends.

### Output
A sorted array of `TimeSlot` objects ordered by earliest start time.

## 10. Recommendation Filtering and Ranking
Recommendations should be computed locally from the static activity dataset.

### Hard Filters
Reject activities that violate any selected hard constraint:
- Duration does not fit the selected shared slot.
- Cost level exceeds selected budget.
- Location does not match the selected demo location rule, if enforced.
- Participant count outside the chosen group size.

### Soft Ranking
Score remaining activities by:
- Interest overlap with the organizer and selected friends.
- Location match.
- Budget fit.
- Duration efficiency within the available slot.
- Optional category preference.

### Ranking Output
Return activities sorted by highest score first, along with a brief reason summary such as:
- matches 2 shared interests
- fits medium budget
- close to selected location

### Empty State
If no activity matches, show a clear empty state with guidance to relax a filter or choose a different slot.

## 11. Invitation Workflow and State Transitions
Invitation handling should be isolated from the UI and calendar rendering.

### State Machine
- **draft**: created locally before send.
- **pending**: invitation sent/simulated and awaiting response.
- **accepted**: invitation accepted; a confirmed event is added to the relevant calendar(s).
- **declined**: invitation declined; no confirmed event is added.

### Transition Rules
- Draft -> Pending when the user confirms sending.
- Pending -> Accepted when a simulated friend response is set to accept.
- Pending -> Declined when a simulated friend response is set to decline.
- Accepted is terminal for this prototype.
- Declined is terminal unless the organizer creates a new invitation.

### Duplicate Prevention
When an accepted invitation is processed again:
- Do not create a second calendar event.
- Detect duplicates by invitation ID or by a stable combination of activity + timeSlot + invited users.
- Return the existing confirmed event instead of inserting a new one.

### Calendar Update Behavior
On acceptance:
- Add a confirmed event to the organizer’s calendar.
- Add mirrored or participating-event entries to invited friends’ calendars if the prototype shows multiple calendars.
- Preserve the original invitation record and mark it accepted.

## 12. Local State Management
Use a single in-memory app state tree to keep the prototype simple.

### Suggested State Shape
```ts
type AppState = {
  currentUserId: string;
  selectedFriendIds: string[];
  selectedLocation: string;
  dateRange: { startISO: string; endISO: string };
  availabilitySlots: TimeSlot[];
  selectedSlotId?: string;
  filters: {
    budget: 'any' | 'low' | 'medium' | 'high';
    interest?: string;
    category?: string;
  };
  recommendations: Activity[];
  invitations: Invitation[];
  calendars: Record<string, CalendarEvent[]>;
  ui: {
    loading: boolean;
    error?: string;
  };
};
```

### Management Recommendation
- Use `useReducer` for deterministic updates.
- Use Context to avoid prop drilling.
- Derived data such as availability and recommendations should be recalculated from state, not stored manually unless needed for display caching.

## 13. Empty, Loading, and Error States
Since this is local-only, loading and error handling should be lightweight.

### Empty States
- No selected friends.
- No shared availability.
- No matching recommendations.
- No events in calendar.

### Error States
Use only for local validation or unexpected state issues, such as:
- Invalid date range.
- Corrupt demo data.
- Missing required activity/time selection.

### Loading States
- Optional and minimal, mainly for a brief spinner or placeholder when recalculating results.
- Not required for network operations because there are none.

## 14. Testing Strategy Mapped to Acceptance Criteria
Focus tests on pure logic modules and a small number of integration-style checks.

### Unit Tests
1. **Availability service tests**
   - Select at least two friends and verify only mutual free slots are returned.
   - Verify an overlapping conflict event removes the overlapping interval.
   - Verify no shared free time returns an empty result and message.
   - Verify date range changes update output.

2. **Recommendation service tests**
   - Verify activities outside budget are filtered out.
   - Verify activities exceeding slot duration are filtered out.
   - Verify ranking changes when interests/location/budget filters change.
   - Verify no matches returns empty results.

3. **Invitation service tests**
   - Create invitation -> pending.
   - Accept -> accepted and confirmed calendar event added.
   - Decline -> declined and no confirmed event added.
   - Re-accept accepted invitation -> no duplicate event.

### UI/Integration Checks
- Calendar screen reflects confirmed events after acceptance.
- Empty states render when no availability or recommendations exist.
- Selected friends and filters visibly affect the displayed results.

### Acceptance Criteria Coverage
- **AC 9–11**: availability tests and empty state UI.
- **AC 12–13**: recommendation filters and ranking tests.
- **AC 14–17**: invitation state transition and duplicate prevention tests.
- **AC 18**: confirm all scenarios use local sample data only.

## 15. Key Assumptions and Decisions
- One consistent time zone/locale for the prototype to avoid timezone complexity.
- Date/time handling uses ISO strings and a small date utility module.
- Demo data is intentionally small and manually curated.
- The current demo user is selected explicitly rather than through authentication.
- Calendar edits are local and non-persistent beyond the current session unless the app state is preserved in memory.

## 16. Risks and Mitigations
- **Risk: time calculation bugs**
  - Mitigation: keep availability logic pure and test with fixed fixtures.
- **Risk: state drift between invitations and calendars**
  - Mitigation: update both through the same reducer/action path.
- **Risk: UI becoming too complex for a prototype**
  - Mitigation: keep screens minimal and prefer reusable components.
- **Risk: mock data feels unrealistic**
  - Mitigation: include believable schedules, interests, and activity metadata.

## 17. Future Replaceability
This architecture keeps domain logic separate from UI so mock data can later be replaced with real services by swapping:
- `demoData` with API-backed data sources.
- `availabilityService` and `recommendationService` inputs from remote calendars and activity APIs.
- `invitationService` with a server-backed invitation workflow.

Because the screens depend on typed domain interfaces rather than on hardcoded sample objects, the prototype can evolve without rewriting the navigation or UI structure.

## 18. Minimum Files Required for Implementation
If the team wants the smallest viable implementation, the essential files are:
- `src/domain/types.ts`
- `src/domain/availabilityService.ts`
- `src/domain/recommendationService.ts`
- `src/domain/invitationService.ts`
- `src/state/AppContext.tsx`
- `src/state/appReducer.ts`
- `src/data/demoData.ts`
- `src/app/navigation/AppNavigator.tsx`
- `src/screens/DemoEntryScreen.tsx`
- `src/screens/CalendarScreen.tsx`
- `src/screens/FriendsScreen.tsx`
- `src/screens/AvailabilityScreen.tsx`
- `src/screens/RecommendationsScreen.tsx`
- `src/screens/InvitationScreen.tsx`
- `src/components/EmptyState.tsx`
- `src/components/ErrorState.tsx`

## 19. Final Scope Summary
This prototype is intentionally small: a local-only React Native/Expo app with deterministic demo data, pure utility logic for availability/recommendations/invitations, and a simple navigation flow that demonstrates the required Social Calendar scenarios without any backend or external integrations.
