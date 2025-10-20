# Statistics

The Statistics component provides a visualisation of repository and programming language data across the organisation. It enables users to analyse technology usage patterns, filter data by various criteria, and interact with language statistics.

## Features

- Displays detailed metrics for each programming language
- Filter statistics by various time periods including custom date ranges
- Toggle between active, archived, or all repositories
- Sort languages by name, repository count, or code size
- Highlight languages that appear in the Tech Radar
- Filter statistics by specific projects
- Search functionality to quickly find specific languages
- Visual indicators to match Tech Radar rings

## Props

The Statistics component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | object | Required | Object containing repository and language statistics |
| `onTechClick` | function | Required | Handler function called when a technology is clicked |
| `onDateChange` | function | Required | Handler function called when the date filter changes |
| `isLoading` | boolean | Required | Whether the statistics data is currently loading |
| `projectsData` | array | Required | Array of project objects for project filtering |
| `onProjectsChange` | function | Required | Handler function called when selected projects change |
| `searchTerm` | string | `""` | Current search term for filtering languages |

## Usage

```jsx
import Statistics from '../components/Statistics/Statistics';

function StatisticsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectsData, setProjectsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleTechClick = (techName) => {
    // Navigate to tech radar or show tech details
  };
  
  const handleDateChange = (date, repoView) => {
    // Fetch data for the selected date range and repository view
    fetchStatistics(date, repoView).then(data => {
      setData(data);
      setIsLoading(false);
    });
  };
  
  const handleProjectsChange = (selectedProjects) => {
    // Filter statistics by selected projects
    fetchProjectStatistics(selectedProjects).then(data => {
      setData(data);
      setIsLoading(false);
    });
  };
  
  return (
    <div className="statistics-page">
      <Statistics
        data={data}
        onTechClick={handleTechClick}
        onDateChange={handleDateChange}
        isLoading={isLoading}
        projectsData={projectsData}
        onProjectsChange={handleProjectsChange}
        searchTerm={searchTerm}
      />
    </div>
  );
}
```

## Date Filtering

The Statistics component provides several date filtering options:

- **All Time**: Shows statistics across the entire history
- **Last Month**: Filters to the past 30 days
- **Last 3 Months**: Filters to the past 90 days
- **Last 6 Months**: Filters to the past 180 days
- **Last Year**: Filters to the past 365 days
- **Custom Date**: Allows selection of a specific date to filter from

When a date filter is applied, all statistics are recalculated to include only repositories with activity after the selected date.

## Repository Views

The component offers three different repository view modes:

- **Active Repositories**: Shows only non-archived repositories (default)
- **Archived Repositories**: Shows only archived repositories
- **All Repositories**: Shows both active and archived repositories

Each view provides different insights into the organisation's technology usage patterns.

## Language Statistics

For each programming language, the component displays:

- **Repository Count**: Number of repositories using the language
- **Lines of Code**: Total lines of code written in the language
- **Average Size**: Average size of the language usage per repository
- **Tech Radar Status**: Visual indicator of the language's status in the Tech Radar

Languages can be sorted by any of these metrics in ascending or descending order.

## Tech Radar Integration

Languages that appear in the Tech Radar are highlighted with their corresponding ring colour:

- **Adopt**: Technologies recommended for adoption
- **Trial**: Technologies in trial phase
- **Assess**: Technologies being assessed
- **Hold**: Technologies not recommended for new projects

Clicking on a language with Tech Radar status navigates to its entry in the Tech Radar visualisation.

## Project Filtering

The component includes a multi-select dropdown that allows filtering statistics by specific projects:

- Select one or more projects to see statistics for only those projects
- Clear the selection to view statistics across all projects
- Project options are automatically generated from the provided project data

## Styling

The Statistics component uses dedicated CSS defined in `../../styles/components/Statistics.css` with:

## Loading States

During data fetching, the component displays skeleton loading states:

- Skeleton cards for summary statistics
- Skeleton language cards for the language list
- Smooth transition from loading to data display