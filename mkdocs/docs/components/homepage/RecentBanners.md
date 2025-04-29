# RecentBanners Component Documentation

The RecentBanners component displays a collection of recent announcements that appear as banners across different pages of the Digital Landscape application, providing users with important notifications and updates.

## Props

The RecentBanners component does not accept any props as it fetches data directly from the API.

## Usage

```jsx
import RecentBanners from '../components/HomePage/RecentBanners';

function HomePage() {
  return (
    <div className="home-container">
      {/* Other homepage components */}
      <RecentBanners />
    </div>
  );
}
```

## Functionalities

The RecentBanners component implements the following features:

- Fetches announcement data from the application's API endpoint
- Displays banners with visual styling that corresponds to their type:
  - Information banners with the `IoInformationCircle` icon
  - Warning banners with the `IoWarning` icon
  - Error/alert banners with the `IoAlertCircle` icon
- Presents each announcement with:
  - Title and appropriate icon based on type
  - Full message content with proper formatting
  - Information about which pages the banner appears on
- Formats page lists grammatically (e.g., "Projects and Statistics" or "Projects, Statistics and Review")
- Capitalises the first letter of each page name for consistent presentation
- Provides loading indicators during data fetching
- Displays appropriate error messages if fetching fails
- Renders nothing if no banners are available, avoiding empty containers

The component is designed to match the visual style of the banners as they appear on the actual pages, providing users with a centralised view of all current announcements across the application.
