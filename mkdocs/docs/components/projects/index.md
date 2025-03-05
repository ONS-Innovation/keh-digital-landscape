# Projects Component Documentation

The Projects component provides a comprehensive view of all projects within the Digital Landscape application. It displays projects in a sortable, searchable list with visual indicators of technology distribution across different Tech Radar rings.

## Features

- Displays all projects with clickable entries for detailed views
- Multiple sorting criteria including alphabetical, technology count, and status ratios
- Real-time filtering of projects based on search terms
- Colour-coded bars showing the proportion of technologies in each radar ring
- Ability to refresh project data on demand
- Adapts to different screen sizes for optimal viewing

## Props

The Projects component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | Required | Controls the visibility of the projects list |
| `projectsData` | array | Required | Array of project objects containing project details |
| `handleProjectClick` | function | Required | Handler function called when a project is clicked |
| `getTechnologyStatus` | function | Required | Function to determine the Tech Radar status of a technology |
| `onRefresh` | function | Required | Handler function to refresh the projects data |

## Usage

```jsx
import Projects from '../components/Projects/Projects';

function ProjectsPage() {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [projectsData, setProjectsData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
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
      />
    </div>
  );
}
```

## Technology Distribution Calculation

The Projects component calculates technology distribution for each project by:

1. Extracting technologies from relevant fields in the project data
2. Determining the Tech Radar status of each technology (Adopt, Trial, Assess, Hold (ignoring review and ignore)) based off the last entry in the timeline
3. Calculating the proportion of technologies in each status category
4. Visualising the distribution as a segmented, colour-coded bar


## Sorting Options

The component provides multiple sorting mechanisms:

### Name Sorting
- **A to Z**: Alphabetical sorting by project name
- **Z to A**: Reverse alphabetical sorting by project name

### Technology Count Sorting
- **Most Technologies**: Projects with the highest number of technologies first
- **Least Technologies**: Projects with the lowest number of technologies first

### Technology Status Sorting

- Most or Least Ratio:
    - **Adopt Ratio**: Sort by the proportion of technologies in the Adopt ring
    - **Trial Ratio**: Sort by the proportion of technologies in the Trial ring
    - **Assess Ratio**: Sort by the proportion of technologies in the Assess ring
    - **Hold Ratio**: Sort by the proportion of technologies in the Hold ring

## Search Functionality

The search feature filters projects based on multiple fields:

- Project name
- Project short name
- Project area
- Team name
- Programme name
- Programme short name

The search is case-insensitive and updates the project list in real-time as the user types.

## Visual Indicators

Each project entry includes a visual representation of its technology composition:

- **Adopt**: Technologies recommended for adoption
- **Trial**: Technologies in trial phase
- **Assess**: Technologies being assessed
- **Hold**: Technologies not recommended for new projects
- **Unknown**: Technologies not found in the Tech Radar

Hovering over each segment displays a tooltip with the exact count and percentage.

## Styling

The Projects component uses dedicated CSS defined in `../../styles/components/Projects.css` with:
