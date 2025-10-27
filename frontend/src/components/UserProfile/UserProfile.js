import { useEffect, useState, useRef } from 'react';
import { useData } from '../../contexts/dataContext';
import {
  TbUser,
  TbEditCircle,
  TbUserShield,
  TbUsers,
  TbLogout,
  TbChevronDown,
} from 'react-icons/tb';
import { logoutUser } from '../../utilities/getUser';
import '../../styles/components/UserProfile.css';

/**
 * UserProfile component that displays user information with role-based avatar
 * @param {Object} props - Component props
 * @param {boolean} props.isCollapsed - Whether the sidebar is collapsed (for sidebar variant)
 * @param {string} props.variant - 'sidebar' or 'dropdown' to control styling
 */
const UserProfile = ({ isCollapsed = false, variant = 'sidebar' }) => {
  const { getUserData, clearCache } = useData();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [getUserData]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserIcon = () => {
    if (!user?.user?.groups || user.user.groups.length === 0) {
      return <TbUser size={20} />; // Default user icon
    }

    const groups = user.user.groups;
    const isAdmin = groups.includes('admin');
    const isReviewer = groups.includes('reviewer');

    if (isAdmin && isReviewer) {
      // Both admin and reviewer - show combined icon
      return <TbUsers size={20} />;
    } else if (isAdmin) {
      // Admin only
      return <TbUserShield size={20} />;
    } else if (isReviewer) {
      // Reviewer only
      return <TbEditCircle size={20} />;
    } else {
      // Default user
      return <TbUser size={20} />;
    }
  };

  const getDisplayEmail = () => {
    if (isLoading) return 'Loading...';
    if (!user?.user?.email) return 'Guest';
    return user.user.email;
  };

  const isLoggedIn = () => {
    return user?.user?.email && user.user.email !== null;
  };

  const handleLogout = async () => {
    try {
      await logoutUser(clearCache);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleLogoutMenu = () => {
    if (isLoggedIn()) {
      setShowLogoutMenu(!showLogoutMenu);
    }
  };

  if (variant === 'sidebar' && isCollapsed) {
    return (
      <div className="user-profile user-profile-sidebar collapsed">
        <div className="user-avatar">{getUserIcon()}</div>
      </div>
    );
  }

  return (
    <div className={`user-profile user-profile-${variant}`} ref={dropdownRef}>
      <div className="user-profile-content" onClick={toggleLogoutMenu}>
        <div className="user-avatar">{getUserIcon()}</div>
        <div className="user-info">
          <div className="user-email" title={getDisplayEmail()}>
            {getDisplayEmail()}
          </div>
          {user?.development_mode && (
            <div className="user-dev-badge">Dev Mode</div>
          )}
        </div>
        {isLoggedIn() && (
          <div className="user-profile-chevron">
            <TbChevronDown size={14} />
          </div>
        )}
      </div>

      {isLoggedIn() && showLogoutMenu && (
        <div className="user-profile-menu">
          <button className="logout-button" onClick={handleLogout}>
            <TbLogout size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
