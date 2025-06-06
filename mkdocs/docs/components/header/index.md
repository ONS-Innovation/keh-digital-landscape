# Header Component

The Header component serves as the primary navigation interface for the Digital Landscape application. It provides users with essential navigation controls, search functionality, and application settings in a consistent, accessible manner across all pages.

## Props

The Header component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchTerm` | string | `""` | The current search term displayed in the search input |
| `onSearchChange` | function | `() => {}` | Handler function called when the search term changes |
| `searchResults` | array | `[]` | Array of search results to display in the dropdown |
| `onSearchResultClick` | function | `() => {}` | Handler function called when a search result is clicked |
| `onOpenProjects` | function | `() => {}` | Handler function called when the projects button is clicked |
| `onStatsTechClick` | function | `() => {}` | Handler function called when a technology is clicked in statistics |
| `hideSearch` | boolean | `false` | Whether to hide the search functionality |

## Usage

```jsx
import Header from '../components/Header/Header';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    // Perform search and update results
  };
  
  const handleSearchResultClick = (result) => {
    // Handle result selection
  };
  
  return (
    <div className="app">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        onSearchResultClick={handleSearchResultClick}
      />
      {/* Rest of application */}
    </div>
  );
}
```

## Search Functionality

The Header component provides a context-aware search system that:

- Adapts placeholder text based on the current route
- Supports keyboard shortcuts (⌘+K on macOS, CTRL+K on Windows/Linux)
- Displays relevant search results in a dropdown
- Allows for clearing the search with a single click

The search shortcut is displayed to users within the search box when empty, automatically adapting to show the appropriate key combination based on the user's operating system.

## Logo and Navigation

The Header provides:

- Organisation logo that serves as a link to the homepage
- Digital Landscape title that also links to the homepage

## Mobile Responsiveness

On smaller screens, the Header:

- Maintains the logo and app title for branding
- Preserves the search functionality with full capability
- Provides access to navigation through the `MenuDropdown` component
- Includes a compact ThemeToggle for switching between light and dark modes

## Styling

The Header component uses dedicated CSS defined in `../../styles/components/Header.css` and leverages the application's theme system for consistent visual presentation.

## Keyboard Accessibility

The Header implements accessibility features including:

- Keyboard shortcut for search focus (⌘+K/CTRL+K)
- Auto-detection of OS for displaying appropriate shortcut key hints
- Clear search button for quickly resetting searches

## Theme Integration

The Header integrates with the application's theme system through the [ThemeToggle](/components/themeToggle) component, allowing users to switch between light and dark modes.
