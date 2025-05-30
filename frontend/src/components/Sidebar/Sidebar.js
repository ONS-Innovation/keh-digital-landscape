import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/components/Sidebar.css";
import HelpModal from "../Header/HelpModal";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { MdOutlineRadar } from "react-icons/md";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import {
  TbSmartHome,
  TbEditCircle,
  TbUserShield,
  TbUsers,
  TbChartBar,
  TbHelp,
} from "react-icons/tb";
import { VscCopilot } from "react-icons/vsc";

const Sidebar = () => {
  const location = useLocation();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true" ? true : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed);
  }, [isCollapsed]);

  const handleSetShowHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };

  const navItems = [
    { path: "/", label: "Home", icon: <TbSmartHome />, isLink: true },
    {
      path: "/radar",
      label: "Tech Radar",
      icon: <MdOutlineRadar />,
      isLink: true,
    },
    {
      path: "/statistics",
      label: "Statistics",
      icon: <TbChartBar />,
      isLink: true,
    },
    { path: "/projects", label: "Projects", icon: <TbUsers />, isLink: true },
    {
      path: "/review/dashboard",
      label: "Review",
      icon: <TbEditCircle />,
      isLink: false,
    },
    {
      path: "/admin/dashboard",
      label: "Admin",
      icon: <TbUserShield />,
      isLink: false,
    },
    {
      path: "/copilot",
      label: "Copilot",
      icon: <VscCopilot />,
      isLink: true,
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <nav className="sidebar-nav">
        {navItems.map((item) =>
          item.isLink ? (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
              aria-label={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!isCollapsed && (
                <span className="sidebar-label">{item.label}</span>
              )}
            </Link>
          ) : (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
              aria-label={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!isCollapsed && (
                <span className="sidebar-label">{item.label}</span>
              )}
            </a>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-buttons">
          <button
            onClick={() => handleSetShowHelpModal()}
            className="sidebar-footer-button"
            aria-label="Help button to open help modal"
          >
            <span className="sidebar-icon">
              <TbHelp />
            </span>
            {!isCollapsed && <span className="sidebar-label">Help</span>}
          </button>
          <ThemeToggle variant={isCollapsed ? "small" : "large"} />
          <button
            className="sidebar-footer-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <IoChevronForward /> : <IoChevronBack />}

            {!isCollapsed && (
              <span className="sidebar-label">Collapse Sidebar</span>
            )}
          </button>
        </div>
      </div>
      <HelpModal
        show={showHelpModal}
        onClose={() => handleSetShowHelpModal()}
      />
    </aside>
  );
};

export default Sidebar;
