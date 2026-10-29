import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { demoActivities, demoEvents, demoFriends, demoUsers } from '../data/demoData';
import { computeSharedAvailability } from '../domain/availabilityService';
import { recommendActivities } from '../domain/recommendationService';
import { createInvitation, respondToInvitation } from '../domain/invitationService';
import { Activity, AppFilters, CalendarEvent, DemoUser, Invitation, TimeSlot } from '../domain/types';
import { appReducer, initialState } from './appReducer';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const currentUser = demoUsers.find((user) => user.id === state.currentUserId) ?? demoUsers[0];
  const friends = demoFriends.filter((friend) => state.selectedFriendIds.includes(friend.id));
  const participants = [currentUser, ...friends];
  const availability = computeSharedAvailability({ participants, calendars: state.calendars, dateRange: state.dateRange });
  const selectedSlot = availability.slots[state.selectedSlotIndex ?? 0];
  const recommendations = selectedSlot ? recommendActivities({ activities: demoActivities, slot: selectedSlot, groupSize: participants.length, location: state.selectedLocation, filters: state.filters, organizer: currentUser, friends }) : { recommendations: [], reason: 'Select a shared slot to see recommendations.' };

  const value = useMemo(() => ({ state, dispatch, currentUser, friends, participants, availability, selectedSlot, recommendations }), [state, currentUser, friends, participants, availability, selectedSlot, recommendations]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
