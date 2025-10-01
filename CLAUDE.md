- never run npx expo start
- always watchout for conflict in library

## NULL Pointer Best Practice
- Initialize state and props with safe defaults
Always give useState an initial value and use default values in destructuring or defaultProps so components don’t assume a prop exists. (React uses default values when prop is undefined, not when explicitly null.)
```typescript 
function Profile({ user = {} }: { user?: { name?: string } }) {
  const [items, setItems] = useState<string[]>([]); // not undefined
  return <Text>{user.name ?? '—'}</Text>;
}
```
- Prefer optional chaining (?.) and nullish coalescing (??)
Short, safe access to nested properties and safe defaults instead of obj.x.y that throws. Use ?. when any intermediate may be null/undefined and ?? to provide a fallback only for null/undefined. 
```typescript 
const name = user?.profile?.displayName ?? 'Guest';
```
- Guard native module / ref calls
Before calling a method on a native module, ref, or imperative API check it exists. Native code can be null (broken linking, arch mismatch) and will throw a Java NPE on Android. Example: if (cameraRef?.current) cameraRef.current.start().
```typescript 
if (cameraRef?.current) {
  cameraRef.current.takePictureAsync();
}
```
- Validate external data (use runtime validators)
Don’t trust the network. Validate API responses with a runtime schema (Zod/io-ts) before using nested fields. This prevents downstream undefined/null access.
```typescript 
const user = userSchema.parse(await api.get('/me'));
```
- Avoid deep destructuring without guards
const { a: { b } } = obj; will throw if a is undefined. Use safe destructure with defaults:
```typescript 
const { a = {} } = obj ?? {};
const b = a.b;
```
- Use defensive lifecycle / async patterns
Cancel async work in useEffect cleanup or guard state updates after unmount to avoid racing into a component that no longer exists:
```typescript 
useEffect(() => {
  let mounted = true;

  const fetchAsync = async () => {
    try {
      const data = await fetchData();      // await the promise
      if (!mounted) return;                // guard against unmounted component
      setState(data);
    } catch (err) {
      if (!mounted) return;
      console.error(err);                  // handle error as needed
    }
  };

  fetchAsync();
  return () => { mounted = false; };      // cleanup
}, []);

```

## Commit Messages
- At the end of each iteration, provide a concise Git commit message WITHOUT running `git commit` INSTEAD run `npm run lint:fix`, `npm run lint` and `npm run typecheck `
- Include manual testing instructions: which screen, what functionality, and expected behavior

## Component Library & Architecture
- Use NativeWind v4 for primary styling with TailwindCSS classes
- StyleSheet.create is acceptable for complex layouts and platform-specific styles
- Use Expo Vector Icons (@expo/vector-icons) for all icon needs
- SQLite (expo-sqlite) for persistent data storage
- Custom hooks pattern for database operations and state management

## Project Structure (MANDATORY)
```
app/                    # Expo Router file-based routing
├── (tabs)/            # Tab navigation screens
├── _layout.tsx        # Root layout with providers
└── +not-found.tsx     # 404 screen

src/
├── components/        # Reusable UI components
│   ├── ui/           # Basic UI components (Button, Input, etc.)
│   └── [feature]/    # Feature-specific components
├── lib/
│   ├── utils.ts      # Utility functions and formatters
│   ├── database.ts   # SQLite database operations
│   ├── promptpay.ts  # PromptPay QR code generation
│   └── constants.ts  # App constants and configuration
├── hooks/            # Custom React hooks (useDatabase, etc.)
├── data/             # Type definitions and mock data
└── screens/          # Legacy screen components (if needed)

components/            # Root-level legacy components (migrate to src/)
assets/               # Static assets (fonts, images, icons)
```

## Component Creation Rules
- Follow consistent TypeScript patterns with proper interfaces
- Every component MUST have:
  - Proper TypeScript interface for props
  - Accessibility props (accessibilityLabel, accessibilityRole) where applicable
  - Consistent styling approach (NativeWind + StyleSheet as needed)
  - Error handling and loading states for data components
  - Proper font family usage (Kanit family for Thai text)

## Component Template (WeighPay Pattern)
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof MaterialIcons.glyphMap;
  loading?: boolean;
}

export default function Button({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  icon,
  loading = false,
  style,
  ...props 
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        style
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={loading}
      {...props}
    >
      {icon && <MaterialIcons name={icon} size={20} color="white" />}
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  primary: {
    backgroundColor: '#B46A07',
  },
  secondary: {
    backgroundColor: '#6b7280',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontFamily: 'Kanit-SemiBold',
    fontSize: 16,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  destructiveText: {
    color: 'white',
  },
});
```

## Styling Rules
- Use StyleSheet.create for complex component styling and layouts
- NativeWind classes can be used for simple utilities and spacing
- Follow consistent color scheme: #B46A07 (primary), standard destructive/secondary colors  
- Use Kanit font family consistently for Thai text readability
- Maintain responsive design with Dimensions.get('window') for screen adaptation
- Include proper shadow/elevation for cards and interactive elements

## Code Quality Requirements  
- Every component MUST pass lint and typecheck validation
- Run `npm run lint:fix`, `npm run lint` and `npm run typecheck` before considering work complete
- Fix all TypeScript errors and ESLint warnings
- Ensure proper type definitions and accessibility props

## Import/Export Conventions
- Use default exports for components: `export default ComponentName`
- Import patterns:
  - React Native: `import { View, Text, StyleSheet } from 'react-native'`
  - Utils: `import { formatThaiCurrency } from '../../src/lib/utils'`
  - Components: `import ComponentName from '../../src/components/ComponentName'`
  - Icons: `import { MaterialIcons } from '@expo/vector-icons'`
  - Database: `import { useFruits, useTransactions } from '../../src/hooks/useDatabase'`
  - Navigation: `import { useRouter } from 'expo-router'`

## File Naming
- Components: PascalCase (`Button.tsx`, `DialogModal.tsx`)
- Utilities: camelCase (`utils.ts`, `constants.ts`)  
- Screens: PascalCase with Screen suffix (`HomeScreen.tsx`)

## TypeScript Standards
- ALWAYS define proper interfaces for component props
- Extend React Native base props where applicable
- Use `VariantProps<typeof variants>` for CVA variants
- Export type definitions alongside components

## Commit Messages
- At the end of each iteration, provide a concise Git commit message WITHOUT running `git commit` INSTEAD run `npm run lint:fix`, `npm run lint` and `npm run typecheck `
- Include manual testing instructions: which screen, what functionality, and expected behavior

## Tips
- This application is in the precustomer production prototype stage