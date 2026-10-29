import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { demoActivities } from '../data/demoData';
import { useApp } from '../state/AppContext';
import { EmptyState } from '../components/EmptyState';

export const RecommendationsScreen = () => {
  const { recommendations, state, dispatch, selectedSlot, currentUser, friends } = useApp();
  const data = recommendations.recommendations ?? [];
  return <ScrollView contentContainerStyle={{ padding: 16 }}><Text style={{ fontSize: 22, fontWeight: '800' }}>Recommendations</Text><Text style={{ color: '#64748b', marginBottom: 12 }}>Suggestions are based on shared availability, budget, location, and interests from simulated demo data.</Text><TouchableOpacity onPress={() => dispatch({ type: 'SET_BUDGET', payload: 'medium' })} style={{ padding: 10, marginBottom: 10, borderRadius: 12, backgroundColor: '#eef2ff' }}><Text>Demo filter: medium budget</Text></TouchableOpacity>{!selectedSlot ? <EmptyState title="Select a time slot" message="Pick a shared availability slot to see recommended activities." /> : data.length === 0 ? <EmptyState title="No matching recommendations" message={recommendations.reason ?? 'Relax a filter or choose another slot.'} /> : data.map((activity) => <View key={activity.id} style={{ marginBottom: 10, padding: 14, borderRadius: 14, backgroundColor: '#f8fafc' }}><Text style={{ fontWeight: '700' }}>{activity.title}</Text><Text>{activity.description}</Text><Text>Why suggested: {activity.reasons.join(' • ')}</Text><TouchableOpacity onPress={() => dispatch({ type: 'CREATE_INVITATION', payload: { id: `inv-${Date.now()}`, organizerId: currentUser.id, invitedFriendIds: friends.map((friend) => friend.id), activityId: activity.id, timeSlot: selectedSlot, location: activity.location, status: 'draft', createdAtISO: new Date().toISOString() } })} style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#4338ca' }}><Text style={{ color: 'white', textAlign: 'center' }}>Create simulated invitation</Text></TouchableOpacity></View>)}</ScrollView>;
};
