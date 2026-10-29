import { demoEvents } from '../data/demoData';
import { createInvitation, respondToInvitation } from '../domain/invitationService';
import { Activity, AppFilters, CalendarEvent, Invitation } from '../domain/types';

export const initialState = {
  currentUserId: 'u1',
  selectedFriendIds: ['u2', 'u3'],
  selectedLocation: 'Downtown',
  dateRange: { startISO: '2026-11-01T00:00:00.000Z', endISO: '2026-11-01T23:59:59.000Z' },
  selectedSlotIndex: 0,
  filters: { budget: 'any' as const, interest: undefined, category: undefined },
  invitations: [] as Invitation[],
  calendars: demoEvents,
  ui: { loading: false, error: undefined as string | undefined }
};

export const appReducer = (state: typeof initialState, action: any) => {
  switch (action.type) {
    case 'SET_USER': return { ...state, currentUserId: action.payload };
    case 'TOGGLE_FRIEND': return { ...state, selectedFriendIds: state.selectedFriendIds.includes(action.payload) ? state.selectedFriendIds.filter((id) => id !== action.payload) : [...state.selectedFriendIds, action.payload] };
    case 'SET_LOCATION': return { ...state, selectedLocation: action.payload };
    case 'SET_BUDGET': return { ...state, filters: { ...state.filters, budget: action.payload } };
    case 'SET_INTEREST': return { ...state, filters: { ...state.filters, interest: action.payload } };
    case 'SET_CATEGORY': return { ...state, filters: { ...state.filters, category: action.payload } };
    case 'SET_DATE_RANGE': return { ...state, dateRange: action.payload };
    case 'SET_SELECTED_SLOT_INDEX': return { ...state, selectedSlotIndex: action.payload };
    case 'ADD_MANUAL_EVENT': {
      const event = action.payload as CalendarEvent;
      return { ...state, calendars: { ...state.calendars, [event.ownerId]: [...(state.calendars[event.ownerId] ?? []), event] } };
    }
    case 'CREATE_INVITATION': return { ...state, invitations: [createInvitation(action.payload), ...state.invitations] };
    case 'RESPOND_INVITATION': {
      const result = respondToInvitation({ invitation: action.payload.invitation, response: action.payload.response, calendars: state.calendars, activityTitle: action.payload.activityTitle });
      return { ...state, invitations: state.invitations.map((inv) => inv.id === result.invitation.id ? result.invitation : inv), calendars: result.calendars };
    }
    default: return state;
  }
};
