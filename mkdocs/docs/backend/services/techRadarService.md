# Tech Radar Service

The Tech Radar Service provides centralised functionality for managing technology radar data, including retrieval, parsing, and updating of technology entries. It handles the complex logic of technology radar operations with proper validation and error handling.

## Overview

The service manages technology radar operations:

- Technology radar data retrieval and parsing
- Entry updates with validation
- Data structure management
- Integration with S3 storage
- Error handling and logging

## Dependencies

The service integrates with:

- S3 Service for data storage and retrieval
- Application logging system
- JSON parsing and validation utilities

## Methods

### `getTechRadarData()`

Retrieves and parses the complete technology radar dataset.

**Returns:** Promise resolving to parsed tech radar object

**Response Structure:**

```javascript
{
  quadrants: [
    {
      name: string,
      items: [
        {
          name: string,
          ring: string,
          quadrant: string,
          isNew: boolean,
          description: string
        }
      ]
    }
  ]
}
```

**Example:**

```javascript
const techRadarService = require('./techRadarService');

try {
  const radarData = await techRadarService.getTechRadarData();
  console.log(`Retrieved ${radarData.quadrants.length} quadrants`);
} catch (error) {
  console.error('Failed to retrieve tech radar data:', error);
}
```

### `updateTechRadarEntry(entryData)`

Updates a specific technology entry in the radar dataset.

**Parameters:**

- `entryData` (object) - The technology entry data to update

**Entry Data Structure:**

```javascript
{
  name: string,          // Technology name (required)
  ring: string,          // Technology ring (adopt/trial/assess/hold)
  quadrant: string,      // Technology quadrant
  isNew: boolean,        // Whether this is a new entry
  description: string    // Technology description
}
```

**Returns:** Promise resolving to update result

**Validation:**

- Ensures required fields are present
- Validates ring values against allowed options
- Checks for duplicate entries
- Maintains data integrity

**Example:**

```javascript
const newEntry = {
  name: "React Hooks",
  ring: "adopt",
  quadrant: "frameworks",
  isNew: true,
  description: "Modern React state management pattern"
};

try {
  const result = await techRadarService.updateTechRadarEntry(newEntry);
  console.log('Technology entry updated successfully');
} catch (error) {
  console.error('Failed to update entry:', error);
}
```

## Data Structure Management

### Quadrant Organisation

The service organises technologies into quadrants:

- **Languages & Frameworks** - Programming languages and development frameworks
- **Tools** - Development and operational tools
- **Platforms** - Cloud platforms and infrastructure services
- **Techniques** - Development practices and methodologies

### Ring Classification

Technologies are classified into rings based on adoption status:

- **Adopt** - Technologies ready for production use
- **Trial** - Technologies worth pursuing in proof of concepts
- **Assess** - Technologies to explore with the goal of understanding their fit
- **Hold** - Technologies to avoid or phase out

## Validation Logic

The service implements comprehensive validation:

### Entry Validation

```javascript
function validateEntry(entry) {
  const requiredFields = ['name', 'ring', 'quadrant'];
  const validRings = ['adopt', 'trial', 'assess', 'hold'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!entry[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate ring value
  if (!validRings.includes(entry.ring.toLowerCase())) {
    throw new Error(`Invalid ring: ${entry.ring}`);
  }
  
  return true;
}
```

### Duplicate Detection

```javascript
function checkForDuplicates(entries, newEntry) {
  const duplicate = entries.find(entry => 
    entry.name.toLowerCase() === newEntry.name.toLowerCase() &&
    entry.quadrant === newEntry.quadrant
  );
  
  if (duplicate) {
    throw new Error(`Entry already exists: ${newEntry.name}`);
  }
}
```

## Storage Integration

The service seamlessly integrates with S3 storage:

### Data Retrieval

```javascript
// Retrieve current radar data
const radarData = await s3Service.getObject(
  s3Service.getMainBucket(),
  'tech-radar-data.json'
);
```

### Data Persistence

```javascript
// Store updated radar data
await s3Service.putObject(
  s3Service.getMainBucket(),
  'tech-radar-data.json',
  updatedRadarData,
  'application/json'
);
```

## Error Handling

The service provides comprehensive error handling:

- **Validation Errors** - Clear messages for invalid data
- **Storage Errors** - Handling of S3 operation failures
- **Parsing Errors** - Management of malformed JSON data
- **Network Errors** - Graceful handling of connectivity issues

## Usage Examples

### Retrieve Technology Summary

```javascript
async function getTechnologySummary() {
  try {
    const radarData = await techRadarService.getTechRadarData();
    
    const summary = radarData.quadrants.map(quadrant => ({
      name: quadrant.name,
      totalTechnologies: quadrant.items.length,
      newTechnologies: quadrant.items.filter(item => item.isNew).length,
      adoptRing: quadrant.items.filter(item => item.ring === 'adopt').length,
      trialRing: quadrant.items.filter(item => item.ring === 'trial').length
    }));
    
    return summary;
  } catch (error) {
    console.error('Failed to get technology summary:', error);
    throw error;
  }
}
```

### Bulk Update Technologies

```javascript
async function bulkUpdateTechnologies(entries) {
  const results = [];
  
  for (const entry of entries) {
    try {
      await techRadarService.updateTechRadarEntry(entry);
      results.push({ name: entry.name, status: 'success' });
    } catch (error) {
      results.push({ name: entry.name, status: 'error', error: error.message });
    }
  }
  
  return results;
}
```

### Search Technologies

```javascript
async function searchTechnologies(searchTerm) {
  const radarData = await techRadarService.getTechRadarData();
  const allTechnologies = radarData.quadrants.flatMap(q => q.items);
  
  return allTechnologies.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
}
```

## Implementation Notes

- Uses transaction-like operations for data consistency
- Implements optimistic locking for concurrent updates
- Provides audit trail through logging
- Supports batch operations for efficiency
- Maintains backward compatibility with existing data formats
- Includes comprehensive validation to prevent data corruption
