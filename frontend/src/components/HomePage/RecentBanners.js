import { useEffect, useState } from 'react';
import { IoInformationCircle, IoWarning, IoAlertCircle } from 'react-icons/io5';
import '../../styles/components/RecentBanners.css';

const RecentBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBannerIcon = type => {
    switch (type) {
      case 'info':
        return <IoInformationCircle className="banner-icon info" />;
      case 'warning':
        return <IoWarning className="banner-icon warning" />;
      case 'error':
        return <IoAlertCircle className="banner-icon error" />;
      default:
        return <IoInformationCircle className="banner-icon info" />;
    }
  };

  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatPages = pages => {
    if (pages.length === 3) {
      return (
        capitalizeFirstLetter(pages[0]) +
        ', ' +
        capitalizeFirstLetter(pages[1]) +
        ' and ' +
        capitalizeFirstLetter(pages[2])
      );
    } else if (pages.length === 2) {
      return (
        capitalizeFirstLetter(pages[0]) +
        ' and ' +
        capitalizeFirstLetter(pages[1])
      );
    }
    return capitalizeFirstLetter(pages[0]);
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const baseUrl = `${backendUrl}/api/banners/all`;

        const response = await fetch(baseUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }
        const data = await response.json();

        setBanners(data.messages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="recent-banners-loading">Loading recent banners...</div>
    );
  }

  if (error) {
    return (
      <div className="recent-banners-error">
        Error loading recent banners: {error}
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="recent-banners-container">
      <h2>Recent Announcements</h2>
      <span>
        These announcements are shown as banners at the bottom of different
        pages across the Digital Landscape.
      </span>
      <div className="recent-banners-list">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`recent-banner-item banner-${banner.type}`}
          >
            <div className="recent-banner-header">
              <div className="banner-title-container">
                {getBannerIcon(banner.type)}
                <h3>{banner.title}</h3>
              </div>
              <span className="recent-banner-pages">
                Shown on {formatPages(banner.pages)}
              </span>
            </div>
            <div className="recent-banner-body">
              {banner.message.split('\n').map((line, i) => (
                <p key={i} className="recent-banner-line">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentBanners;
