import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../state/AppContext';
import { formatDateTime, formatDateLabel } from '../domain/dateUtils';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getCalendarDays = (monthDate: Date) => {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startOffset = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const getDayColor = (fullness: number) => {
  if (fullness <= 0) return '#FFF7FB';
  if (fullness <= 0.2) return '#FFE4F1';
  if (fullness <= 0.4) return '#FFC7E8';
  if (fullness <= 0.6) return '#FFB0D9';
  if (fullness <= 0.8) return '#FF8AC4';
  return '#FF5AA8';
};

export const CalendarScreen = () => {
  const { state, currentUser, dispatch } = useApp();
  const events = state.calendars[currentUser.id] ?? [];

  const firstEventDate = events.length > 0 ? new Date(events[0].startISO) : new Date();
  const [displayMonth, setDisplayMonth] = useState(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), firstEventDate.getDate()));

  const dailyActivity = useMemo(() => {
    const map = new Map<string, { count: number; minutes: number }>();

    events.forEach((event) => {
      const date = new Date(event.startISO);
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
      const minutes = Math.max(0, (new Date(event.endISO).getTime() - new Date(event.startISO).getTime()) / 60000);
      const existing = map.get(key) ?? { count: 0, minutes: 0 };
      map.set(key, { count: existing.count + 1, minutes: existing.minutes + minutes });
    });

    return map;
  }, [events]);

  const calendarDays = useMemo(() => getCalendarDays(displayMonth), [displayMonth]);

  const selectedDayEvents = useMemo(() => {
    const key = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toISOString().slice(0, 10);
    return (events.filter((event) => {
      const eventDate = new Date(event.startISO);
      const eventKey = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).toISOString().slice(0, 10);
      return eventKey === key;
    })).sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  }, [events, selectedDate]);

  const goToMonth = (offset: number) => {
    const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + offset, 1);
    setDisplayMonth(nextMonth);

    const nextMonthDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    const nextKey = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1).toISOString().slice(0, 10);
    const monthMatch = events.find((event) => {
      const date = new Date(event.startISO);
      return date.getFullYear() === nextMonthDate.getFullYear() && date.getMonth() === nextMonthDate.getMonth();
    });

    setSelectedDate(monthMatch ? new Date(monthMatch.startISO) : nextMonthDate);
  };

  const monthLabel = displayMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity
          onPress={() => dispatch({
            type: 'ADD_MANUAL_EVENT',
            payload: {
              id: `manual-${Date.now()}`,
              ownerId: currentUser.id,
              title: 'Manual demo event',
              startISO: new Date(displayMonth.getFullYear(), displayMonth.getMonth(), selectedDate.getDate(), 16, 0, 0).toISOString(),
              endISO: new Date(displayMonth.getFullYear(), displayMonth.getMonth(), selectedDate.getDate(), 17, 0, 0).toISOString(),
              location: 'Demo location',
              status: 'tentative',
              source: 'manual'
            }
          })}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Confirmed and demo events for {currentUser.name}.</Text>

      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => goToMonth(-1)} style={styles.navButton}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => goToMonth(1)} style={styles.navButton}>
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {calendarDays.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={[styles.dayCell, styles.emptyCell]} />;
            }

            const isoKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
            const activity = dailyActivity.get(isoKey) ?? { count: 0, minutes: 0 };
            const fullness = Math.min(activity.minutes / 540, 1);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const isCurrentMonth = date.getMonth() === displayMonth.getMonth();

            return (
              <TouchableOpacity
                key={isoKey}
                style={[
                  styles.dayCell,
                  { backgroundColor: getDayColor(fullness) },
                  isSelected && styles.selectedCell,
                  !isCurrentMonth && styles.dimmedDayCell
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText, !isCurrentMonth && styles.dimmedDayText]}>
                  {date.getDate()}
                </Text>
                {activity.count > 0 && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailHeader}>{formatDateLabel(selectedDate.toISOString())}</Text>
        {selectedDayEvents.length > 0 ? (
          selectedDayEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventMarker} />
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>{formatDateTime(event.startISO)} - {formatDateTime(event.endISO)}</Text>
                <Text style={styles.eventMeta}>{event.location ?? 'No location listed'}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>No activity on this day.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fffafc'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4a234d'
  },
  subtitle: {
    color: '#7c6d89',
    marginBottom: 12,
    fontSize: 14
  },
  addButton: {
    backgroundColor: '#ff4fa3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#ffb6d8',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffeaf5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navText: {
    fontSize: 24,
    color: '#ff4fa3',
    fontWeight: '700'
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#5b315e'
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6
  },
  weekDayText: {
    color: '#7a5a7c',
    fontWeight: '700',
    fontSize: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  emptyCell: {
    backgroundColor: 'transparent',
    borderColor: 'transparent'
  },
  selectedCell: {
    borderColor: '#ff4fa3',
    borderWidth: 2,
  },
  dimmedDayCell: {
    opacity: 0.5
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#40213d'
  },
  selectedDayText: {
    color: '#ffffff'
  },
  dimmedDayText: {
    color: '#64748b'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(94, 45, 89, 0.8)',
    marginTop: 4
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    shadowColor: '#ffbfdc',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2
  },
  detailHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4b2647',
    marginBottom: 12
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ff'
  },
  eventMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff5aa8',
    marginRight: 10,
    marginTop: 6
  },
  eventTitle: {
    fontWeight: '700',
    color: '#3f1d3a',
    marginBottom: 2
  },
  eventMeta: {
    color: '#6a516c',
    fontSize: 13
  },
  emptyState: {
    color: '#7d607a',
    fontStyle: 'italic'
  }
});
