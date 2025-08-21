- never run npx expo start

# React Native + TailwindCSS + shadcn/ui Best Practices

## Commit Messages
- At the end of each iteration, provide a concise Git commit message WITHOUT running `git commit` INSTEAD run `npm run lint:fix`, `npm run lint` and `npm run typecheck `
- Include manual testing instructions: which screen, what functionality, and expected behavior

## Component Library & Architecture
- Use React Native Reusables as foundation for shadcn/ui components
- Install and configure: NativeWind v4, @rn-primitives, class-variance-authority (CVA)
- Use Expo Vector Icons for all icon needs

## Project Structure (MANDATORY)
```
src/
├── components/
│   ├── ui/           # shadcn-style components (Button, Input, Dialog, etc.)
│   ├── primitives/   # @rn-primitives base components  
│   ├── composite/    # Complex composed components
│   └── __tests__/    # Component tests
├── lib/
│   ├── utils.ts      # cn() function and utilities
│   └── constants.ts  # Theme constants, colors, spacing
├── hooks/            # Custom hooks
└── screens/          # Screen components
```

## Component Creation Rules
- ALWAYS use React Native Reusables patterns as base
- Every component MUST have:
  - `className` prop for styling customization
  - `variant` and `size` props where applicable (using CVA)
  - Proper TypeScript interface
  - forwardRef for ref handling
  - Accessibility props (accessibilityLabel, accessibilityRole)

## Component Template (FOLLOW EXACTLY)
```typescript
import React, { forwardRef } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  className?: string;
}

const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        accessibilityRole="button"
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants, type ButtonProps };
```

## Styling Rules
- ALWAYS use `cn()` utility for className merging
- Use CVA for component variants (never inline conditional classes)
- Follow TailwindCSS naming: primary/secondary/destructive colors
- Use semantic color names in constants.ts
- NEVER use StyleSheet.create (use NativeWind classes only)

## Testing Requirements  
- Every component MUST have a test file in `__tests__/`
- Test component rendering, props, variants, and accessibility
- Use React Native Testing Library
- Test template:
```typescript
import { render } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByRole } = render(<Button>Test</Button>);
    expect(getByRole('button')).toBeTruthy();
  });

  it('applies variant styles', () => {
    const { getByRole } = render(<Button variant="destructive">Test</Button>);
    // Test variant classes are applied
  });
});
```

## Import/Export Conventions
- Use named exports for components: `export { Button }`
- Create index.ts files for clean imports: `export * from './Button'`
- Import patterns:
  - React Native: `import { View, Text } from 'react-native'`
  - Utils: `import { cn } from '~/lib/utils'`
  - Components: `import { Button } from '~/components/ui'`
  - Icons: `import { MaterialIcons } from '@expo/vector-icons'`

## File Naming
- Components: PascalCase (`Button.tsx`, `DialogModal.tsx`)
- Utilities: camelCase (`utils.ts`, `constants.ts`)  
- Tests: match component name (`Button.test.tsx`)
- Screens: PascalCase with Screen suffix (`HomeScreen.tsx`)

## TypeScript Standards
- ALWAYS define proper interfaces for component props
- Extend React Native base props where applicable
- Use `VariantProps<typeof variants>` for CVA variants
- Export type definitions alongside components

