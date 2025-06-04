# Backend Utilities

The backend utilities provide essential helper functions and transformers that support the core application functionality. These utilities handle common tasks such as authentication, data transformation, and array manipulation.

## Overview

The utilities directory contains:
- **GitHub App Authentication** - Secure authentication with GitHub APIs
- **Project Data Transformation** - Converting between data formats
- **Technology Array Management** - Updating technology arrays

## GitHub App Authentication

### `getAppAndInstallation.js`

Provides secure authentication for GitHub API operations using GitHub App credentials stored in AWS Secrets Manager.

#### Configuration

The utility requires the following environment variables:
- `GITHUB_ORG` - Target GitHub organisation (default: "ONSdigital")
- `GITHUB_APP_ID` - GitHub App ID for authentication
- `AWS_SECRET_NAME` - AWS Secrets Manager secret containing the private key
- `AWS_REGION` - AWS region for Secrets Manager (configured as "eu-west-2")

#### Method: `getAppAndInstallation()`

Authenticates with GitHub and returns an installation-scoped Octokit instance.

**Returns:** Promise resolving to authenticated Octokit instance

**Process:**
1. Retrieves GitHub App private key from AWS Secrets Manager
2. Creates GitHub App instance using App ID and private key
3. Gets installation details for the specified organisation
4. Returns installation-scoped Octokit client

**Example:**
```javascript
const { getAppAndInstallation } = require('./utilities/getAppAndInstallation');

async function getRepositories() {
  try {
    const octokit = await getAppAndInstallation();
    const response = await octokit.request('GET /orgs/{org}/repos', {
      org: 'ONSdigital'
    });
    return response.data;
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

## Project Data Transformation

### `projectDataTransformer.js`

Transforms project data from raw JSON format to structured CSV format for export and analysis.

#### Method: `transformProjectToCSVFormat(project)`

Converts a project object from JSON structure to CSV-compatible format.

**Parameters:**
- `project` (object) - Raw project data object

**Returns:** Transformed project object in CSV format

**Key Transformations:**

#### User Role Extraction
```javascript
// Technical contact with ONS email
const technicalContactUser = project.user.find(u => 
  u.roles.includes("Technical Contact") && 
  (u.email?.includes("@ons.gov.uk") || u.email?.includes("@ext.ons.gov.uk"))
);

// Format: email (grade)
const technicalContact = technicalContactUser 
  ? `${technicalContactUser.email} (${technicalContactUser.grade})`
  : "";
```

#### Technology Array Formatting
```javascript
const mainLanguages = project.architecture.languages.main.join("; ");
const frameworks = project.architecture.frameworks.others.join("; ");
```

#### Development Context
```javascript
const developed = project.developed[1] != '' 
  ? `${project.developed[0]} with ${project.developed.slice(1).join(", ")}` 
  : project.developed[0];
```

**Output Structure:**
```javascript
{
  Project: string,                    // Project name
  Project_Short: string,              // Short project name
  Programme: string,                  // Programme name
  Programme_Short: string,            // Short programme name
  Description: string,                // Project description
  Stage: string,                      // Development stage
  Developed: string,                  // Development context
  Technical_Contact: string,          // Technical contact (email + grade)
  Delivery_Manager: string,           // Delivery manager (email + grade)
  Language_Main: string,              // Main programming languages
  Language_Others: string,            // Other languages
  Language_Frameworks: string,        // Frameworks used
  Hosted: string,                     // Hosting platforms
  Architectures: string,              // Architecture details
  Source_Control: string,             // Source control system
  Repo: string,                       // Repository URLs
  CICD: string,                       // CI/CD tools
  Datastores: string,                 // Data storage solutions
  Database_Technologies: string,      // Database technologies
  Project_Tools: string,              // Project tracking tools
  Documentation: string,              // Documentation links
  Infrastructure: string,             // Infrastructure tools
  Code_Editors: string,               // Code editors used
  Communication: string,              // Communication tools
  Collaboration: string,              // Collaboration tools
  Incident_Management: string,        // Incident management tools
  Documentation_Tools: string,        // Documentation tools
  UI_Tools: string,                   // UI/UX tools
  Diagram_Tools: string               // Diagramming tools
}
```

**Example Usage:**
```javascript
const { transformProjectToCSVFormat } = require('./utilities/projectDataTransformer');

