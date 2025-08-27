import React from 'react'
import { Pressable, Text, ActivityIndicator, View, StyleSheet, ViewStyle, TextStyle } from 'react-native'

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
  loading = false
}: ButtonProps) {
  
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button]
    
    if (size === 'sm') baseStyle.push(styles.smSize)
    if (size === 'md') baseStyle.push(styles.mdSize)
    if (size === 'lg') baseStyle.push(styles.lgSize)
    
    if (variant === 'primary') baseStyle.push(styles.primaryButton)
    if (variant === 'secondary') baseStyle.push(styles.secondaryButton)
    if (variant === 'outline') baseStyle.push(styles.outlineButton)
    if (disabled) baseStyle.push(styles.disabled)
    
    return baseStyle
  }
  
  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text]
    
    if (size === 'sm') baseStyle.push(styles.smText)
    if (size === 'md') baseStyle.push(styles.mdText)
    if (size === 'lg') baseStyle.push(styles.lgText)
    
    if (variant === 'primary') baseStyle.push(styles.primaryText)
    if (variant === 'secondary') baseStyle.push(styles.secondaryText)
    if (variant === 'outline') baseStyle.push(styles.outlineText)
    
    return baseStyle
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? 'white' : '#3b82f6'} 
            style={styles.loader}
          />
        )}
        <Text style={getTextStyle()}>
          {children}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create<{
  button: ViewStyle;
  content: ViewStyle;
  text: TextStyle;
  loader: ViewStyle;
  primaryButton: ViewStyle;
  secondaryButton: ViewStyle;
  outlineButton: ViewStyle;
  primaryText: TextStyle;
  secondaryText: TextStyle;
  outlineText: TextStyle;
  smSize: ViewStyle;
  mdSize: ViewStyle;
  lgSize: ViewStyle;
  smText: TextStyle;
  mdText: TextStyle;
  lgText: TextStyle;
  disabled: ViewStyle;
}>({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '500',
  },
  loader: {
    marginRight: 8,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  
  // Text colors
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#1f2937',
  },
  outlineText: {
    color: '#3b82f6',
  },
  
  // Sizes
  smSize: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  mdSize: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 44,
  },
  lgSize: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Text sizes
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  
  disabled: {
    opacity: 0.5,
  },
})