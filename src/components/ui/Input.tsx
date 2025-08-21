import React from 'react'
import { TextInput, Text, View } from 'react-native'
import { cn } from '../../lib/utils'

interface InputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'
  multiline?: boolean
  numberOfLines?: number
  disabled?: boolean
  error?: string
  className?: string
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  error,
  className
}: InputProps) {
  return (
    <View className={cn("mb-4", className)}>
      {label && (
        <Text className="text-thai-base font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={!disabled}
        className={cn(
          "px-4 py-3 border border-gray-300 rounded-lg text-thai-base min-h-[56px]",
          error && "border-red-500",
          disabled && "bg-gray-100 text-gray-500",
          "text-gray-900"
        )}
        placeholderTextColor="#9CA3AF"
      />
      {error && (
        <Text className="text-red-500 text-thai-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  )
}