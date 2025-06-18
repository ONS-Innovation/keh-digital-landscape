/**
 * Generates an HTML report from axe results
 * @param {string} route - The route that was tested
 * @param {Object} results - The axe results object
 * @returns {string} - HTML report
 */
function generateHtmlReport(route, results) {
    // compute counts by impact severity
    const severityCounts = results.violations.reduce((acc, violation) => {
        const impact = violation.impact || (violation.nodes[0]?.any[0]?.impact) || 'unknown';
        acc[impact] = (acc[impact] || 0) + 1;
        return acc;
    }, {});
    const violationsList = results.violations.map(violation => {
      const nodesList = violation.nodes.map(node => {
        return `
          <div class="node">
            <h4>Element:</h4>
            <pre>${escapeHtml(node.html)}</pre>
            <h4>Failure Summary:</h4>
            <pre>${escapeHtml(node.failureSummary)}</pre>
          </div>
        `;
      }).join('');
      
      return `
        <div class="violation">
          <h3>${violation.id}: ${violation.help}</h3>
          <p><strong>Impact:</strong> ${violation.impact}</p>
          <p><strong>Description:</strong> ${violation.description}</p>
          <p><strong>Help URL:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>
          <h4>Affected Elements:</h4>
          ${nodesList}
        </div>
      `;
    }).join('');
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accessibility Report for ${route}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: hsl(222.2 84% 4.9%); margin-top: 0 }
          h2 { color: hsl(240 10% 3.9%); margin-top: 0 }
          h3 { color: hsl(0 73.7% 41.8%); margin-top: 0 }
          .summary { 
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .violation {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .node {
            background-color: hsl(210 40% 98%);
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
          }
          pre {
            background-color: hsl(212.7 26.8% 83.9%);
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
          }
          .impact-critical { border-left-color: #e74c3c; }
          .impact-serious { border-left-color: #e67e22; }
          .impact-moderate { border-left-color: #f39c12; }
          .impact-minor { border-left-color: #3498db; }
          .no-violations {
            color: hsl(142.8 64.2% 24.1%);
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>Accessibility Report</h1>
        <p>Report generated on ${new Date().toLocaleString()}</p>
        <h2>Page: ${route}</h2>
        
        <div class="summary">
          <h2>Summary</h2>
          <p>
            <strong>Total Violations:</strong> ${results.violations.length}<br>
            <strong>Critical:</strong> ${severityCounts.critical || 0}<br>
            <strong>Serious:</strong> ${severityCounts.serious || 0}<br>
            <strong>Moderate:</strong> ${severityCounts.moderate || 0}<br>
            <strong>Minor:</strong> ${severityCounts.minor || 0}<br>
            <strong>Passes:</strong> ${results.passes.length}<br>
            <strong>Incomplete:</strong> ${results.incomplete.length}<br>
            <strong>Inapplicable:</strong> ${results.inapplicable.length}
          </p>
        </div>
        
        <h2>Violations</h2>
        ${results.violations.length === 0 ? 
          '<p class="no-violations">No violations found!</p>' : 
          violationsList}
      </body>
      </html>
    `;
  }
  
  /**
   * Escapes HTML special characters
   * @param {string} html - String to escape
   * @returns {string} - Escaped string
   */
  function escapeHtml(html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Add a combined report generator
  function generateCombinedHtmlReport(routeResults, tags) {
    const now = new Date().toLocaleString();
    const reportSections = routeResults.map(({ route, results }) => {
      const html = generateHtmlReport(route, results);
      const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
      const bodyContent = match ? match[1] : '';
      return `
        <section class="page-report">
          ${bodyContent}
        </section>
        <hr />
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Combined Accessibility Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: hsl(222.2 84% 4.9%); margin-top: 0 }
          h2 { color: hsl(240 10% 3.9%); margin-top: 0 }
          h3 { color: hsl(0 73.7% 41.8%); margin-top: 0 }
          .summary { 
            background-color: hsl(210 40% 98%);
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .violation {
            background-color: hsl(0 85.7% 97.3%);
            border: 1px solid hsl(20 5.9% 90%);
            border-radius: 3px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .node {
            background-color: #f8f9fa;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
          }
          pre {
            background-color: #f1f1f1;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
          }
          .impact-critical { border-left-color: #e74c3c; }
          .impact-serious { border-left-color: #e67e22; }
          .impact-moderate { border-left-color: #f39c12; }
          .impact-minor { border-left-color: #3498db; }
          .no-violations {
            color: hsl(142.8 64.2% 24.1%);
            font-weight: bold;
          }
          .page-report {
            margin-bottom: 40px;
          }
        </style>
      </head>
      <body>
        <h1>Combined Accessibility Report</h1>
        <p>Report generated on ${now}</p>
        <p>Tested with tags: ${tags && tags.length ? tags.join(', ') : 'all'}</p>
        ${reportSections}
      </body>
      </html>
    `;
  }

  // Add markdown report generators
  function generateMarkdownReport(route, results) {
    // compute counts by impact severity
    const severityCounts = results.violations.reduce((acc, violation) => {
      const impact = violation.impact || (violation.nodes[0]?.any[0]?.impact) || 'unknown';
      acc[impact] = (acc[impact] || 0) + 1;
      return acc;
    }, {});

    const violationsList = results.violations.map(violation => {
      const nodesList = violation.nodes.map(node => {
        return `
#### Element:
\`\`\`html
${node.html}
\`\`\`

#### Failure Summary:
\`\`\`
${node.failureSummary}
\`\`\`
`;
      }).join('\n');
      
      return `
### ${violation.id}: ${violation.help}
- **Impact:** ${violation.impact}
- **Description:** ${violation.description}
- **Help URL:** ${violation.helpUrl}

#### Affected Elements:
${nodesList}
`;
    }).join('\n---\n');

    return `
# Accessibility Report
Report generated on ${new Date().toLocaleString()}

## Page: ${route}

## Summary
- **Total Violations:** ${results.violations.length}
- **Critical:** ${severityCounts.critical || 0}
- **Serious:** ${severityCounts.serious || 0}
- **Moderate:** ${severityCounts.moderate || 0}
- **Minor:** ${severityCounts.minor || 0}
- **Passes:** ${results.passes.length}
- **Incomplete:** ${results.incomplete.length}
- **Inapplicable:** ${results.inapplicable.length}

## Violations
${results.violations.length === 0 ? 
  '**No violations found!**' : 
  violationsList}
`;
  }

  function generateCombinedMarkdownReport(routeResults, tags) {
    const now = new Date().toLocaleString();
    const reportSections = routeResults.map(({ route, results }) => {
      const markdown = generateMarkdownReport(route, results);
      // Remove the first line (report title) to avoid duplication
      const content = markdown.split('\n').slice(2).join('\n');
      return content;
    }).join('\n\n---\n\n');

    return `# Combined Accessibility Report
Report generated on ${now}
${tags && tags.length ? `\nTested with tags: ${tags.join(', ')}` : '\nTested with all tags'}

${reportSections}`;
  }

  // Update exports to include markdown generators
  module.exports = {
    generateHtmlReport,
    generateCombinedHtmlReport,
    generateMarkdownReport,
    generateCombinedMarkdownReport
  };