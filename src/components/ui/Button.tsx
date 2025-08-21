import React from 'react'
import { Pressable, Text, ActivityIndicator, View } from 'react-native'
import { cn } from '../../lib/utils'

interface ButtonProps {
  children: React.ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function Button({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  disabled = false, 
  loading = false,
  className 
}: ButtonProps) {
  const baseStyles = "flex items-center justify-center rounded-lg font-medium"
  
  const variantStyles = {
    primary: "bg-primary-500 active:bg-primary-600",
    secondary: "bg-gray-200 active:bg-gray-300",
    outline: "bg-transparent border-2 border-primary-500 active:bg-primary-50"
  }
  
  const sizeStyles = {
    sm: "px-4 py-2 min-h-[48px]",
    md: "px-6 py-3 min-h-[56px]", 
    lg: "px-8 py-4 min-h-[64px]"
  }
  
  const textStyles = {
    primary: "text-white",
    secondary: "text-gray-800",
    outline: "text-primary-500"
  }
  
  const textSizes = {
    sm: "text-thai-base",
    md: "text-thai-lg",
    lg: "text-thai-xl"
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50",
        className
      )}
    >
      <View className="flex-row items-center">
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? 'white' : '#22c55e'} 
            className="mr-2"
          />
        )}
        <Text 
          className={cn(
            textStyles[variant],
            textSizes[size],
            "font-medium"
          )}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  )
}