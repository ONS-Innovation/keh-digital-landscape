import React from 'react';
import { TbX } from 'react-icons/tb';

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCreateIssue = () => {
    window.open(
      'https://github.com/ONS-Innovation/keh-digital-landscape/issues/new?labels=bug&template=bug_report.md',
      '_blank'
    );
  };

  const handleEmailReport = () => {
    const supportEmail = import.meta.env.VITE_SUPPORT_MAIL || '';
    if (supportEmail !== '') {
      window.location.href = `mailto:${supportEmail}`;
    } else {
      toast.error('No support email found');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bug-modal-content" onClick={e => e.stopPropagation()}>
        <div className="bug-modal-header">
          <h2>Report a Bug</h2>
          <button className="bug-modal-close-button" onClick={onClose}>
            <TbX />
          </button>
        </div>
        <p>
          You will be redirected to GitHub to create an issue. Please do not
          include any sensitive information in your bug report.
        </p>
        <button className="bug-modal-action-button" onClick={handleCreateIssue}>
          Continue to GitHub
        </button>
        <div className="bug-modal-divider" />
        <p className="bug-modal-email-text">
          Alternatively, you can email us directly about this issue.
        </p>
        <button
          className="bug-modal-action-button bug-modal-email-button"
          onClick={handleEmailReport}
        >
          Send Email
        </button>
      </div>
    </div>
  );
};

export default Modal;
