import React from 'react'
import { View, StyleSheet } from 'react-native'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children }: CardProps) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <View style={styles.cardHeader}>
      {children}
    </View>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children }: CardContentProps) {
  return (
    <View style={styles.cardContent}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  cardHeader: {
    marginBottom: 12
  },
  cardContent: {
    // Content has no specific styles
  }
})