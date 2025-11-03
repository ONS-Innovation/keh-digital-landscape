# Frontend Testing

## Overview

The frontend testing is run using Playwright. Playwright is an end-to-end test framework. All API endpoints that serve data to the Digital Landscape application are being fulfilled using a function, <i>route.fulfill</i>.

## Test Implementation

The tests are implemented in the `testing/frontend/tests` directory using the Playwright framework. The tests are organised into two main files:

- `search.test.js` - Test for search teams functionality
- `techradar.test.js` - Tests for Tech Radar. Currently tests Infrastructure (GCP & AWS nodes) and Languages (JavaScript/Typescript and Java nodes) sections of the radar.

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

The data necessary to mock the API is held under the `data` folder withing `testing/frontend/tests/` folder in JS files containing the data in JSON format. If new tests are added it is advisable to add the required test data within the folder in the appropriate format.
