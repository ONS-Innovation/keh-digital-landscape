# HelpModal Component

The HelpModal component provides contextual help and guidance for users when viewing each page of the application. It is now accessed through the Sidebar rather than the Header.

## Props

The HelpModal component accepts the following props:

| Prop      | Type     | Default  | Description                                      |
| --------- | -------- | -------- | ------------------------------------------------ |
| `show`    | boolean  | Required | Controls the visibility of the modal             |
| `onClose` | function | Required | Handler function called when the modal is closed |

## Usage

```jsx
import HelpModal from '../components/Header/HelpModal';

function SidebarComponent() {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="sidebar">
      <button onClick={() => setShowHelp(true)}>
        Help
      </button>
      
      <HelpModal 
        show={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
```

## Context-Specific Content

The HelpModal dynamically renders different content based on the current route:

- **Tech Radar**: Shows information about quadrants, rings, and how to use the radar
- **Home**: Overview of the Digital Landscape features
- **Statistics**: Guidance on filtering and interpreting language usage data
- **Projects**: Instructions for navigating and filtering project information
- **Review Dashboard**: Help for reviewers managing technologies
- **Admin Dashboard**: Guidelines for banner and technology management

Each context-specific help section includes links to more detailed documentation when applicable.

## Animation Implementation

The HelpModal uses a two-phase rendering approach for smooth animations:

1. **Mount Phase**: Component is added to the DOM but remains invisible
1. **Visibility Phase**: CSS transitions are applied to fade in the modal
1. **Unmount Delay**: When closing, animations complete before removal from DOM

## Styling

The HelpModal uses dedicated CSS defined in `../../styles/components/HelpModal.css` for consistent styling and smooth transitions.
