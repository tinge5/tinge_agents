import { CalendarEvent, Invitation } from './types';

const stableKey = (invitation: Invitation) => `${invitation.organizerId}-${invitation.activityId}-${invitation.timeSlot.startISO}-${invitation.timeSlot.endISO}-${invitation.invitedFriendIds.join(',')}`;

export const createInvitation = (invitation: Invitation) => ({ ...invitation, status: 'pending' as const });

export const respondToInvitation = (params: {
  invitation: Invitation;
  response: 'accept' | 'decline';
  calendars: Record<string, CalendarEvent[]>;
  activityTitle: string;
}) => {
  const respondedAtISO = new Date().toISOString();
  if (params.response === 'decline') {
    return { invitation: { ...params.invitation, status: 'declined' as const, respondedAtISO, responseNote: 'Simulated demo decline response.' }, calendars: params.calendars, confirmedEventId: undefined };
  }

  if (params.invitation.status === 'accepted' && params.invitation.confirmedEventId) {
    return { invitation: { ...params.invitation, respondedAtISO, responseNote: 'Duplicate acceptance ignored.' }, calendars: params.calendars, confirmedEventId: params.invitation.confirmedEventId };
  }

  const eventId = params.invitation.confirmedEventId ?? `evt-${stableKey(params.invitation)}`;
  const updated = { ...params.calendars };
  [params.invitation.organizerId, ...params.invitation.invitedFriendIds].forEach((ownerId) => {
    const list = updated[ownerId] ?? [];
    if (!list.some((event) => event.id === eventId)) {
      list.push({ id: eventId, ownerId, title: params.activityTitle, startISO: params.invitation.timeSlot.startISO, endISO: params.invitation.timeSlot.endISO, location: params.invitation.location, status: 'confirmed', source: 'accepted-invitation' });
    }
    updated[ownerId] = list;
  });

  return { invitation: { ...params.invitation, status: 'accepted' as const, respondedAtISO, confirmedEventId: eventId, responseNote: 'Simulated demo acceptance response.' }, calendars: updated, confirmedEventId: eventId };
};
