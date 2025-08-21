import React from 'react'
import { View } from 'react-native'
import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={cn(
      "bg-white rounded-xl p-4 shadow-sm border border-gray-100",
      className
    )}>
      {children}
    </View>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <View className={cn("mb-3", className)}>
      {children}
    </View>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <View className={cn("", className)}>
      {children}
    </View>
  )
}