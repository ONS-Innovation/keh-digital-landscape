# Accessibility Testing

The Digital Landscape application includes automated accessibility testing to ensure compliance with web accessibility standards using Axe-core and Playwright.

## Overview

Our accessibility testing framework automatically scans all major routes in the application and generates detailed reports of accessibility issues. This helps identify barriers that might prevent users with disabilities from accessing our content.

## Key Features

- Automated testing of all main application routes
- Detailed reports with severity categorisation
- HTML and Markdown report generation
- Impact-based violation grouping (Critical, Serious, Moderate, Minor)
- Support for filtering by specific WCAG tags

## Implementation

The testing is implemented using:

- **Playwright**: For headless browser automation
- **Axe-core**: For accessibility testing and rule evaluation
- **Node.js**: For running the tests and generating reports

```javascript
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');
const { 
  generateCombinedHtmlReport, 
  generateCombinedMarkdownReport 
} = require('./generate');

// collect optional axe tags from CLI arguments
const tags = process.argv.slice(2);

const pages = ['/', '/radar', '/statistics', '/projects', '/review/dashboard', '/admin/dashboard'];
const timestamp = new Date().toISOString().replace(/:/g, '-');
const REPORTS_DIR = path.join(process.cwd(), 'reports', timestamp);

// ensure the root reports directory exists
fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.mkdirSync(path.join(REPORTS_DIR, 'JSON'), { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Accumulate results for combined report
  const routeResults = [];

  for (const route of pages) {
    // sanitise route name to avoid nested paths in filenames
    const rawName = route === '/' ? 'home' : route.slice(1);
    const routeName = rawName.replace(/\//g, '-');
    console.log(`Testing ${route}`);

    await page.goto(`http://localhost:3000${route}`);

    // build axe builder and apply tags if provided
    let builder = new AxeBuilder({ page });
    if (tags.length) {
      builder = builder.withTags(tags);
    }
    const accessibilityScanResults = await builder.analyze();
    
    // Process results and generate reports
    // ...
  }
})();
```

## Report Generation

The testing framework generates three types of reports:

1. **Individual JSON reports**: Raw data for each route
2. **Combined HTML report**: Human-readable report with detailed information and styling
3. **Combined Markdown report**: Suitable for documentation systems and GitHub

### Report Example

HTML reports include:

- Total violation counts
- Breakdown by severity (Critical, Serious, Moderate, Minor)
- Detailed descriptions of each issue
- Specific HTML elements causing violations
- Links to remediation resources

## Running the Tests

To run the accessibility tests:

```bash
# Navigate to the testing_ui directory
cd testing_ui

# Run tests with all rules
npm run test:accessibility

# Run tests with specific tags
npm run test:accessibility wcag2a wcag2aa
```

## Understanding Violations

Violations are categorised by impact:

- **Critical**: Blocking issues that prevent users from accessing content
- **Serious**: Major barriers that significantly impair user experience
- **Moderate**: Issues that cause frustration or confusion
- **Minor**: Subtle issues that may impact some users

## Interpreting Results

When reviewing accessibility reports:

1. Focus on Critical and Serious issues first
2. Look for patterns across multiple pages
3. Prioritise fixes that impact the largest number of users
4. Address violations with clear remediation guidance

## Integration with Development Workflow

Accessibility testing is integrated into our development workflow to:

- Catch issues early in development
- Ensure new features maintain accessibility standards
- Track accessibility improvements over time
- Document compliance for audit purposes

## WCAG Compliance

Our accessibility testing is aligned with Web Content Accessibility Guidelines (WCAG), specifically targeting:

- WCAG 2.1 AA compliance as a minimum standard
- Key areas of focus:
  - Keyboard navigation
  - Screen reader compatibility
  - Colour contrast
  - Form labelling and validation
  - Focus management
