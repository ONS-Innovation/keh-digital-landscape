import React from 'react';
import toast from 'react-hot-toast';
import { useBugReport } from '../../contexts/BugReportContext';
import '../../styles/components/ErrorToast.css';

const ErrorToast = ({ t, error }) => {
  const { openBugReportModal } = useBugReport();

  const handleReportBug = () => {
    toast.dismiss(t.id);
    openBugReportModal();
  };

  return (
    <div
      className="error-toast"
      style={{
        opacity: t.visible ? 1 : 0,
        transition: 'opacity 300ms',
      }}
    >
      <div className="error-toast-content">
        <div className="error-toast-body">
          <div className="error-toast-message">
            <p className="error-toast-title">An error occurred</p>
            <p className="error-toast-description">{error}</p>
            <p className="error-toast-description">
              Did you run into an issue?{' '}
              <button
                onClick={handleReportBug}
                className="error-toast-link-button"
              >
                Report a bug here.
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
