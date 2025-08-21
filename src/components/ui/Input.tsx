import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const inputVariants = cva(
  "border-2 rounded-xl px-4 py-4 text-lg bg-background min-h-[60]",
  {
    variants: {
      variant: {
        default: "border-input text-foreground",
        error: "border-destructive text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface InputProps extends TextInputProps, VariantProps<typeof inputVariants> {
  className?: string;
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, containerClassName, variant, label, error, ...props }, ref) => {
    return (
      <View className={cn("gap-2", containerClassName)}>
        {label && (
          <Text className="text-base font-medium text-foreground mb-1">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(inputVariants({ variant: error ? "error" : variant }), className)}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {error && (
          <Text className="text-sm text-destructive mt-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
export { Input, inputVariants, type InputProps };