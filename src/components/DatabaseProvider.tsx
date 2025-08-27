/**
 * Database Provider Component
 * Initializes the database and provides loading state for the entire app
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDatabase } from '../hooks/useDatabase';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export default function DatabaseProvider({ children }: DatabaseProviderProps) {
  const { isInitialized, error } = useDatabase();

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MaterialIcons name="error" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>เกิดข้อผิดพลาด</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>กรุณาปิดและเปิดแอปใหม่อีกครั้ง</Text>
        </View>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MaterialIcons name="storage" size={64} color="#B46A07" />
          <ActivityIndicator size="large" color="#B46A07" style={styles.loader} />
          <Text style={styles.loadingTitle}>เริ่มต้นระบบ</Text>
          <Text style={styles.loadingText}>กำลังตั้งค่าฐานข้อมูล...</Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loader: {
    marginTop: 24,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});