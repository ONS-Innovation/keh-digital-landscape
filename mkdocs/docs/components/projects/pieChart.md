# PieChart Component Documentation

The PieChart component provides a visual representation of project data categorisation in a pie graph format. It displays the percentage distribution of projects across different categories, with customisable colours, labels, and interactive tooltips for enhanced data visualisation and analysis.

## Features

- Displays percentage distribution of projects by specified categories
- Supports dynamic category detection from project data
- Provides interactive tooltips showing exact counts and percentages
- Offers customisable colour schemes for different categories
- Handles semicolon-separated multi-value fields
- Provides special handling for cloud provider identification
- Includes configurable category limits with automatic "Other" grouping
- Renders responsive charts that adapt to container dimensions
- Supports custom labels with percentage indicators

## Props

The PieChart component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `projectsData` | array | Required | Array of project objects containing project details |
| `title` | string | Required | The title to display above the chart |
| `categoryField` | string | Required | The field name to use for categorisation |
| `categories` | array | `[]` | Predefined categories to display in the chart |
| `categoryLabels` | object | `{}` | Mapping of category values to display labels |
| `categoryColours` | object | `{}` | Mapping of category values to colour codes |
| `getCategoryValue` | function | `(project, field) => project[field] \|\| "Unknown"` | Function to extract category value from a project |
| `splitSemicolon` | boolean | `false` | Whether to split the category field by semicolon |
| `dynamicCategories` | boolean | `false` | Whether to dynamically detect categories from the data |
| `maxCategories` | number | `8` | Maximum number of categories to display before grouping as "Other" |
| `cloudProvidersOnly` | boolean | `false` | Whether to specifically identify major cloud providers |

## Usage

```jsx
import PieChart from '../components/Projects/PieChart';

function ProjectsOverview() {
  const [projectsData, setProjectsData] = useState([]);
  
  // Example category colours
  const stageColours = {
    "Development": "var(--color-assess)",
    "Active Support": "var(--color-adopt)",
    "Unsupported": "var(--color-hold)",
    "Other": "#b7b7b7"
  };
  
  // Example category labels
  const stageLabels = {
    "Development": "In Development",
    "Active Support": "Actively Supported",
    "Unsupported": "No Longer Supported",
    "Other": "Other Stages"
  };
  
  return (
    <div className="projects-overview">
      <PieChart
        projectsData={projectsData}
        title="Projects by Stage"
        categoryField="Stage"
        categories={["Development", "Active Support", "Unsupported", "Other"]}
        categoryLabels={stageLabels}
        categoryColours={stageColours}
      />
      
      {/* Example with dynamic categories */}
      <PieChart
        projectsData={projectsData}
        title="Cloud Provider Usage"
        categoryField="Architecture"
        splitSemicolon={true}
        dynamicCategories={true}
        maxCategories={5}
      />
      
      {/* Example with cloud providers detection */}
      <PieChart
        projectsData={projectsData}
        title="Cloud Providers"
        categoryField="Architecture"
        splitSemicolon={true}
        cloudProvidersOnly={true}
      />
    </div>
  );
}
```

## Category Detection

The PieChart component can work with categories in several ways:

### Predefined Categories
When specific `categories` are provided, the component counts projects matching each category and displays them accordingly.

### Dynamic Category Detection
When `dynamicCategories` is enabled, the component:

1. Analyses the project data to identify unique values
2. Counts frequency of each value across all projects
3. Selects the most common categories up to `maxCategories`
4. Groups remaining values as "Other" when exceeding the maximum

### Cloud Provider Detection
When `cloudProvidersOnly` is enabled, the component:

1. Specifically identifies major cloud providers (AWS, GCP, Azure)
2. Matches technologies against predefined provider-specific keywords
3. Categorises unmatched technologies as "Other"
4. Presents the distribution of cloud provider usage across projects

## Multi-Value Field Handling

When `splitSemicolon` is enabled, the component:

1. Splits the specified `categoryField` by semicolons
2. Treats each value as a separate instance
3. Counts occurrences of each value across all projects
4. Shows the distribution of values rather than projects

## Visual Customisation

The PieChart offers several visual customisation options:

- **Colours**: Custom colours can be specified through the `categoryColours` prop
- **Labels**: Custom display names through the `categoryLabels` prop
- **Percentages**: Automatically displayed on chart segments exceeding 5%
- **Tooltips**: Interactive tooltips showing count and percentage information
- **Legend**: Automatic legend with category names and colour indicators

## Styling

The PieChart uses the styling defined in the main application CSS with:

- Tech Radar colour variables for consistency with other components
- Responsive container sizing to fit available space
- Customisable tooltip styling
- Accessible text labelling with appropriate contrast
- Dynamic colour palette when custom colours aren't specified
