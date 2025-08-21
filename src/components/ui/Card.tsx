import React from 'react';
import { View, ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const cardVariants = cva(
  "bg-card border border-border rounded-xl shadow-sm",
  {
    variants: {
      padding: {
        default: "p-4",
        sm: "p-3",
        lg: "p-6",
        none: "p-0",
      },
    },
    defaultVariants: {
      padding: "default",
    },
  }
);

interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {
  className?: string;
}

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, padding, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(cardVariants({ padding }), className)}
      {...props}
    />
  )
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("pb-3", className)}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  )
);

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("pt-3", className)}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };