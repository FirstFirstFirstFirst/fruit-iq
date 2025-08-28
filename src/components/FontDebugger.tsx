import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const FontDebugger = () => {
  useEffect(() => {
    console.log('🔍 FontDebugger: Component mounted');
    console.log('📱 FontDebugger: Platform:', Platform.OS, Platform.Version);
    
    // Test if fonts are available
    const testFonts = [
      'Kanit-Light',
      'Kanit-Regular', 
      'Kanit-Medium',
      'Kanit-SemiBold',
      'Kanit-Bold',
      'Kanit-ExtraBold',
      'SpaceMono-Regular'
    ];
    
    testFonts.forEach(font => {
      console.log(`🔤 FontDebugger: Testing font availability: ${font}`);
    });
    
  }, []);

  const fontTests = [
    { name: 'Kanit-Light', text: 'Light Weight (น้อม)', weight: '300' },
    { name: 'Kanit-Regular', text: 'Regular Weight (ปกติ)', weight: '400' },
    { name: 'Kanit-Medium', text: 'Medium Weight (กลาง)', weight: '500' },
    { name: 'Kanit-SemiBold', text: 'SemiBold Weight (กึ่งหนา)', weight: '600' },
    { name: 'Kanit-Bold', text: 'Bold Weight (หนา)', weight: '700' },
    { name: 'Kanit-ExtraBold', text: 'ExtraBold Weight (หนามาก)', weight: '800' },
    { name: 'SpaceMono-Regular', text: 'SpaceMono Regular (Code)', weight: '400' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Font Loading Test</Text>
      <Text style={styles.info}>Platform: {Platform.OS} {Platform.Version}</Text>
      
      {fontTests.map((font, index) => (
        <View key={index} style={styles.fontTest}>
          <Text style={[styles.fontName]}>{font.name} ({font.weight})</Text>
          <Text style={[styles.testText, { fontFamily: font.name }]}>
            {font.text}
          </Text>
          <Text style={[styles.fallbackText]}>
            Fallback: {font.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  fontTest: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fontName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  testText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  fallbackText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default FontDebugger;