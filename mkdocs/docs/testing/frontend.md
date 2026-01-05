# Frontend Testing

## Overview

The frontend testing is run using Playwright. Playwright is an end-to-end test framework. All API endpoints that serve data to the Digital Landscape application are being fulfilled using a function, <i>route.fulfill</i>.

## Test Implementation

The tests are implemented in the `testing/frontend/tests` directory using the Playwright framework. We organise our tests by feature/page of the tool, with each test file focusing on a specific aspect of the application. To give some exaples:

- `search.test.js` - Test for Copilot search teams functionality
- `techradar.test.js` - Tests for Tech Radar page.
- `bugreport.test.js` - Tests for Bug Report component.

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

### Debugging Tests

Sometimes, it can be useful to run Playwright commands manually to debug tests. Here are some useful commands:

```bash
npx playwright test <test-file> # Run a specific test file
npx playwright test <test-file> --headed # Run tests with a visible browser window
```

Additionally, you can add `await page.pause();` in your test code to pause execution and open the Playwright Inspector, allowing you to step through the test interactively.

### Testing in CI

To make our CI tests more reliable, we set the `CI` environment variable to `true` when running Playwright tests in our GitHub Actions workflow. This helps Playwright optimise its behavior for CI environments, reducing the likelihood of flaky tests.

When `CI` is set to `true`, Playwright adjusts its timeouts and retries to better suit the slower and more variable performance within GitHub Actions runners. The configuration are available within the `playwright.config.js` file in the `testing/frontend` directory.

Sometimes, tests may still fail due to transient issues. In such cases, we recommend re-running the failed jobs in GitHub Actions to see if the issue persists.
