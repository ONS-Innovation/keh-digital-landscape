# Projects

The Projects section provides a comprehensive view of all projects and their technology stacks gathered by the Tech Audit tool, with powerful filtering, sorting, and visualisation capabilities.

## Overview

The Projects interface enables you to:

- View all projects recorded by the Tech Audit tool in a sortable, filterable list
- Examine project details using the [Project Modal](/components/projects/projectModal) component
- Analyse project distributions through interactive [pie charts](/components/projects/pieChart)
- Filter projects by multiple criteria including stage, development type, and architecture
- Sort projects using various criteria including alphabetical order and technology distribution
- Search across project metadata and technology stacks
- Refresh project data without reloading the entire application

## Statistical Visualisations

The Projects page displays four interactive pie charts at the top of the interface:

### Project Stages
- Visualises the distribution of projects across lifecycle stages
- Categories: Active Support, Development, Unsupported
- Colour-coded segments with percentage indicators
- Interactive tooltips showing exact counts and percentages

### Development Type
- Shows how projects are developed across the organisation
- Categories: In House, Partner, Outsourced
- Derived from the first character of the 'Developed' field
- Interactive tooltips with additional information

### Hosting Platform
- Illustrates where projects are hosted
- Categories: Cloud, Hybrid, On-premises
- Colour-coded to highlight cloud adoption patterns
- Interactive tooltips showing exact distribution

### Architectures
- Displays the distribution of cloud providers and architectures
- Categories: AWS, GCP, Azure, Other
- Uses intelligent detection to identify cloud providers from architecture descriptions
- Automatically handles semicolon-separated values

## Filtering Capabilities

The Projects page includes a comprehensive filtering system accessible via the "Filter by" button:

### Project Stage Filtering
- Filter by development stages: Active Support, Development, Unsupported
- Toggle filters on/off with checkbox selectors
- Filter indicator shows the number of active filters

### Development Type Filtering
- Filter by development approaches: In House, Partner, Outsourced 
- Checkbox interface for easy selection and deselection
- Extracted from the 'Developed' field in project data

### Hosting Filtering
- Filter by hosting environments: Cloud, On-premises, Hybrid
- Checkbox selectors with expandable/collapsible sections
- Combines with other filters for precise project selection

### Architecture Filtering
- Filter by cloud providers: AWS, GCP, Azure, Other
- Identifies cloud providers through keyword recognition
- "Other" category captures non-cloud architectures

### Programme Filtering
- Filter by specific programmes using a multi-select dropdown
- Dynamic programme list populated from available project data
- Type-to-search functionality in the dropdown

The filtering system also includes a "Clear all filters" button to easily reset all active filters.

## Sorting Options

The Projects page offers multiple sorting mechanisms through the "Sort by" button:

### Name Sorting
- **A to Z**: Alphabetical sorting by project name
- **Z to A**: Reverse alphabetical sorting by project name

### Programme Sorting
- **A to Z**: Alphabetical sorting by programme name
- **Z to A**: Reverse alphabetical sorting by programme name

### Technology Count Sorting
- **Most Technologies**: Projects with the highest number of technologies first
- **Least Technologies**: Projects with the lowest number of technologies first

### Technology Ring Sorting
- Sort by the proportion of technologies in specific Tech Radar rings (Adopt, Trial, Assess, Hold)
- For each ring, choose between highest ratio first or lowest ratio first
- Example:
  - When sorting by "Adopt" with "highest first", projects with the highest percentage of Adopt technologies appear at the top
  - When sorting by "Hold" with "lowest first", projects with the fewest Hold technologies appear at the top

## Search Functionality

The search functionality filters projects based on multiple fields:

- Project name and short name
- Programme name and short name
- Team name
- Project area
- Technology fields (languages, frameworks, infrastructure, etc.)

The search is case-insensitive and provides real-time filtering as you type. Matched terms are highlighted in the results to easily identify where matches occur.

## Refresh Functionality

The Projects page includes a refresh button that:
1. Updates the project data without requiring a full page refresh
2. Maintains current filtering and sorting settings
3. Updates all pie charts and project listings with fresh data

## Visual Features

### Project Cards
Each project is displayed as a card containing:
- Project name and short name (if available)
- Programme badge with a colour derived from the programme name
- Project description (truncated for readability)
- Documentation link (if available)
- Status badges showing project stage, development type, hosting, and architecture

### Technology Distribution Bar
Each project card includes a horizontal bar showing the distribution of technologies across Tech Radar rings:
- **Adopt** (green): Technologies recommended for adoption
- **Trial** (blue): Technologies in trial phase
- **Assess** (orange): Technologies being assessed
- **Hold** (red): Technologies not recommended for new projects
- **Unknown** (grey): Technologies not found in the Tech Radar

Hover over any segment to see the exact count and percentage of technologies in that category.
