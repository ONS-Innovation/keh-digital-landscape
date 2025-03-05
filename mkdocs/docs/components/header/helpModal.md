# HelpModal Component Documentation

The HelpModal component provides contextual help and guidance for user when viewing each page on the application.

## Props

The HelpModal component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | boolean | Required | Controls the visibility of the modal |
| `onClose` | function | Required | Handler function called when the modal is closed |

## Usage

```jsx
import HelpModal from '../components/Header/HelpModal';

function App() {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="app">
      <button onClick={() => setShowHelp(true)}>
        Show Help
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

The HelpModal dynamically renders different content based on the current route

## Animation Implementation

The HelpModal uses a two-phase rendering approach for smooth animations:

1. **Mount Phase**: Component is added to the DOM but remains invisible
2. **Visibility Phase**: CSS transitions are applied to fade in the modal
3. **Unmount Delay**: When closing, animations complete before removal from DOM

## Styling

The HelpModal uses dedicated CSS defined in `../../styles/components/HelpModal.css`.
