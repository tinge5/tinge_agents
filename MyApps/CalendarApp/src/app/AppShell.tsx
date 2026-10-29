import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { AppProvider } from '../state/AppContext';
import { DemoEntryScreen } from '../screens/DemoEntryScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { AvailabilityScreen } from '../screens/AvailabilityScreen';
import { RecommendationsScreen } from '../screens/RecommendationsScreen';
import { InvitationScreen } from '../screens/InvitationScreen';

const Tab = createMaterialTopTabNavigator();

export const AppShell = () => (
  <AppProvider>
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Calendar"
        screenOptions={{
          tabBarActiveTintColor: '#ff4fa3',
          tabBarInactiveTintColor: '#7c6d89',
          tabBarIndicatorStyle: { backgroundColor: '#ff4fa3', height: 3 },
          tabBarStyle: {
            backgroundColor: '#fff2f8',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#ffd4eb'
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700', textTransform: 'none' },
          tabBarItemStyle: { paddingVertical: 10 },
          tabBarPressColor: '#ffd4eb'
        }}
      >
        <Tab.Screen name="Demo" component={DemoEntryScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Friends" component={FriendsScreen} />
        <Tab.Screen name="Availability" component={AvailabilityScreen} />
        <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
        <Tab.Screen name="Invitations" component={InvitationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  </AppProvider>
);
