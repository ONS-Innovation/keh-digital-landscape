# FilterGroup Component Documentation

The FilterGroup component provides a reusable, collapsible filter section with checkbox functionality for selecting items within a category. It is designed to create consistent filtering interfaces throughout the application, particularly for categorical data filtering in lists and dashboards.

## Features

- Implements a collapsible accordion interface for space-efficient filtering
- Displays a customisable list of filterable items as checkboxes
- Maintains selection state externally for flexibility
- Provides visual indicators for selected items
- Toggles visibility of filter options with smooth interactions
- Uses consistent styling with other filter components
- Enhances accessibility with proper labelling and keyboard support
- Supports any type of categorical data filtering

## Props

The FilterGroup component accepts the following props:

| Prop            | Type     | Default  | Description                                         |
| --------------- | -------- | -------- | --------------------------------------------------- |
| `title`         | string   | Required | The title displayed in the filter group header      |
| `sectionKey`    | string   | Required | A unique identifier for this filter section         |
| `isExpanded`    | boolean  | Required | Controls whether the filter options are visible     |
| `toggleSection` | function | Required | Function called when the section header is clicked  |
| `items`         | array    | Required | Array of items to display as filterable options     |
| `selectedItems` | array    | `[]`     | Array of currently selected items                   |
| `onItemChange`  | function | Required | Function called when an item is selected/deselected |

## Usage

```jsx
import FilterGroup from '../components/Projects/FilterGroup';

function FilterableList() {
  // State for tracking expanded sections
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    status: false,
  });

  // State for tracking selected filters
  const [filters, setFilters] = useState({
    category: [],
    status: [],
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle filter changes
  const handleFilterChange = (category, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      if (updatedFilters[category].includes(value)) {
        updatedFilters[category] = updatedFilters[category].filter((item) => item !== value);
      } else {
        updatedFilters[category] = [...updatedFilters[category], value];
      }

      return updatedFilters;
    });
  };

  return (
    <div className="filters-container">
      <FilterGroup
        title="Categories"
        sectionKey="category"
        isExpanded={expandedSections.category}
        toggleSection={toggleSection}
        items={['Web', 'Mobile', 'Desktop', 'Infrastructure']}
        selectedItems={filters.category}
        onItemChange={handleFilterChange}
      />

      <FilterGroup
        title="Status"
        sectionKey="status"
        isExpanded={expandedSections.status}
        toggleSection={toggleSection}
        items={['Active', 'Archived', 'Planned']}
        selectedItems={filters.status}
        onItemChange={handleFilterChange}
      />
    </div>
  );
}
```

## Implementation Details

The FilterGroup component consists of two main parts:

### Header Section

- Contains the filter category title
- Includes a chevron icon that rotates based on expanded state
- Serves as a clickable button to toggle the visibility of filter options

### Filter Options Section

- Contains a list of checkboxes for individual filter options
- Displays a custom checkbox design with checkmark icons
- Shows or hides based on the `isExpanded` prop
- Maintains visual indicators for selected items

## Styling

The FilterGroup component leverages the application's existing CSS classes:

- `.filter-group`: Contains the entire filter group component
- `.filter-group-title`: Styles the header with appropriate spacing and interactions
- `.filter-accordion-header`: Adds accordion-specific styling and cursor indicators
- `.accordion-icon`: Handles the rotation of the chevron icon
- `.filter-checkbox-group`: Contains and styles the list of checkbox options
- `.filter-checkbox-label`: Styles each individual checkbox label
- `.custom-checkbox`: Implements a custom-styled checkbox with selected state
- `.checkbox-icon`: Styles the checkmark icon for selected items
- `.sr-only`: Hides the native checkbox input while maintaining accessibility

## Accessibility Considerations

The FilterGroup component enhances accessibility by:

- Using semantic HTML structure for better screen reader compatibility
- Maintaining keyboard navigability through standard checkbox inputs
- Providing visual indicators of state (expanded/collapsed, selected/unselected)
- Using appropriate ARIA attributes through the underlying checkbox inputs
- Maintaining adequate contrast for text and interactive elements

## Integration with Other Components

The FilterGroup component is primarily used within the Projects component to create the filtering interface for:

- Project stages
- Development types
- Hosting platforms
- Architecture categories

This component helps unify the filtering interface across the application while reducing code duplication and ensuring consistent behaviour.
