# Skeleton Loading

Skeleton loading components provide visual placeholders that mimic the structure of content while it is being loaded. They improve the perceived performance of the application by reducing the jarring effect of empty spaces and sudden content appearance, creating a smoother, more engaging user experience.

[What is skeleton loading? (External Link)](https://medium.com/design-bootcamp/how-ui-skeleton-loaders-improve-user-experience-real-world-examples-7279c7a2f858#:~:text=A%20skeleton%20loader%20is%20a,or%20buttons%20will%20eventually%20appear.)

## Components

The Digital Landscape application includes several skeleton loading components designed to match the structure of their corresponding content components:

### SkeletonStatCard

The `SkeletonStatCard` component renders a placeholder for statistical cards that display metrics and values.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minWidth` | string | `"0"` | Minimum width of the skeleton card |

#### Usage

```jsx
import SkeletonStatCard from '../components/Statistics/Skeletons/SkeletonStatCard';

function StatisticsPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Fetch data and update loading state
  
  return (
    <div className="statistics-panel">
      {isLoading ? (
        <>
          <SkeletonStatCard minWidth="200px" />
          <SkeletonStatCard minWidth="200px" />
          <SkeletonStatCard minWidth="200px" />
        </>
      ) : (
        // Render actual stat cards with data
      )}
    </div>
  );
}
```

### SkeletonLanguageCard

The `SkeletonLanguageCard` component renders a placeholder for language cards that display programming language statistics.

#### Usage

```jsx
import SkeletonLanguageCard from '../components/Statistics/Skeletons/SkeletonLanguageCard';

function LanguagePanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [languages, setLanguages] = useState([]);
  
  // Fetch data and update loading state
  
  return (
    <div className="language-panel">
      {isLoading ? (
        <>
          <SkeletonLanguageCard />
          <SkeletonLanguageCard />
          <SkeletonLanguageCard />
        </>
      ) : (
        // Render actual language cards with data
      )}
    </div>
  );
}
```

## Animation

All skeleton components feature a subtle pulsing animation.

The animation is implemented using CSS keyframes that gradually fade the opacity in and out, creating a gentle pulsing effect.

## Styling

The skeleton components use dedicated CSS defined in `../../styles/components/SkeletonLoading.css` with:

### CSS Structure

The skeleton styling includes:

- Base `.skeleton` class with the pulsing animation
- Element-specific classes (e.g., `.skeleton-title`, `.skeleton-value`)
- Varied widths for different elements to create a natural appearance
- Responsive dimensions that adapt to different screen sizes

## Implementation Details

Skeleton components are designed to be:

1. Lightweight components with minimal logic
2. Using CSS variables to match the application's theme
3. Not interfering with screen readers or keyboard navigation
4. Using CSS animations rather than JavaScript for smooth performance

## Integration with Components

Skeleton components are typically used in conditional rendering patterns:

```jsx
{isLoading ? <SkeletonComponent /> : <ActualComponent data={data} />}
```
