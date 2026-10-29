import React from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useApp } from '../state/AppContext';
import { EmptyState } from '../components/EmptyState';
import { formatDateTime } from '../domain/dateUtils';

export const AvailabilityScreen = () => {
  const { state, dispatch, availability } = useApp();
  return <ScrollView contentContainerStyle={{ padding: 16 }}><Text style={{ fontSize: 22, fontWeight: '800' }}>Shared Availability</Text><Text style={{ color: '#64748b', marginBottom: 12 }}>All availability results are computed from deterministic local demo calendars.</Text><TextInput value={state.dateRange.startISO.slice(0,10)} onChangeText={(text) => dispatch({ type: 'SET_DATE_RANGE', payload: { ...state.dateRange, startISO: `${text}T00:00:00.000Z` } })} style={{ borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 12, marginBottom: 8 }} /><TextInput value={state.dateRange.endISO.slice(0,10)} onChangeText={(text) => dispatch({ type: 'SET_DATE_RANGE', payload: { ...state.dateRange, endISO: `${text}T23:59:59.000Z` } })} style={{ borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 12, marginBottom: 12 }} />{availability.slots.length === 0 ? <EmptyState title="No common availability" message={availability.reason ?? 'Try another group or date range.'} /> : availability.slots.map((slot, index) => <View key={`${slot.startISO}-${index}`} style={{ marginBottom: 10, padding: 14, borderRadius: 14, backgroundColor: index === state.selectedSlotIndex ? '#c7d2fe' : '#f8fafc' }}><Text style={{ fontWeight: '700' }}>{formatDateTime(slot.startISO)} - {formatDateTime(slot.endISO)}</Text><Text>{slot.durationMinutes} minutes free</Text></View>)}</ScrollView>;
};
