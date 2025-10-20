# Project Constants Documentation

The projectConstants file provides shared constants related to project categorisation across the application. These constants ensure consistency in the display, filtering, and categorisation of projects while reducing code duplication and centralising the definition of key categories and mappings.

## Overview

This constants file centralises important definitions for:

- Cloud provider identification keywords
- Project stage categories
- Development type definitions and code mappings
- Hosting platform options
- Architecture categories
- Colour mappings for different category types

By maintaining these definitions in a single location, the application ensures consistent categorisation, display, and filtering behaviour throughout its various components.

## Available Constants

The projectConstants file exports the following constants:

### CLOUD_PROVIDERS

```js
export const CLOUD_PROVIDERS = {
  AWS: ["aws", "amazon", "ec2", "lambda", "fargate", "ecs", "eks"],
  GCP: ["gcp", "google cloud", "cloud run", "gke", "app engine"],
  Azure: ["azure", "microsoft"],
  Other: []
};
```

A mapping of cloud provider names to arrays of identifying keywords, used to detect which cloud provider a technology or architecture belongs to.

### PROJECT_STAGES

```js
export const PROJECT_STAGES = ["Active Support", "Development", "Unsupported"];
```

An array of standard project lifecycle stages used throughout the application for filtering and categorisation.

### DEVELOPMENT_TYPES

```js
export const DEVELOPMENT_TYPES = ["In House", "Partner", "Outsourced"];
```

An array of standard development approach types used for filtering and categorisation.

### DEVELOPMENT_TYPE_CODES

```js
export const DEVELOPMENT_TYPE_CODES = {
  I: "In House",
  P: "Partner",
  O: "Outsourced"
};
```

A mapping of single-character codes to full development type names, used for converting data format codes to display values.

### HOSTING_TYPES

```js
export const HOSTING_TYPES = ["Cloud", "Hybrid", "On-premises"];
```

An array of standard hosting environment types used for filtering and categorisation.

### ARCHITECTURE_CATEGORIES

```js
export const ARCHITECTURE_CATEGORIES = ["AWS", "GCP", "Azure", "Other"];
```

An array of architecture categories representing major cloud providers and other architectures.

### CATEGORY_COLOURS

```js
export const CATEGORY_COLOURS = {
  // Project stages
  "Active Support": "var(--color-adopt)",
  "Development": "var(--color-trial)",
  "Unsupported": "var(--color-hold)",
  
  // Development types
  "I": "var(--color-adopt)",
  "O": "var(--color-trial)",
  "P": "var(--color-assess)",
  
  // Hosting types
  "Cloud": "var(--color-adopt)",
  "On-premises": "var(--color-trial)",
  "Hybrid": "var(--color-assess)",
  
  // Architecture categories
  "AWS": "var(--color-adopt)",
  "GCP": "var(--color-trial)",
  "Azure": "var(--color-hold)",
  "Other": "var(--color-assess)",
};
```

A comprehensive mapping of category values to colour variables, ensuring consistent colour representation across different visualisations.

## Usage

These constants are used throughout the application to ensure consistent categorisation and display:

```jsx
import { 
  PROJECT_STAGES, 
  DEVELOPMENT_TYPES, 
  CATEGORY_COLOURS 
} from '../../constants/projectConstants';

function ProjectsStatistics() {
  return (
    <div className="statistics-container">
      <PieChart
        title="Project Stages"
        data={projectData}
        categoryField="stage"
        categories={PROJECT_STAGES}
        categoryColours={CATEGORY_COLOURS}
      />
      
      <FilterGroup
        title="Development Type"
        sectionKey="developmentType"
        items={DEVELOPMENT_TYPES}
        selectedItems={selectedTypes}
        onItemChange={handleFilterChange}
        isExpanded={expandedSections.developmentType}
        toggleSection={toggleSection}
      />
    </div>
  );
}
```