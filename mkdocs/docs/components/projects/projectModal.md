# ProjectModal Component Documentation

The ProjectModal component provides a detailed view of project information in a modal dialogue. It displays comprehensive project details including linked repositories, technology stacks, and various metadata organised into logical groupings for easy navigation and reference.

## Features

- Fetches and displays GitHub repository data for linked projects
- Shows language usage statistics with colour-coded bars
- Organises project details into logical groupings
- Allows filtering of project details by search terms
- Provides clickable technology tags that link to the Tech Radar
- Displays repository status, visibility, and last commit information

## Props

The ProjectModal component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | Required | Controls the visibility of the modal |
| `onClose` | function | Required | Handler function called when the modal is closed |
| `project` | object | Required | The project object containing all project details |
| `renderTechnologyList` | function | Required | Function to render technology lists in a consistent format |
| `getTechnologyStatus` | function | Required | Function to determine the Tech Radar status of a technology |
| `onTechClick` | function | Required | Handler for when a technology tag is clicked |

## Usage

```jsx
import ProjectModal from '../components/Projects/ProjectModal';

function ProjectsView() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleTechClick = (techName) => {
    // Navigate to tech radar or show tech details
  };
  
  const getTechStatus = (techName) => {
    // Return the status of the technology (adopt, trial, assess, hold)
  };
  
  return (
    <div className="projects-container">
      {/* Project list or grid */}
      
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        renderTechnologyList={(technologies) => (
          <div className="tech-list">
            {technologies.map(tech => <span key={tech}>{tech}</span>)}
          </div>
        )}
        getTechnologyStatus={getTechStatus}
        onTechClick={handleTechClick}
      />
    </div>
  );
}
```

## Repository Information

The ProjectModal fetches and displays detailed information about linked GitHub repositories:

- **Repository Status**: Shows if a repository is active or archived
- **Visibility**: Indicates if a repository is public or private
- **Last Commit**: Displays the date of the last commit with visual indicators for stale repositories
- **Language Breakdown**: Visualises the programming languages used in the repository with proportional bars
- **Technology Tags**: Lists technologies used with percentages and Tech Radar status indicators

## Information Grouping

Project information is organised into logical categories for improved readability:

1. **Languages & Frameworks**: Programming languages, frameworks, and testing tools
2. **Infrastructure & Deployment**: Hosting, cloud services, CI/CD, and containerisation
3. **Security & Source Control**: Authentication, source control, and branching strategies
4. **Quality & Monitoring**: Code quality tools, formatters, and monitoring solutions
5. **Data Management**: Databases, data stores, and output formats
6. **Integrations**: Internal and external system integrations
7. **General Information**: Project area, tools, documentation, and collaboration

## Search Functionality

The modal includes a search feature that:

- Filters displayed information based on both field names and values
- Updates the view in real-time as the user types
- Maintains the categorical structure while filtering content
- Preserves the context of the information being displayed

## Styling

The ProjectModal uses dedicated CSS defined in `../../styles/components/ProjectModal.css` with:
