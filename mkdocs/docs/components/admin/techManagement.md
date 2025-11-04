# Technology Management Components

The Admin interface includes specialised components for technology management that help administrators track, normalise, and organise technologies across the organisation.

## TechManage Component

The TechManage component is the primary interface for managing technologies in the reference lists and detecting untracked technologies used in projects.

### Key Features

- **Untracked Technology Detection**: Automatically scans project data to identify technologies not yet tracked in reference lists or Tech Radar
- **Reference List Management**: View, add, edit, and remove technologies in categorised reference lists
- **Similarity Detection**: Uses advanced string similarity algorithms to identify potential duplicate or similar technologies
- **Technology Normalisation**: Standardise technology names across all projects
- **Batch Operations**: Add multiple technologies to reference lists or the Tech Radar in bulk

### Implementation Details

The component is implemented with the following key elements:

- **Data Sources**:
  - Tech Radar JSON from S3
  - Project CSV data from S3
  - Reference list array data from API

- **Similarity Algorithm**:
  - Configurable threshold (default 80%)
  - Case-insensitive matching
  - Acronym detection
  - Common prefix handling

- **Technology Status**:
  - Technologies can be tracked in the reference list, Tech Radar, both, or untracked
  - Tracked status is visually indicated with different colors

- **Sorting Options**:
  - Name (A-Z or Z-A)
  - Project count (high to low or low to high)
  - Quadrant
  - Location (where the technology is tracked)

## SimilarityModal Component

The SimilarityModal component displays potential matches for technologies and allows administrators to normalise technology names efficiently.

### Features

- **Match Visualisation**: Displays similar technologies with their match percentage and source
- **Case Difference Highlighting**: Visually highlights case differences between technology names
- **One-Click Normalisation**: Apply normalisation with a single click
- **Source Indication**: Shows whether similar technologies come from the Tech Radar or reference lists
- **Threshold Display**: Shows the current similarity threshold percentage

### Usage

1. Click on a match count in the untracked technologies table
2. Review the list of similar technologies in the modal
3. View the match percentage and source for each suggestion
4. Click "Use" on a technology to normalise the untracked technology to that name
5. The system will prompt for confirmation before updating projects

### Interaction Flow

The SimilarityModal component integrates with the main TechManage component through the following workflow:

1. TechManage component detects similar technologies during data scanning
2. User clicks on a potential match count to open the SimilarityModal
3. User selects a technology to use for normalisation
4. TechManage component handles the normalisation process
5. Projects using the normalised technology are updated

This interaction flow ensures efficient technology normalisation while providing clear visibility into the potential impacts of normalisation decisions.
