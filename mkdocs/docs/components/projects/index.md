# Projects Component Documentation

The Projects component provides a comprehensive view of all projects within the Digital Landscape application. It displays projects in a sortable, searchable list with visual indicators of technology distribution across different Tech Radar rings and includes statistical visualisations in pie chart format.

## Features

- Displays all projects with clickable entries for detailed views
- Provides visual pie charts for key project categorisations
- Offers multiple sorting criteria including alphabetical, technology count, and status ratios
- Enables real-time filtering of projects based on multiple criteria
- Implements comprehensive search functionality across project metadata and technologies
- Displays colour-coded bars showing the proportion of technologies in each radar ring
- Supports refreshing project data on demand
- Adapts to different screen sizes for optimal viewing

## Props

The Projects component accepts the following props:

| Prop                  | Type     | Default    | Description                                                 |
| --------------------- | -------- | ---------- | ----------------------------------------------------------- |
| `isOpen`              | boolean  | Required   | Controls the visibility of the projects list                |
| `projectsData`        | array    | Required   | Array of project objects containing project details         |
| `handleProjectClick`  | function | Required   | Handler function called when a project is clicked           |
| `getTechnologyStatus` | function | Required   | Function to determine the Tech Radar status of a technology |
| `onRefresh`           | function | Required   | Handler function to refresh the projects data               |
| `searchTerm`          | string   | `""`       | The search term to filter projects                          |
| `setSearchTerm`       | function | `() => {}` | Function to update the search term                          |

## Usage

```jsx
import Projects from '../components/Projects/Projects';

function ProjectsPage() {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [projectsData, setProjectsData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    // Open project modal or navigate to project details
  };

  const getTechnologyStatus = (techName) => {
    // Return the status of the technology (adopt, trial, assess, hold)
  };

  const refreshProjects = async () => {
    // Fetch updated project data
    const data = await fetchProjects();
    setProjectsData(data);
  };

  return (
    <div className="projects-page">
      <Projects
        isOpen={isProjectsOpen}
        projectsData={projectsData}
        handleProjectClick={handleProjectClick}
        getTechnologyStatus={getTechnologyStatus}
        onRefresh={refreshProjects}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
}
```

## Pie Chart Visualisations

The Projects component includes several pie charts that provide statistical breakdowns of the project data:

### Project Stages

Displays the distribution of projects across different stages (Active Support, Development, Unsupported)

### Development Type

Shows the distribution of development approaches (In House, Partner, Outsourced)

### Hosting Platform

Illustrates the distribution of hosting environments (Cloud, On-premises, Hybrid)

### Architectures

Visualises the distribution of cloud providers and other architectures (AWS, GCP, Azure, Other)

Each pie chart is interactive with tooltips showing exact counts and percentages.

## Filtering System

The component includes an advanced filtering system allowing users to filter projects by multiple criteria. The filtering interface utilises the reusable [FilterGroup](filterGroup.md) component to create consistent, collapsible filter sections for each category:

### Project Stage

Filter by development stages (Active Support, Development, Unsupported)

### Development Type

Filter by development approaches (In House, Partner, Outsourced)

### Hosting

Filter by hosting environments (Cloud, On-premises, Hybrid)

### Architectures

Filter by cloud providers and architectures (AWS, GCP, Azure, Other)

### Programme

Filter by specific programmes using a multi-select dropdown

The filtering system maintains a count of active filters and provides a clear all option for easy reset. All filter categories and options are defined centrally in the [projectConstants](../../constants/projectConstants.md) file to ensure consistency throughout the application.

## Sorting Options

The component provides multiple sorting mechanisms:

### Name Sorting

- **A to Z**: Alphabetical sorting by project name
- **Z to A**: Reverse alphabetical sorting by project name

### Programme Sorting

- **A to Z**: Alphabetical sorting by programme name
- **Z to A**: Reverse alphabetical sorting by programme name

### Technology Count Sorting

- **Most Technologies**: Projects with the highest number of technologies first
- **Least Technologies**: Projects with the lowest number of technologies first

### Technology Status Sorting

- **Adopt Ratio**: Sort by the proportion of technologies in the Adopt ring
- **Trial Ratio**: Sort by the proportion of technologies in the Trial ring
- **Assess Ratio**: Sort by the proportion of technologies in the Assess ring
- **Hold Ratio**: Sort by the proportion of technologies in the Hold ring

For each Technology Status sorting option, users can choose between highest ratio first or lowest ratio first.

## Technology Distribution Calculation

The Projects component calculates technology distribution for each project by:

1. Extracting technologies from relevant fields in the project data
2. Determining the Tech Radar status of each technology (Adopt, Trial, Assess, Hold)
3. Calculating the proportion of technologies in each status category
4. Visualising the distribution as a segmented, colour-coded bar

## Search Functionality

The search feature filters projects based on multiple fields:

- Project name
- Project short name
- Project area
- Team name
- Programme name
- Programme short name
- Technology fields (languages, frameworks, infrastructure, etc.)

The search is case-insensitive and updates the project list in real-time as the user types. Matched terms are highlighted in the results.

## Visual Indicators

Each project entry includes several visual elements:

### Project Badges

Quick-reference badges showing project stage, development type, hosting environment, and primary architecture

### Technology Distribution Bar

A colour-coded bar representing the proportion of technologies in each Tech Radar ring:

- **Adopt**: Technologies recommended for adoption (green)
- **Trial**: Technologies in trial phase (blue)
- **Assess**: Technologies being assessed (orange)
- **Hold**: Technologies not recommended for new projects (red)
- **Unknown**: Technologies not found in the Tech Radar (grey)

Hovering over each segment displays a tooltip with the exact count and percentage.

## Refresh Functionality

The component includes a refresh button that:

1. Triggers the provided `onRefresh` callback
2. Updates the project data without requiring a full page refresh
3. Maintains current filtering and sorting settings

## Styling

The Projects component uses dedicated CSS defined in `../../styles/components/Projects.css` with:

- Responsive design for various screen sizes
- Interactive hover and focus states
- Consistent colour scheme matching the Tech Radar
- Accessible colour contrasts and text sizing
- Visual feedback for interactive elements
