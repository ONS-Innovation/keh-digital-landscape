import React from 'react';
import '../../styles/components/BugReport.css';

const BugReport = () => {
  const supportEmail = import.meta.env.VITE_SUPPORT_MAIL || '';
  return (
    <div className="bug-report-container">
      <h2>Bug Report</h2>
      <span>
        If you have any bugs or issues with the Digital Landscape, please let us
        know by opening an issue on{' '}
        <a
          href="https://github.com/ONS-Innovation/keh-digital-landscape/issues/new?labels=bug&template=bug_report.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        . You will require a GitHub account to open an issue.
      </span>
      <p />
      <span>
        Or send an email to the{' '}
        <a
          href={`mailto:${supportEmail}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}
          Team
        </a>
        .
      </span>
    </div>
  );
};

export default BugReport;
