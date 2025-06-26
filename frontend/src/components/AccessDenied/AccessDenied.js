import React from 'react';
import { Link } from 'react-router-dom';
import { TbLock, TbHome, TbUserX, TbInfoCircle } from 'react-icons/tb';
import '../../styles/components/AccessDenied.css';

/**
 * AccessDenied component shown when user doesn't have required permissions
 * @param {Object} props - Component props
 * @param {string} props.pageName - Name of the page being accessed
 * @param {string} props.userEmail - Current user's email
 * @param {string[]} props.userGroups - Current user's groups
 * @param {string[]} props.requiredRoles - Required roles for access
 * @param {boolean} props.isDevelopmentMode - Whether in development mode
 */
const AccessDenied = ({
  pageName,
  userEmail,
  userGroups,
  requiredRoles,
  isDevelopmentMode,
}) => {
  const isGuest = !userEmail || userEmail === null;

  return (
    <div className="access-denied-container">
      <div className="access-denied-content">
        <div className="access-denied-icon">
          <TbLock size={64} />
        </div>

        <h1 className="access-denied-title">Access Denied</h1>

        <p className="access-denied-message">
          You don&apos;t have permission to access the{' '}
          <strong>{pageName}</strong> page.
        </p>

        <div className="access-denied-details">
          <div className="user-info-section">
            <div className="info-item">
              <TbUserX size={20} />
              <span>
                {isGuest ? (
                  <span className="guest-text">Guest User</span>
                ) : (
                  <span className="user-email">{userEmail}</span>
                )}
              </span>
            </div>

            <div className="info-item">
              <TbInfoCircle size={20} />
              <span>
                Your roles:{' '}
                {userGroups.length > 0 ? (
                  <span className="user-groups">{userGroups.join(', ')}</span>
                ) : (
                  <span className="no-groups">No roles assigned</span>
                )}
              </span>
            </div>
          </div>

          {isDevelopmentMode && (
            <div className="dev-mode-notice">
              <TbInfoCircle size={16} />
              Running in development mode
            </div>
          )}

          {isGuest && (
            <div className="guest-notice">
              <p>You need to be authenticated to access this page.</p>
              <p>Please contact the KEH team for access.</p>
            </div>
          )}

          {!isGuest && userGroups.length === 0 && (
            <div className="no-roles-notice">
              <p>Your account doesn&apos;t have any roles assigned.</p>
              <p>Please contact the KEH team to request access.</p>
            </div>
          )}

          {!isGuest && userGroups.length > 0 && (
            <div className="insufficient-roles-notice">
              <p>
                Your current role{userGroups.length > 1 ? 's' : ''}{' '}
                {userGroups.length > 1 ? "don't" : "doesn't"} have access to
                this page.
              </p>
              <p>
                Please contact the KEH team to request additional permissions.
              </p>
            </div>
          )}
        </div>

        <div className="access-denied-actions">
          <Link to="/" className="back-home-btn">
            <TbHome size={16} />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
