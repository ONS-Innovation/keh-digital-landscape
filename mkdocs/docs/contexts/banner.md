# Banner Hook Documentation

## Overview

The Banner Hook provides a convenient way to display persistent informational messages to users. It utilises React's toast notifications with enhanced functionality for dismissal memory, ensuring users aren't repeatedly shown the same messages unnecessarily.

## Features

- **Persistent Notifications**: Displays important messages that remain visible until explicitly dismissed
- **Dismissal Memory**: Remembers when a user has dismissed a banner using local storage
- **Time-Based Reappearance**: Automatically shows banners again after a specified period (default: 7 days)
- **Customisable Messages**: Supports any message content to be displayed in the banner
- **Consistent Styling**: Utilises application theme variables for visual consistency

## Usage

The `useBanner` hook is designed to be simple to implement within any functional component.

```jsx
import { useBanner } from '../contexts/banner';

function MyComponent() {
  // Parameters: message text, unique local storage key
  useBanner("Welcome to our application! This is an important announcement.", "welcome-banner");
  
  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
```

## Parameters

The `useBanner` hook accepts two parameters:

1. **message** (string): The text content to display in the banner
2. **localStorageKey** (string): A unique identifier used to store dismissal information in the browser's local storage

## Implementation Details

The banner system works through the following process:

1. **Initial Check**: When a component mounts, the hook checks if the banner has been previously dismissed
2. **Dismissal Logic**: 
   - If the banner hasn't been dismissed before, it displays immediately
   - If dismissed, it checks when the dismissal occurred
   - If the dismissal was more than 7 days ago, it shows the banner again
3. **User Interaction**: When a user dismisses the banner, the current timestamp is stored in local storage
4. **Visual Presentation**: The banner appears as a toast notification in the bottom-right corner of the screen with an "Info" header and a checkmark button for dismissal

## Styling

The banner utilises custom CSS defined in `../styles/Banner.css` and leverages CSS variables for theming:

- `--info-box`: Background colour of the banner
- `--info-box-border`: Colour of the left border accent

## Best Practices

- Use unique `localStorageKey` values for different banners to ensure proper dismissal tracking
- Keep banner messages concise and informative
- Use banners sparingly for truly important information to avoid user fatigue
- Consider the timing of banner displays in your application flow

## Integration with Theme

The banner system integrates with the application's theme system, ensuring that banners maintain visual consistency with the rest of the interface regardless of whether light or dark mode is active.
