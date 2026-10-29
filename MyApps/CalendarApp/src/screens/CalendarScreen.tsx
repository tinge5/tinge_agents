import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';
import { formatDateTime } from '../domain/dateUtils';

export const CalendarScreen = () => {
  const { state, currentUser, dispatch } = useApp();
  const events = state.calendars[currentUser.id] ?? [];
  return <ScrollView contentContainerStyle={{ padding: 16 }}><Text style={{ fontSize: 22, fontWeight: '800' }}>Calendar</Text><Text style={{ color: '#64748b', marginBottom: 12 }}>Confirmed and demo events for {currentUser.name}.</Text>{events.map((event) => <View key={event.id} style={{ marginBottom: 10, padding: 14, borderRadius: 14, backgroundColor: '#f8fafc' }}><Text style={{ fontWeight: '700' }}>{event.title}</Text><Text>{formatDateTime(event.startISO)} - {formatDateTime(event.endISO)}</Text><Text>{event.location ?? 'No location listed'}</Text></View>)}<TouchableOpacity onPress={() => dispatch({ type: 'ADD_MANUAL_EVENT', payload: { id: `manual-${Date.now()}`, ownerId: currentUser.id, title: 'Manual demo event', startISO: '2026-11-01T16:00:00.000Z', endISO: '2026-11-01T17:00:00.000Z', location: 'Demo location', status: 'tentative', source: 'manual' } })} style={{ padding: 14, borderRadius: 14, backgroundColor: '#4338ca' }}><Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Add mock event</Text></TouchableOpacity></ScrollView>;
};
