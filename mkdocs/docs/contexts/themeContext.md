# Theme Context Documentation

## Overview

The Theme Context provides a centralised way to manage the application's theme state (light or dark mode) throughout the component tree. It utilises React's Context API to make the theme accessible to any component without prop drilling.

## Components and Hooks

### ThemeProvider

The `ThemeProvider` is a wrapper component that establishes the theme context for its children. It should be placed high in the component hierarchy, typically around your application's root component.

#### Features

- **Theme Persistence**: Automatically saves the user's theme preference to local storage
- **Theme Application**: Applies the selected theme to the document by adding appropriate CSS classes
- **Toast Integration**: Includes a pre-configured toast notification system that respects the current theme

#### Usage

```jsx
import { ThemeProvider } from '../contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your application components */}
    </ThemeProvider>
  );
}
```

### useTheme Hook

The `useTheme` hook provides access to the current theme state and functionality to toggle between themes.

#### Returns

- `theme`: The current theme value ('light' or 'dark')
- `toggleTheme`: A function to switch between light and dark themes

#### Usage

```jsx
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## Implementation Details

The theme context uses React's useState and useEffect hooks to:

1. Initialise the theme from local storage or default to 'light'
2. Persist theme changes to local storage
3. Apply theme classes to the document and body elements
4. Provide a simple toggle mechanism between 'light' and 'dark' modes

## Error Handling

The `useTheme` hook will throw an error if used outside of a `ThemeProvider`. Always ensure components using this hook are descendants of a `ThemeProvider` component.

## Toast Notifications

The ThemeProvider includes a pre-configured toast notification system (using react-hot-toast) that:

- Positions toasts in the bottom-right corner
- Applies theme-consistent styling to all notifications
- Sets a default duration of 3 seconds for each toast

## Best Practices

- Place the `ThemeProvider` at the root of your application
- Use the `useTheme` hook to access theme information rather than creating separate state
- Leverage CSS variables defined in your theme to ensure consistent styling

