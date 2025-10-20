# ThemeToggle

The ThemeToggle component provides a simple button that allows users to switch between light and dark themes throughout the application. It integrates with the [ThemeContext](/contexts/themeContext) to maintain consistent theme state across all components and is used in the [Header](/components/header) component.

## Features

- Clear visual indication of the current theme with appropriate icons
- Includes proper ARIA labels for screen readers
- Works directly with the application's theme context
- Minimal footprint suitable for header placement
- Icon changes to reflect the current theme state

## Usage

```jsx
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function Header() {
  return (
    <header className="app-header">
      <div className="logo">Digital Landscape</div>
      <nav>{/* Navigation items */}</nav>
      <ThemeToggle />
    </header>
  );
}
```

## Implementation Details

The ThemeToggle component:

1. Uses the `useTheme` hook from ThemeContext to access the current theme state and toggle function
2. Renders a button with an icon that changes based on the current theme (sun for light mode, moon for dark mode)
3. Includes appropriate ARIA labels that update based on the current theme
4. Calls the `toggleTheme` function from the context when clicked

## Code Example

```jsx
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

## Styling

The ThemeToggle component uses dedicated CSS defined in `../../styles/components/ThemeToggle.css` with:

## Integration with ThemeContext

The ThemeToggle component relies on the ThemeContext to:

- Access the current theme state (`light` or `dark`)
- Trigger theme changes via the `toggleTheme` function
- Ensure theme changes persist across the application
