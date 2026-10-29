import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';
import { InvitationStatusBadge } from '../components/InvitationStatusBadge';

export const InvitationScreen = () => {
  const { state, dispatch } = useApp();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Invite flow</Text>
        <Text style={styles.title}>Invitation Workflow</Text>
        <Text style={styles.subtitle}>Demo responses update the local mock calendars instantly.</Text>
      </View>

      {state.invitations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No invitations created yet.</Text>
        </View>
      ) : (
        state.invitations.map((invitation) => (
          <View key={invitation.id} style={styles.inviteCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.inviteId}>Invitation {invitation.id}</Text>
              <InvitationStatusBadge status={invitation.status} />
            </View>

            <Text style={styles.detail}>Activity: {invitation.activityId}</Text>
            <Text style={styles.detail}>Time: {invitation.timeSlot.startISO} - {invitation.timeSlot.endISO}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => dispatch({ type: 'RESPOND_INVITATION', payload: { invitation, response: 'accept', activityTitle: invitation.activityId } })}
                style={[styles.actionButton, styles.acceptButton]}
              >
                <Text style={styles.actionText}>Simulate accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => dispatch({ type: 'RESPOND_INVITATION', payload: { invitation, response: 'decline', activityTitle: invitation.activityId } })}
                style={[styles.actionButton, styles.declineButton]}
              >
                <Text style={styles.actionText}>Simulate decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fffafc'
  },
  heroCard: {
    backgroundColor: '#f7ebff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ead9ff'
  },
  kicker: {
    color: '#9b5de5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#412754',
    marginBottom: 6
  },
  subtitle: {
    color: '#695776',
    fontSize: 14,
    lineHeight: 20
  },
  emptyCard: {
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ead9ff',
    padding: 16
  },
  emptyText: {
    color: '#5c4a73',
    fontWeight: '700'
  },
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ead9ff'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  inviteId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#412754'
  },
  detail: {
    color: '#5c4a73',
    marginTop: 4
  },
  buttonRow: {
    marginTop: 14,
    gap: 8
  },
  actionButton: {
    borderRadius: 12,
    padding: 10
  },
  acceptButton: {
    backgroundColor: '#32c48d'
  },
  declineButton: {
    backgroundColor: '#ff7a7a'
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800'
  }
});
