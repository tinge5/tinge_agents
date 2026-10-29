import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';
import { InvitationStatusBadge } from '../components/InvitationStatusBadge';

export const InvitationScreen = () => {
  const { state, dispatch } = useApp();
  return <ScrollView contentContainerStyle={{ padding: 16 }}><Text style={{ fontSize: 22, fontWeight: '800' }}>Invitation Workflow</Text><Text style={{ color: '#64748b', marginBottom: 12 }}>Responses below are simulated demo actions. Accepted events are added locally to mock calendars.</Text>{state.invitations.length === 0 ? <Text>No invitations created yet.</Text> : state.invitations.map((invitation) => <View key={invitation.id} style={{ marginBottom: 12, padding: 14, borderRadius: 14, backgroundColor: '#f8fafc' }}><InvitationStatusBadge status={invitation.status} /><Text style={{ marginTop: 8, fontWeight: '700' }}>Invitation {invitation.id}</Text><Text>Activity: {invitation.activityId}</Text><Text>Time: {invitation.timeSlot.startISO} - {invitation.timeSlot.endISO}</Text><TouchableOpacity onPress={() => dispatch({ type: 'RESPOND_INVITATION', payload: { invitation, response: 'accept', activityTitle: invitation.activityId } })} style={{ marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: '#16a34a' }}><Text style={{ color: 'white', textAlign: 'center' }}>Simulate accept</Text></TouchableOpacity><TouchableOpacity onPress={() => dispatch({ type: 'RESPOND_INVITATION', payload: { invitation, response: 'decline', activityTitle: invitation.activityId } })} style={{ marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: '#dc2626' }}><Text style={{ color: 'white', textAlign: 'center' }}>Simulate decline</Text></TouchableOpacity></View>)}</ScrollView>;
};
