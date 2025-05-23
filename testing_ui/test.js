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

const pages = ['/', '/radar', '/statistics', '/projects', '/review/dashboard', '/admin/dashboard', '/copilot'];
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
    

    // write JSON report
    const jsonFilename = `report-${routeName}.json`;
    const jsonPath = path.join(REPORTS_DIR, 'JSON', jsonFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(accessibilityScanResults, null, 2));

    // Accumulate for combined HTML report
    routeResults.push({ route, results: accessibilityScanResults });

    console.log(`Accessibility test completed for ${route}`);
    console.log(`Violations found: ${accessibilityScanResults.violations.length}`);
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
