export type BudgetLevel = 'low' | 'medium' | 'high';
export type FilterBudget = BudgetLevel | 'any';

export type DemoUser = {
  id: string;
  name: string;
  homeLocation: string;
  interests: string[];
  budgetLevel: BudgetLevel;
  calendarIds: string[];
};

export type Friend = DemoUser & {
  relationship: 'friend' | 'coworker' | 'classmate';
};

export type CalendarEvent = {
  id: string;
  ownerId: string;
  title: string;
  startISO: string;
  endISO: string;
  location?: string;
  status?: 'confirmed' | 'tentative';
  source?: 'seeded' | 'accepted-invitation' | 'manual';
};

export type Activity = {
  id: string;
  title: string;
  category: string;
  location: string;
  durationMinutes: number;
  costLevel: BudgetLevel;
  interestTags: string[];
  minParticipants: number;
  maxParticipants: number;
  description: string;
};

export type TimeSlot = {
  startISO: string;
  endISO: string;
  durationMinutes: number;
};

export type InvitationStatus = 'draft' | 'pending' | 'accepted' | 'declined';

export type Invitation = {
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

export type Recommendation = Activity & {
  score: number;
  reasons: string[];
};

export type AppFilters = {
  budget: FilterBudget;
  interest?: string;
  category?: string;
};
