import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';
import { EmptyState } from '../components/EmptyState';
import { formatDateTime } from '../domain/dateUtils';

export const AvailabilityScreen = () => {
  const { state, dispatch, availability } = useApp();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Shared spread</Text>
        <Text style={styles.title}>Shared Availability</Text>
        <Text style={styles.subtitle}>All results are computed from the demo calendars you’ve selected.</Text>
      </View>

      <View style={styles.dateBlock}>
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Start</Text>
          <TextInput
            value={state.dateRange.startISO.slice(0, 10)}
            onChangeText={(text) => dispatch({ type: 'SET_DATE_RANGE', payload: { ...state.dateRange, startISO: `${text}T00:00:00.000Z` } })}
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>End</Text>
          <TextInput
            value={state.dateRange.endISO.slice(0, 10)}
            onChangeText={(text) => dispatch({ type: 'SET_DATE_RANGE', payload: { ...state.dateRange, endISO: `${text}T23:59:59.000Z` } })}
            style={styles.input}
          />
        </View>
      </View>

      {availability.slots.length === 0 ? (
        <EmptyState title="No common availability" message={availability.reason ?? 'Try another group or date range.'} />
      ) : (
        availability.slots.map((slot, index) => (
          <TouchableOpacity
            key={`${slot.startISO}-${index}`}
            onPress={() => dispatch({ type: 'SET_SELECTED_SLOT_INDEX', payload: index })}
            style={[styles.slotCard, index === state.selectedSlotIndex && styles.selectedSlotCard]}
          >
            <View style={styles.slotDot} />
            <View style={styles.slotTextWrap}>
              <Text style={styles.slotTime}>{formatDateTime(slot.startISO)} - {formatDateTime(slot.endISO)}</Text>
              <Text style={styles.slotMeta}>{slot.durationMinutes} minutes free</Text>
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#fff1d8',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe7b8'
  },
  kicker: {
    color: '#f6a623',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5d3d16',
    marginBottom: 6
  },
  subtitle: {
    color: '#7d644a',
    fontSize: 14,
    lineHeight: 20
  },
  dateBlock: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f3e8c1',
    padding: 12,
    marginBottom: 14
  },
  inputWrap: {
    marginBottom: 10
  },
  label: {
    color: '#7d644a',
    fontWeight: '700',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#f4c978',
    backgroundColor: '#fffaf1',
    padding: 10,
    borderRadius: 12,
    color: '#5d3d16'
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f8e7b8'
  },
  selectedSlotCard: {
    backgroundColor: '#fff8df',
    borderColor: '#f6a623'
  },
  slotDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f6a623',
    marginRight: 12
  },
  slotTextWrap: {
    flex: 1
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4d382b'
  },
  slotMeta: {
    color: '#7d644a',
    marginTop: 4
  }
});
