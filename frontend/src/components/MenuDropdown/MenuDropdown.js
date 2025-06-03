import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/components/MenuDropdown.css";
import { TbSmartHome, TbEditCircle, TbUserShield, TbUsers, TbChartBar, TbHelp } from "react-icons/tb";
import { VscCopilot } from "react-icons/vsc";
import { IoMenu } from "react-icons/io5";
import { MdOutlineRadar } from "react-icons/md";

/**
 * MenuDropdown component for displaying a dropdown menu with navigation links.
 *
 * @param {Object} props - The props passed to the MenuDropdown component.
 * @param {boolean} props.show - Whether the dropdown menu should be shown.
 * @param {Function} props.onClose - Function to call when the dropdown menu is closed.
 */
function MenuDropdown({ setShowHelpModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * handleNavClick function navigates to the specified path and closes the dropdown menu.
   *
   * @param {string} path - The path to navigate to.
   */
  const handleNavClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleHelpClick = () => {
    setShowHelpModal(true);
    setIsOpen(false);
  };

  return (
    <div className="menu-dropdown" ref={dropdownRef}>
      <button className="menu-button" onClick={() => setIsOpen(!isOpen)} aria-label="Open menu">
        <IoMenu size={16} />
      </button>

      {isOpen && (
        <div className="dropdown-content">
            <div className="home-button-container">
              <button onClick={() => handleNavClick('/')} className={location.pathname === '/' ? 'active' : ''}>
                <TbSmartHome size={16} />
                Home
              </button>
            </div>
            <div>
              <button onClick={() => handleNavClick('/radar')} className={location.pathname === '/radar' ? 'active' : ''}>
                <MdOutlineRadar size={16} />
                Tech Radar
              </button>
              <button onClick={() => handleNavClick('/statistics')} className={location.pathname === '/statistics' ? 'active' : ''}>
                <TbChartBar size={16} />
                Statistics
              </button>
              <button onClick={() => handleNavClick('/projects')} className={location.pathname === '/projects' ? 'active' : ''}>
                <TbUsers size={16} />
                Projects
              </button>
              {/* Keep these as <a> tags */}
              <a href='/review/dashboard' className={location.pathname === '/review/dashboard' ? 'active' : ''}>
                <TbEditCircle size={16} />
                Review
              </a>
              <a href='/admin/dashboard' className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                <TbUserShield size={16} />
                Admin
              </a>
              <button onClick={() => handleNavClick('/copilot')} className={location.pathname === '/copilot' ? 'active' : ''}>
                <VscCopilot size={16} />
                CoPilot
              </button>
            </div>
            <div className="help-button-container">
              <button onClick={handleHelpClick}>
                <TbHelp size={16} />
                Help
              </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default MenuDropdown;
