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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bug-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report a Bug</h2>
          <button className="modal-close-button" onClick={onClose}>
            <TbX />
          </button>
        </div>
        <p>
          You will be redirected to GitHub to create an issue. Please do not
          include any sensitive information in your bug report.
        </p>
        <button className="modal-action-button" onClick={handleCreateIssue}>
          Continue to GitHub
        </button>
      </div>
    </div>
  );
};

export default Modal;