const rawProject = {
  details: [{ name: "Digital Platform", short_name: "DP" }],
  user: [
    {
      email: "tech.lead@ons.gov.uk",
      grade: "Senior Developer",
      roles: ["Technical Contact"]
    }
  ],
  architecture: {
    languages: {
      main: ["JavaScript", "Python"],
      others: ["Go"]
    }
  }
  // ... other project data
};

const csvProject = transformProjectToCSVFormat(rawProject);
console.log(csvProject.Technical_Contact); // "tech.lead@ons.gov.uk (Senior Developer)"
```

## Technology Array Management

### `updateTechnologyInArray.js`

Provides helper functionality for updating technology names within arrays, supporting technology normalisation processes.

#### Method: `updateTechnologyInArray(array, from, to)`

Updates technology names in arrays while tracking whether changes occurred.

**Parameters:**
- `array` (string[]) - Array of technology names
- `from` (string) - Original technology name to replace
- `to` (string) - New technology name

**Returns:** Object containing updated array and change status
```javascript
{
  array: string[],    // Updated array
  updated: boolean    // Whether an update occurred
}
```

**Features:**
- Case-sensitive matching
- Non-destructive operation (returns new array)
- Change tracking for audit purposes
- Handles null/undefined arrays gracefully

**Example Usage:**
```javascript
const { updateTechnologyInArray } = require('./utilities/updateTechnologyInArray');

const technologies = ["React", "Vue.js", "Angular"];

// Update Vue.js to Vue
const result = updateTechnologyInArray(technologies, "Vue.js", "Vue");
console.log(result.array);    // ["React", "Vue", "Angular"]
console.log(result.updated);  // true

// Attempt to update non-existent technology
const noChange = updateTechnologyInArray(technologies, "Svelte", "SvelteKit");
console.log(noChange.updated); // false
```

## Integration Examples

### Complete Authentication Flow
```javascript
const { getAppAndInstallation } = require('./utilities/getAppAndInstallation');

async function authenticatedGitHubOperation() {
  try {
    // Get authenticated client
    const octokit = await getAppAndInstallation();
    
    // Perform GitHub API operations
    const repos = await octokit.request('GET /orgs/{org}/repos', {
      org: process.env.GITHUB_ORG
    });
    
    return repos.data;
  } catch (error) {
    console.error('GitHub operation failed:', error);
    throw error;
  }
}
```

### Bulk Data Transformation
```javascript
const { transformProjectToCSVFormat } = require('./utilities/projectDataTransformer');

async function exportProjectsToCSV(projects) {
  const csvData = projects.map(project => {
    try {
      return transformProjectToCSVFormat(project);
    } catch (error) {
      console.error(`Failed to transform project ${project.details?.[0]?.name}:`, error);
      return null;
    }
  }).filter(Boolean);
  
  return csvData;
}
```

### Technology Normalisation
```javascript
const { updateTechnologyInArray } = require('./utilities/updateTechnologyInArray');

function normaliseProjectTechnologies(project, normalisationMap) {
  let updated = false;
  const updatedProject = { ...project };
  
  // Update main languages
  for (const [from, to] of Object.entries(normalisationMap)) {
    const result = updateTechnologyInArray(
      project.architecture.languages.main, 
      from, 
      to
    );
    
    if (result.updated) {
      updatedProject.architecture.languages.main = result.array;
      updated = true;
    }
  }
  
  return { project: updatedProject, updated };
}
```

## Implementation Notes

- All utilities follow consistent error handling patterns
- Functions are designed to be composable and reusable
- Authentication utilities handle AWS/GitHub integration securely
- Data transformers preserve original data structure integrity
- Array utilities provide audit trails for changes
- Compatible with both synchronous and asynchronous workflows 