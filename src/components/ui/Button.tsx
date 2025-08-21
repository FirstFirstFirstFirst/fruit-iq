import React, { forwardRef } from 'react';
import { Pressable, PressableProps, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-colors min-h-[60] px-6 py-4",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border-2 border-primary bg-transparent",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
      },
      size: {
        default: "min-h-[60] px-6 py-4 text-lg",
        sm: "min-h-[48] px-4 py-3 text-base",
        lg: "min-h-[72] px-8 py-5 text-xl",
        xl: "min-h-[80] px-10 py-6 text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const textVariants = cva("text-center font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-primary",
      secondary: "text-secondary-foreground",
      ghost: "text-primary",
    },
    size: {
      default: "text-lg",
      sm: "text-base",
      lg: "text-xl",
      xl: "text-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, textClassName, variant, size, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        accessibilityRole="button"
        {...props}
      >
        <Text className={cn(textVariants({ variant, size }), textClassName)}>
          {children}
        </Text>
      </Pressable>
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants, type ButtonProps };