import { TbX } from 'react-icons/tb';
import { toast } from 'react-hot-toast';

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
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-modal-title"
      aria-describedby="bug-modal-description"
    >
      <div className="bug-modal-content" onClick={e => e.stopPropagation()}>
        <div className="bug-modal-header">
          <h2 id="bug-modal-title">Report a Bug</h2>
          <button
            className="bug-modal-close-button"
            onClick={onClose}
            aria-label="Close bug report modal"
          >
            <TbX aria-hidden="true" />
          </button>
        </div>
        <p id="bug-modal-description">
          You will be redirected to GitHub to create an issue. Please do not
          include any sensitive information in your bug report.
        </p>
        <button className="bug-modal-action-button" onClick={handleCreateIssue}>
          Continue to GitHub
        </button>
        <div className="bug-modal-divider" aria-hidden="true" />
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
