import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import AnalyticsScreen from './screens/AnalyticsScreen';
import LMSScreen from './screens/LMSScreen';
import AIChatScreen from './screens/AIChatScreen';
import JobPortalScreen from './screens/JobPortalScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import { COLORS, FONTS } from './theme';

const Tab = createBottomTabNavigator();

// Each tab carries its module's colour, so the active tab tints to match the
// rule in that screen's header.
const TAB_COLORS = {
  Analytics: COLORS.analytics,
  Learning: COLORS.lms,
  Assistant: COLORS.chat,
  Jobs: COLORS.jobs,
  Submissions: COLORS.projects,
};

// A filled square when active, hollow when not — reads clearly at 10px and
// keeps the flat, hard-edged language of the cards.
function TabMark({ color, focused }) {
  return (
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 2,
        borderWidth: 2,
        borderColor: focused ? color : COLORS.placeholder,
        backgroundColor: focused ? color : 'transparent',
      }}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: TAB_COLORS[route.name],
            tabBarInactiveTintColor: COLORS.placeholder,
            tabBarStyle: {
              backgroundColor: COLORS.card,
              borderTopWidth: 2,
              borderTopColor: COLORS.heading,
              height: 64,
              paddingTop: 9,
              paddingBottom: 9,
            },
            tabBarIconStyle: { flex: 0, height: 12 },
            tabBarLabelStyle: {
              fontFamily: FONTS.body,
              fontSize: 9,
              fontWeight: '700',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginTop: 6,
              marginBottom: 0,
            },
            tabBarIcon: ({ focused }) => (
              <TabMark color={TAB_COLORS[route.name]} focused={focused} />
            ),
          })}
        >
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
          <Tab.Screen name="Learning" component={LMSScreen} />
          <Tab.Screen name="Assistant" component={AIChatScreen} />
          <Tab.Screen name="Jobs" component={JobPortalScreen} />
          <Tab.Screen name="Submissions" component={ProjectsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
