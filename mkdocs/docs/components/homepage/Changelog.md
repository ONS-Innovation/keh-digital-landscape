# Changelog Component Documentation

The Changelog component displays a list of recent updates to the Digital Landscape fetched from GitHub releases, providing users with information about the latest changes and improvements.

## Props

The Changelog component does not accept any props as it fetches data directly from the GitHub API.

## Usage

```jsx
import Changelog from '../components/HomePage/Changelog';

function HomePage() {
  return (
    <div className="home-container">
      {/* Other homepage components */}
      <Changelog />
    </div>
  );
}
```

## Functionalities

The Changelog component implements the following features:

- Fetches release information from the GitHub API for the Digital Landscape repository
- Displays releases in chronological order with the most recent at the top
- Presents each release with:
  - Release title
  - Publication date in a readable format
  - List of changes with bullet points
  - Link to the full release on GitHub
- Provides expandable/collapsible entries to manage screen real estate
- Transforms GitHub URLs in the release notes into readable links:
  - Pull request links display as "Pull Request #number"
  - Compare links display as "Changelog Link"
- Implements pagination with a "Load more updates" button to fetch additional releases
- Provides loading indicators during data fetching
- Displays appropriate error messages if fetching fails

The component uses responsive design principles to ensure good readability across different screen sizes and includes interactive elements that maintain a consistent user experience with the rest of the application.
