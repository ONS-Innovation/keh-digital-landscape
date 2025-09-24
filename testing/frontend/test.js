const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');
const {
  generateCombinedHtmlReport,
  generateCombinedMarkdownReport,
} = require('./generate');

// Load test configuration
const configPath = path.join(__dirname, 'test-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// collect optional axe tags from CLI arguments
const tags = process.argv.slice(2);

const timestamp = new Date().toISOString().replace(/:/g, '-');
const REPORTS_DIR = path.join(process.cwd(), 'reports', timestamp);

// ensure the root reports directory exists
fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.mkdirSync(path.join(REPORTS_DIR, 'JSON'), { recursive: true });

/**
 * Sets authentication cookies for routes that require them
 * @param {Object} context - Playwright browser context
 * @param {string} pageUrl - URL of the page being tested
 * @param {Object} pageConfig - Configuration for the page
 */
async function setupAuthentication(context, pageUrl, pageConfig) {
  // If the page requires authentication
  if (pageConfig.authenticated) {
    const cookieName = pageConfig.authenticated;
    const cookieValue = process.env[`TEST_${cookieName.toUpperCase()}`];

    if (!cookieValue) {
      console.warn(
        `Warning: Authentication required for ${pageUrl} but TEST_${cookieName.toUpperCase()} environment variable is not set.`
      );
      return;
    }

    console.log(`Setting authentication cookie '${cookieName}' for ${pageUrl}`);

    // Set the authentication cookie
    await context.addCookies([
      {
        name: cookieName,
        value: cookieValue,
        domain: new URL(config.global_settings.base_url).hostname,
        path: '/',
        httpOnly: true,
        secure: false, // Set to true for production with HTTPS
        sameSite: 'Lax',
      },
    ]);
  }
}

/**
 * Performs interactive testing by clicking specified elements
 * @param {Object} page - Playwright page object
 * @param {Array} testingElements - Array of selectors to click
 * @param {Object} settings - Global settings for wait times
 */
async function performInteractiveTesting(page, testingElements, settings) {
  for (const selector of testingElements) {
    try {
      console.log(`  - Clicking element: ${selector}`);

      // Wait for element to be visible and clickable
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);

      // Wait after click to allow any dynamic content to load
      await page.waitForTimeout(settings.wait_after_click);

      // Wait for any potential DOM changes
      await page.waitForLoadState('domcontentloaded');
    } catch (error) {
      console.warn(
        `  - Warning: Could not click element ${selector}: ${error.message}`
      );
    }
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: config.global_settings.headless,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Accumulate results for combined report
  const routeResults = [];

  const pages = Object.values(config.pages);
  const settings = config.global_settings;

  for (const pageConfig of pages) {
    const { name, url, testing } = pageConfig;
    console.log(`Testing ${url}`);

    // Set up authentication if needed before navigating to the page
    await setupAuthentication(context, url, pageConfig);

    await page.goto(`${settings.base_url}${url}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(settings.wait_after_load);

    // Perform interactive testing if elements are specified
    if (testing && testing.length > 0) {
      console.log(
        `  Performing interactive testing for ${testing.length} elements`
      );
      await performInteractiveTesting(page, testing, settings);
    }

    // build axe builder and apply tags if provided
    let builder = new AxeBuilder({ page });
    if (tags.length) {
      builder = builder.withTags(tags);
    }
    const accessibilityScanResults = await builder.analyze();

    // write JSON report
    const jsonFilename = `report-${name}.json`;
    const jsonPath = path.join(REPORTS_DIR, 'JSON', jsonFilename);
    fs.writeFileSync(
      jsonPath,
      JSON.stringify(accessibilityScanResults, null, 2)
    );

    // Accumulate for combined HTML report
    routeResults.push({ route: url, results: accessibilityScanResults });

    console.log(`Accessibility test completed for ${url}`);
    console.log(
      `Violations found: ${accessibilityScanResults.violations.length}`
    );
    console.log(`Full report saved.`);

    if (accessibilityScanResults.violations.length > 0) {
      accessibilityScanResults.violations.forEach(({ id, help, impact }) =>
        console.log(`- ${id}: ${help} (${impact} impact)`)
      );
    }
  }

  // Generate and write combined HTML report
  const combinedHtml = generateCombinedHtmlReport(routeResults, tags);
  const combinedHtmlFilename = `report.html`;
  const combinedHtmlPath = path.join(REPORTS_DIR, combinedHtmlFilename);
  fs.writeFileSync(combinedHtmlPath, combinedHtml);
  console.log(`Combined HTML report saved to: ${combinedHtmlPath}`);

  // Generate and write combined Markdown report
  const combinedMarkdown = generateCombinedMarkdownReport(routeResults, tags);
  const combinedMarkdownFilename = `report.md`;
  const combinedMarkdownPath = path.join(REPORTS_DIR, combinedMarkdownFilename);
  fs.writeFileSync(combinedMarkdownPath, combinedMarkdown);
  console.log(`Combined Markdown report saved to: ${combinedMarkdownPath}`);

  await browser.close();
})().catch(error => {
  console.error('Error running accessibility tests:', error);
  process.exit(1);
});
