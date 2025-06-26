import React, { useState, useEffect } from 'react';
import '../../styles/components/Banner.css';

/**
 * Banner component for displaying important messages to users.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The banner title/heading
 * @param {string} props.description - The banner description/message
 * @param {string} props.type - The banner type (info, warning, error)
 * @param {Function} props.onClose - Optional callback when banner is closed
 * @returns {JSX.Element|null} The Banner component or null if hidden
 */
const Banner = ({ title, description, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Create a unique key for this banner in localStorage
  const bannerId = `dismissed_banner_${title}_${description}`.replace(
    /\s+/g,
    '_'
  );

  useEffect(() => {
    // Check localStorage to see if this banner was previously dismissed
    const isDismissed = localStorage.getItem(bannerId);
    if (isDismissed) {
      setIsVisible(false);
    }
  }, [bannerId]);

  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);

    // Store the dismissed state in localStorage with current timestamp
    localStorage.setItem(
      bannerId,
      JSON.stringify({
        dismissedAt: new Date().getTime(),
      })
    );

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`banner banner-${type}`}>
      <div className="banner-content">
        {title && <h3 className="banner-title">{title}</h3>}
        {description && <p className="banner-description">{description}</p>}
      </div>
      <button className="banner-close-btn" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default Banner;
