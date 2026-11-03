import { Activity, CalendarEvent, DemoUser, Friend } from '../domain/types';

export const demoUsers: DemoUser[] = [
  { id: 'u1', name: 'Avery Chen', homeLocation: 'Downtown', interests: ['art', 'coffee', 'live music'], budgetLevel: 'medium', calendarIds: ['u1'] },
  { id: 'u2', name: 'Jordan Patel', homeLocation: 'Riverside', interests: ['sports', 'coffee', 'games'], budgetLevel: 'low', calendarIds: ['u2'] },
  { id: 'u3', name: 'Mina Torres', homeLocation: 'Downtown', interests: ['food', 'art', 'movies'], budgetLevel: 'high', calendarIds: ['u3'] }
];

export const demoFriends: Friend[] = [
  { ...demoUsers[1], relationship: 'friend' },
  { ...demoUsers[2], relationship: 'coworker' }
];

export const demoEvents: Record<string, CalendarEvent[]> = {
  u1: [
    { id: 'e1', ownerId: 'u1', title: 'Design review', startISO: '2026-11-01T09:00:00.000Z', endISO: '2026-11-01T10:00:00.000Z', location: 'Office', status: 'confirmed', source: 'seeded' },
    { id: 'e2', ownerId: 'u1', title: 'Coffee with mentor', startISO: '2026-11-01T12:30:00.000Z', endISO: '2026-11-01T13:30:00.000Z', location: 'Cafe Loop', status: 'confirmed', source: 'seeded' }
  ],
  u2: [
    { id: 'e3', ownerId: 'u2', title: 'Gym session', startISO: '2026-11-01T09:30:00.000Z', endISO: '2026-11-01T11:00:00.000Z', location: 'Gym', status: 'confirmed', source: 'seeded' },
    { id: 'e4', ownerId: 'u2', title: 'Study block', startISO: '2026-11-01T14:00:00.000Z', endISO: '2026-11-01T15:30:00.000Z', location: 'Library', status: 'confirmed', source: 'seeded' }
  ],
  u3: [
    { id: 'e5', ownerId: 'u3', title: 'Lunch meeting', startISO: '2026-11-01T11:00:00.000Z', endISO: '2026-11-01T12:15:00.000Z', location: 'Downtown Cafe', status: 'confirmed', source: 'seeded' },
    { id: 'e6', ownerId: 'u3', title: 'Art class', startISO: '2026-11-01T15:00:00.000Z', endISO: '2026-11-01T17:30:00.000Z', location: 'Studio West', status: 'confirmed', source: 'seeded' }
  ]
};

export const noAvailabilityEvents: Record<string, CalendarEvent[]> = {
  u1: [{ id: 'na1', ownerId: 'u1', title: 'Busy all day', startISO: '2026-11-02T09:00:00.000Z', endISO: '2026-11-02T18:00:00.000Z', location: 'Office', status: 'confirmed', source: 'seeded' }],
  u2: [{ id: 'na2', ownerId: 'u2', title: 'Busy all day', startISO: '2026-11-02T09:00:00.000Z', endISO: '2026-11-02T18:00:00.000Z', location: 'Gym', status: 'confirmed', source: 'seeded' }],
  u3: [{ id: 'na3', ownerId: 'u3', title: 'Busy all day', startISO: '2026-11-02T09:00:00.000Z', endISO: '2026-11-02T18:00:00.000Z', location: 'Studio', status: 'confirmed', source: 'seeded' }]
};

export const demoActivities: Activity[] = [
  { id: 'a1', title: 'Museum visit', category: 'culture', location: 'Downtown', durationMinutes: 120, costLevel: 'medium', interestTags: ['art', 'culture'], minParticipants: 1, maxParticipants: 6, description: 'A relaxed demo museum outing.' },
  { id: 'a2', title: 'Coffee crawl', category: 'food', location: 'Downtown', durationMinutes: 90, costLevel: 'low', interestTags: ['coffee', 'conversation'], minParticipants: 2, maxParticipants: 5, description: 'Sample coffee stop with fictional friends.' },
  { id: 'a3', title: 'Arcade night', category: 'games', location: 'Riverside', durationMinutes: 150, costLevel: 'medium', interestTags: ['games', 'friends'], minParticipants: 2, maxParticipants: 4, description: 'Local demo arcade activity.' },
  { id: 'a4', title: 'Concert tickets', category: 'music', location: 'Downtown', durationMinutes: 180, costLevel: 'high', interestTags: ['live music', 'nightlife'], minParticipants: 2, maxParticipants: 4, description: 'A fictional concert example for the demo.' },
  { id: 'a5', title: 'Lunch picnic', category: 'outdoors', location: 'Riverside', durationMinutes: 60, costLevel: 'low', interestTags: ['food', 'outdoors'], minParticipants: 2, maxParticipants: 8, description: 'Casual outdoor lunch in the demo location.' }
];
