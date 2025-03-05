# InfoBox Component Documentation

The InfoBox component provides a draggable, resizable information panel that displays detailed information about selected items in the Tech Radar and on the Review page.

## Props

The InfoBox component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isAdmin` | boolean | `false` | Whether the current user has administrative privileges |
| `selectedItem` | object | `undefined` | The technology item to display details for |
| `initialPosition` | object | `{ x: 24, y: 80 }` | Starting coordinates for the InfoBox |
| `onClose` | function | Required | Handler function called when the InfoBox is closed |
| `timelineAscending` | boolean | Required | Whether to display timeline in ascending order |
| `setTimelineAscending` | function | Required | Function to toggle timeline sort order |
| `selectedTimelineItem` | object | `undefined` | Currently selected timeline entry |
| `setSelectedTimelineItem` | function | Required | Function to update selected timeline entry |
| `projectsForTech` | array | `undefined` | List of projects using this technology |
| `handleProjectClick` | function | Required | Handler for project selection |
| `onEditConfirm` | function | `undefined` | Handler for confirming edits (admin only) |
| `onEditCancel` | function | `undefined` | Handler for cancelling edits (admin only) |

## Usage

```jsx
import InfoBox from '../components/InfoBox/InfoBox';

function TechRadarView() {
  const [selectedTech, setSelectedTech] = useState(null);
  const [timelineAscending, setTimelineAscending] = useState(true);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  
  return (
    <div className="radar-container">
      {/* Radar visualisation */}
      
      {selectedTech && (
        <InfoBox
          selectedItem={selectedTech}
          onClose={() => setSelectedTech(null)}
          timelineAscending={timelineAscending}
          setTimelineAscending={setTimelineAscending}
          selectedTimelineItem={selectedTimelineItem}
          setSelectedTimelineItem={setSelectedTimelineItem}
          projectsForTech={projectsData}
          handleProjectClick={handleProjectSelection}
        />
      )}
    </div>
  );
}
```

## Functionalities

The InfoBox implements a custom drag-and-drop system that:

- Allows users to reposition the box by dragging the icon that is to the left of the technology name
- Maintains the box position during user interaction
- Provides visual feedback during dragging shadow effects

The timeline section displays the history of a technology's movement through different rings:

- Chronological representation of status changes
- Visual indicators for upward/downward/lateral movements
- Toggleable sort order (oldest-first or newest-first)
- Interactive selection to view detailed descriptions of each change

For users with reviewer privileges, the InfoBox provides:

- Inline editing of technology title and category
- Form controls for modifying technology details
- Confirmation and cancellation options for edits
- Visual indicators of edit mode

When no item is selected, the InfoBox displays a placeholder message instructing users how to interact with the radar visualisation.
