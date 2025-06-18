import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import "../../styles/components/HelpModal.css";

/**
 * HelpModal component for displaying help information in a modal.
 *
 * @param {Object} props - The props passed to the HelpModal component.
 * @param {boolean} props.show - Whether the modal should be shown.
 * @param {Function} props.onClose - Function to call when the modal is closed.
 */
function HelpModal({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready before starting animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1000); // Match this with the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  const githubPagesLink = () => {
    return (
      <span>
        {" "}
        To view more detailed information about the Digital Landscape, view this
        documentation:
        <br />{" "}
        <a
          href="https://ons-innovation.github.io/keh-digital-landscape/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Digital Landscape Documentation
        </a>
        .
      </span>
    );
  };

  /**
   * getModalContent function returns the content for the help modal based on the current pathname.
   *
   * @returns {Object} - An object containing the title and content for the help modal.
   */
  const getModalContent = () => {
    switch (location.pathname) {
      case "/radar":
        return {
          title: "Tech Radar Help",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <h1>Guide</h1>
              <span>
                The Tech Radar is a visual representation of our technology
                landscape. Here&apos;s how to use it:
              </span>
              <ul className="help-modal-list">
                <li>
                  Click on any point on the Radar to see detailed information
                  about that technology
                </li>
                <li>
                  A box will fill with information about the technology and
                  relating projects
                </li>
                <li>
                  Click on the project to see more information about that
                  project
                </li>
                <li>
                  Use the search bar to find specific technologies on the Radar
                </li>
                <li>
                  Click the quadrant label on the Radar to filter the Radar to
                  that specific quadrant
                </li>
              </ul>
              <h1>Quadrants and Rings</h1>
              <ul className="help-modal-list">
                <li>
                  The 4 quadrants are:
                  <ul className="help-modal-sublist">
                    <li>
                      <strong>Languages:</strong> such as Python, JavaScript,
                      Java
                    </li>
                    <li>
                      <strong>Frameworks:</strong> such as Flask, React, Spring
                    </li>
                    <li>
                      <strong>Supporting Tools:</strong> such as CI/CD (e.g.
                      Jenkins, GitHub Actions, Concourse) and other tools used
                      for development, documentation and project management
                      (e.g. VSCode, Confluence, Jira)
                    </li>
                    <li>
                      <strong>Infrastructure:</strong> such as AWS, Azure, GCP
                    </li>
                  </ul>
                </li>
                <li>
                  What do the 4 rings mean?
                  <ul className="help-modal-sublist">
                    <li>
                      <strong>Adopt:</strong> technologies that are mature, widely adopted and recommended for use in production environments.
                    </li>
                    <li>
                      <strong>Trial:</strong> technologies that are gaining traction, have significant potential and warrant further investigation or experimentation.
                    </li>
                    <li>
                      <strong>Assess:</strong> technologies that are emerging, have some promise, but require further testing and refinement. These technologies have moved beyond the initial curiosity phase. They&apos;ve shown some success in limited use cases and are ready for more structured testing.
                    </li>
                    <li>
                      <strong>Hold:</strong> technologies that are either outdated, have significant limitations or do not align with the organisation&apos;s strategic direction.
                    </li>
                  </ul>
                </li>
                <li>
                  When should you use the technology in the 4 rings?
                  <ul className="help-modal-sublist">
                    <li>
                      <strong>Adopt:</strong> use these technologies as the foundation for core applications and infrastructure.
                    </li>
                    <li>
                      <strong>Trial:</strong> conduct pilot projects, proof-of-concepts, or small-scale deployments with a low risk to evaluate their suitability before adopting them widely.
                    </li>
                    <li>
                      <strong>Assess:</strong> experiment with these technologies in non-critical environments, such as research projects, internal tools or sandbox deployments.
                    </li>
                    <li>
                      <strong>Hold:</strong> avoid using these technologies unless they are required for supporting legacy systems that cannot be easily migrated.
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          ),
        };
      case "/":
        return {
          title: "Digital Landscape Help",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <h1>Overview</h1>
              <span>
                Welcome to the Digital Landscape - your overview of our digital
                technology ecosystem.
              </span>
              <ul className="help-modal-list">
                <li>Browse through different technology categories</li>
                <li>See trending technologies and recent changes</li>
                <li>Access detailed statistics and reports</li>
              </ul>
            </div>
          ),
        };
      case "/statistics":
        return {
          title: "Statistics Help",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <h1>Guide</h1>
              <span>
                The Statistics page is a visual representation of the languages
                used in the ONSDigital GitHub Organisation. Here&apos;s how to
                use it:
              </span>
              <ul className="help-modal-list">
                <li>
                  Select a date range to see the statistics and languages used
                  in that time period (default is all time).
                </li>
                <li>
                  Select a status to see the statistics and languages used in
                  that status (default is active).
                </li>
                <li>
                  Choose from the 5 filters below Language Statistics to sort
                  the languages by name, most/least repos, lines and usage or
                  Tech Radar languages only.
                </li>
                <li>
                  Use the search bar to find specific languages on the page.
                </li>
                <li>
                  Hovering over any language will adjust the &quot;Total
                  Repositories&quot; card to show a percentage.
                </li>
                <li>
                  Click on a language that is highlighted by a Tech Radar ring
                  colour to be directed to the Tech Radar page for that
                  language.
                </li>
              </ul>
            </div>
          ),
        };
      case "/projects":
        return {
          title: "Projects Help",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <h1>Guide</h1>
              <span>
                The Projects page is a visual representation of the projects in
                ONS. Here&apos;s how to use it:
              </span>
              <ul className="help-modal-list">
                <li>
                  View the list of projects. The bar to the right of the project
                  list shows the number of technologies listed in the project.
                </li>
                <li>
                  Click on a project to view the technologies listed in the
                  project.
                </li>
                <li>
                  Use the search bar to find specific projects on the page.
                </li>
                <li>
                  Click &quot;Sort By&quot; to sort the projects by name,
                  most/least technologies or technology status. The technology
                  status calculates the highest/least percentage of the ring of
                  technologies in the project.
                </li>
                <li>Click refresh to fetch the latest data.</li>
              </ul>
            </div>
          ),
        };
      case "/review/dashboard":
        return {
          title: "Review Dashboard",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <h1>Guide</h1>
              <span>
                This page should only be used by reviewers. Here is how to use
                it:{" "}
              </span>
              <ul className="help-modal-list">
                <li>
                  View respective rings as boxes, with the technology
                  categorised by quadrants.
                </li>
                <li>
                  Click on a technology and the timeline box will fill at the
                  top of the page.
                </li>
                <li>
                  Within the timeline box, you can click the edit button which
                  allows you to change the technology name and the category.
                </li>
                <li>
                  Click the tick button bring up a modal to show your changes
                  and confirm. These changes are irreversible.
                </li>
                <li>
                  You can drag a technology from one box to another. This will
                  update the timeline and ring of the technology.
                </li>
                <li>
                  To confirm your changes, press the &quot;Save Changes&quot; at
                  the bottom of the page.
                </li>
                <li>
                  You can add a technology by entering the new technology in the
                  &quot;Add Technology&quot; box, then selecting the category
                  and pressing &quot;Add Technology&quot;.
                </li>
              </ul>
            </div>
          ),
        };
      case "/admin/dashboard":
        return {
          title: "Admin Dashboard",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <h1>Banner Management</h1>

              <ul className="help-modal-list">
                <li>View the Existing banners at the bottom of the page.</li>
                <li>
                  To create a new banner, enter the banner title and the banner message. Then choose what type of banner, either Info, Warning or Error.
                </li>
                <li>
                  Select which pages to display the banner on, either Radar, Statistics or Projects.
                </li>
                <li>
                  Click on the &quot;Save Banner&quot; button to create the banner.
                </li>
                <li>
                  Click on the &quot;Delete&quot; button in the Existing banners to delete the banner.
                </li>
                <li>
                  Click on the &quot;Hide&quot; button in the Existing banners to hide the banner.
                </li>
                <li>
                  Click on the &quot;Show&quot; button in the Existing banners to show the banner.
                </li>
                
              </ul>
              <h1>Technology Management</h1>

              <ul className="help-modal-list">
                <li>View the Banner and Technology Management sections.</li>
                <li>
                  The blue technology items are the technologies that are in the Tech Radar but not the Technology Reference List.
                </li>
                <li>
                  The yellow technology items are the technologies that are in the Technology Reference List but not the Tech Radar.
                </li>
                <li>
                  Here are some general rules for the Technology Management section:
                  <ul className="help-modal-sublist">
                    <li>
                      <strong>Node.js</strong> instead of NodeJS or node.js
                    </li>
                    <li>
                      <strong>AWS</strong> instead of Amazon Web Services or aws
                    </li>
                    <li>
                      <strong>GCP</strong> instead of Google Cloud Platform or gcp
                    </li>
                    <li>
                      <strong>Azure</strong> instead of Microsoft Azure or azure
                    </li>
                    <li>
                      Capitalise and anagram the technology like AWS or CraftCMS unless it is a .js framework.
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          ),
        };
      case "/copilot":
        return {
          title: "Copilot Dashboard",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <h1>Guide</h1>
              <span>
                The Copilot dashboard visualises Copilot usage data across ONS Digital. Here&apos;s how to use it:
              </span>
              <ul className="help-modal-list">
                <li>
                  Click &quot;Organisation Usage&quot; to view Copilot usage across the ONS Digital organisation.
                </li>
                <li>
                  Click &quot;Team Usage&quot; to view Copilot usage for a specific team within ONS Digital. You must have permissions to view this team.
                </li>
                <li>
                  Switch between &quot;live&quot; and &quot;historic&quot; data to view real-time usage or historical trends.
                </li>
              </ul>
            </div>
          ),
        };
      default:
        return {
          title: "Help",
          content: (
            <div className="help-modal-body">
              {githubPagesLink()}
              <span>
                Welcome to our platform. Use the navigation menu to explore
                different sections.
              </span>
            </div>
          ),
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <div
      className={`help-modal-overlay ${isVisible ? "show" : ""}`}
      onClick={onClose}
    >
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2 className="help-modal-title">{modalContent.title}</h2>
          <button className="help-modal-close" onClick={onClose} aria-label="Close modal">
            <IoClose size={20} />
          </button>
        </div>
        {modalContent.content}
      </div>
    </div>
  );
}

export default HelpModal;
