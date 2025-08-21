import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SetupScreen } from './src/screens/SetupScreen';
import { CameraScreen } from './src/screens/CameraScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Setup">
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen}
          options={{ title: 'ตั้งค่าผลไม้' }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{ title: 'ถ่ายภาพตาชั่ง' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
