import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import FontDebugger from '../src/components/FontDebugger';

export default function DebugFontsScreen() {
  console.log('🔍 DebugFontsScreen: Rendering font debug screen');
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <FontDebugger />
      </ScrollView>
    </SafeAreaView>
  );
}