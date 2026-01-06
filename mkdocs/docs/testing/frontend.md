# Frontend Testing

## Overview

The frontend testing is run using Playwright. Playwright is an end-to-end test framework. All API endpoints that serve data to the Digital Landscape application are being fulfilled using a function, <i>route.fulfill</i>.

## Test Implementation

The tests are implemented in the `testing/frontend/tests` directory using the Playwright framework. We organise our tests by feature/page of the tool, with each test file focusing on a specific aspect of the application. To give some examples:

The tests are implemented in the `testing/frontend/tests` directory using the Playwright framework. The tests are organised into the following files:

| Test File              | Description                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `addressbook.test.js`      | Tests for Address Book page including sidebar selection, input and output validation |
| `project.test.js`      | Tests for Projects page and ProjectModal component, including field validation, miscellaneous items, and repository display |
| `review.test.js`       | Tests for Tech Review functionality                                                                                         |
| `search.test.js`       | Tests for Copilot Teams Search                                                                                              |
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

### Debugging Tests

Sometimes, it can be useful to run Playwright commands manually to debug tests. Here are some useful commands:

```bash
npx playwright test <test-file> # Run a specific test file
npx playwright test <test-file> --headed # Run tests with a visible browser window
```

Additionally, you can add `await page.pause();` in your test code to pause execution and open the Playwright Inspector, allowing you to step through the test interactively.

### Testing in CI

To make our CI tests more reliable, we set the `CI` environment variable to `true` when running Playwright tests in our GitHub Actions workflow. This helps Playwright optimise its behaviour for CI environments, reducing the likelihood of flaky tests.

When `CI` is set to `true`, Playwright adjusts its timeouts and retries to better suit the slower and more variable performance within GitHub Actions runners. The configuration are available within the `playwright.config.js` file in the `testing/frontend` directory.

Sometimes, tests may still fail due to transient issues. In such cases, we recommend re-running the failed jobs in GitHub Actions to see if the issue persists.

#### Test Data Files

The data necessary to mock the API is held under the `data` folder within `testing/frontend/tests/` folder in JS files containing the data in JSON format. If new tests are added it is advisable to add the required test data within the folder in the appropriate format.

- `csvData.js` - General CSV data for projects
- `directorateData.js` - Directorate information
- `nodeBlipCases.js` - Tech Radar blip test cases
- `projectTechnology.js` - Project-specific technology data for modal testing
- `radarData.js` - Tech Radar configuration data
- `reviewPositionCases.js` - Review position test cases
