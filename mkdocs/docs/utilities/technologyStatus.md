# Technology Status Utility

The Technology Status utility provides a React hook for accessing and determining the status of technologies in the Tech Radar. It centralises access to the radar data and optimises performance by supporting both synchronous and asynchronous operations.

## Core Functionality

The utility exports a primary hook:

### useTechnologyStatus

```javascript
export const useTechnologyStatus = () => {
  // Implementation details
  return getTechnologyStatus;
}
```

This hook:

1. Returns a function that determines a technology's status (adopt, trial, assess, hold)
2. Accesses radar data via the DataContext
3. Supports both synchronous access (when data is available) and asynchronous access (returns a Promise)
4. Implements filtering to exclude technologies with "review" or "ignore" status

## Function Returned by the Hook

The `useTechnologyStatus` hook returns a function with the following signature:

```javascript
const getTechnologyStatus = (tech) => {
  // Implementation details
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tech` | string | The technology name to check status for |
| Returns | string\|null\|Promise | The status string ("adopt", "trial", "assess", "hold"), null if not found, or a Promise that resolves to status/null |

## Implementation Details

The implementation follows a flexible, performance-optimised approach:

1. **Context Integration**: Uses React's Context API via the DataContext

    - Accesses cached radar data for immediate response when available
    - Automatically retrieves radar data when needed

2. **Synchronous Operation**: Returns immediate results when data is available

    - Allows for direct usage in render functions without async handling
    - Prevents unnecessary re-renders

3. **Asynchronous Fallback**: Returns a Promise when data needs to be fetched

    - Transparently handles data loading when necessary
    - Maintains API consistency regardless of data availability state

4. **Status Determination Logic**: Identifies the current status of a technology

    - Finds the technology in radar entries by case-insensitive matching
    - Retrieves the most recent timeline entry for status
    - Filters out technologies with "review" or "ignore" status 
    - Returns a normalised lowercase status for consistent usage

## Usage in Components

The hook is designed for flexible usage within components:

RadarPage:
```javascript

  /**
   * renderTechnologyList function to render the technology list.
   *
   * @param {string} technologies - The technologies to render.
   * @returns {JSX.Element|null} - The rendered technology list or null if not found.
   */
  const renderTechnologyList = (technologies) => {
    if (!technologies) return null;

    return technologies.split(";").map((tech, index) => {
      const trimmedTech = tech.trim();
      const status = getTechnologyStatus(trimmedTech);

      return (
        <span key={index}>
          {index > 0 && "; "}
          {status ? (
            <span
              className={`clickable-tech ${status}`}
              onClick={() => handleTechClick(trimmedTech)}
            >
              {trimmedTech}
            </span>
          ) : (
            trimmedTech
          )}
        </span>
      );
    });
  };
```

## Integration with RadarPage and ProjectsPage

Both the RadarPage and ProjectsPage leverage this utility to:

1. Determine if technologies should be clickable based on their status
2. Apply appropriate styling based on the technology's status
3. Create consistent visual indicators for technology adoption levels
4. Filter out technologies that should not be highlighted (those with "review" or "ignore" status)

## Special Technology Matching

The utility works alongside special technology matchers (`getSpecialTechMatchers.js`) to handle technology grouping:

- **Purpose**: Maps individual language variants (e.g., "Javascript", "Typescript") to their consolidated Tech Radar entries (e.g., "Javascript/Typescript")
- **Usage in Statistics**: The Statistics component uses these matchers to determine if a language is on the radar and should be clickable
- **Usage in RadarPage**: When navigating from Statistics to RadarPage, the mapped technology name is used to locate the correct radar entry
- **Example**: Clicking "Javascript" in Statistics will navigate to the "Javascript/Typescript" entry on the radar

This ensures consistent technology grouping across all pages without requiring duplicate Tech Radar entries.

## Error Handling

The utility implements comprehensive error handling:

- Returns null for invalid or missing technology inputs
- Handles missing or incomplete radar data gracefully
- Maintains consistent behaviour in both synchronous and asynchronous modes
- Safely navigates potentially undefined properties in the radar data structure
