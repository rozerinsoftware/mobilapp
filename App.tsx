import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import GenreMoviesScreen from './src/screens/GenreMoviesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Kategoriler') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Arama') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'İzleme Listem') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Kategoriler" component={CategoriesScreen} />
      <Tab.Screen name="Arama" component={SearchScreen} />
      <Tab.Screen name="İzleme Listem" component={WatchlistScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MovieDetail"
          component={MovieDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GenreMovies"
          component={GenreMoviesScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
      
      {/* Web için global CSS */}
      <style>
        {`
          /* Web scroll bar stilleri */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #007AFF;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #0056CC;
          }
          
          /* FlatList ve ScrollView için scroll bar görünürlüğü */
          .scroll-view, .flat-list {
            scrollbar-width: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          /* Tüm scrollable elementler için */
          * {
            scrollbar-width: auto !important;
          }
        `}
      </style>
    </NavigationContainer>
  );
}
