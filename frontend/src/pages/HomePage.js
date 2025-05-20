import React from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";
import Changelog from "../components/HomePage/Changelog";
import RecentBanners from "../components/HomePage/RecentBanners";
import { TbSmartHome, TbEditCircle, TbUserShield, TbUsers, TbChartBar, TbHelp } from "react-icons/tb";
import { MdOutlineRadar } from "react-icons/md";
import "../styles/HomePage.css";

/**
 * HomePage component for displaying the home page.
 *
 * @returns {JSX.Element} - The HomePage component.
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <Header
        searchTerm=""
        onSearchChange={() => {}}
        searchResults={[]}
        onSearchResultClick={() => {}}
        hideSearch={true}
      />
      <div className="home-page">
        <div className="home-content">
          <div className="home-content-header">
            <h1>The Digital Landscape of ONS</h1>
            <p>Explore and analyse technology trends across the organisation</p>
          </div>

          <div className="navigation-cards">
            <div className="nav-card" onClick={() => navigate("/radar")}>
              <div className="nav-card-header">
                <MdOutlineRadar />
                <h2>Tech Radar</h2>
              </div>
              <p>
                Explore the technology radar, including adoption status and
                trends over time.
              </p>
            </div>

            <div className="nav-card" onClick={() => navigate("/statistics")}>
              <div className="nav-card-header">
                <TbChartBar />
                <h2>Statistics</h2>
              </div>
              <p>
                Analyse repository statistics and language usage across the
                organisation.
              </p>
            </div>

            <div className="nav-card" onClick={() => navigate("/projects")}>
              <div className="nav-card-header">
                <TbUsers />
                <h2>Projects</h2>
              </div>
              <p>
                View all projects and their technology stacks across the
                organisation.
              </p>
            </div>

            <a className="nav-card" href="/review/dashboard">
              <div className="nav-card-header">
                <TbEditCircle />
                <h2>Review</h2>
              </div>
              <p>Authorised users can update the data on the Tech Radar.</p>
            </a>
            <a className="nav-card" href="/admin/dashboard">
              <div className="nav-card-header">
                <TbUserShield />
                <h2>Admin</h2>
              </div>
              <p>Manage system-wide settings and configurations.</p>
            </a>
          </div>

          <RecentBanners />
          <Changelog />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default HomePage;
