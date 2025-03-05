# MultiSelect

The MultiSelect component provides an interactive dropdown interface for selecting multiple options from a list.

## Features

- Allows users to select multiple items from a dropdown list
- Includes real-time filtering of options as users type
- Clearly indicates selected items with tags
- Supports keyboard navigation and interaction
- Configurable placeholder text when no items are selected
- Support for disabling the component when needed
- Automatically closes the dropdown when clicking elsewhere

## Props

The MultiSelect component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | array | Required | Array of option objects with `value` and `label` properties |
| `value` | array | Required | Array of currently selected option objects |
| `onChange` | function | Required | Handler function called when selections change |
| `placeholder` | string | `"Select..."` | Text displayed when no options are selected |
| `isDisabled` | boolean | `false` | Whether the component is disabled |

## Usage

```jsx
import MultiSelect from '../components/MultiSelect/MultiSelect';

function FilterForm() {
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  
  const technologyOptions = [
    { value: 'react', label: 'React' },
    { value: 'angular', label: 'Angular' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'nextjs', label: 'Next.js' },
  ];
  
  return (
    <div className="filter-form">
      <label>Technologies:</label>
      <MultiSelect
        options={technologyOptions}
        value={selectedTechnologies}
        onChange={setSelectedTechnologies}
        placeholder="Select technologies..."
      />
    </div>
  );
}
```

## Interaction Patterns

The MultiSelect component implements several interaction patterns:

- **Click to Open**: Clicking the control area opens the dropdown
- **Search Filtering**: Typing in the input filters the available options
- **Click to Select**: Clicking an option adds it to the selection
- **Click to Remove**: Clicking the close icon on a selected item removes it
- **Click Outside to Close**: Clicking outside the component closes the dropdown

## Selected Items Display

Selected items are displayed as interactive tags within the control area:

- Each tag shows the option's label text
- Tags include a remove button (×) for quick removal
- Tags are visually distinct from the input area
- Multiple tags flow naturally within the available space

## Search Functionality

The component includes built-in search capabilities:

- Real-time filtering as the user types
- Case-insensitive matching against option labels
- Empty results handling (dropdown hides when no matches)
- Search term is cleared when a selection is made

## Styling

The MultiSelect uses dedicated CSS defined in `../../styles/components/MultiSelect.css` with:
