# Frontend Testing

## Overview

The frontend testing is run using Playwright. Playwright is an end-to-end test framework. All API endpoints that serve data to the Digital Landscape application are being fulfilled using a function, <i>route.fulfill</i>.

## Test Implementation

The tests are implemented in the `testing/frontend/tests` directory using the Playwright framework. The tests are organised into the following files:

| Test File              | Description                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `project.test.js`      | Tests for Projects page and ProjectModal component, including field validation, miscellaneous items, and repository display |
| `review.test.js`       | Tests for Tech Review functionality                                                                                         |
| `search.test.js`       | Tests for search teams functionality                                                                                        |
| `techradar.test.js`    | Tests for the Tech Radar Page                                                                                               |
| `techreviewer.test.js` | Tests for Tech Reviewer functionality                                                                                       |
| `bugreport.test.js`    | Tests for Bug Report component                                                                                              |
| `toast-error.test.js`  | Tests for Toast error notifications                                                                                         |

### Running Tests

```bash
# Navigate to the testing directory
cd testing/frontend

# Install dependencies
make setup

# Run tests
make test-ui
```

### Test Data

The data necessary to mock the API is held under the `data` folder within `testing/frontend/tests/` folder in JS files containing the data in JSON format. If new tests are added it is advisable to add the required test data within the folder in the appropriate format.

#### Test Data Files

- `csvData.js` - General CSV data for projects
- `directorateData.js` - Directorate information
- `nodeBlipCases.js` - Tech Radar blip test cases
- `projectTechnology.js` - Project-specific technology data for modal testing
- `radarData.js` - Tech Radar configuration data
- `reviewPositionCases.js` - Review position test cases
