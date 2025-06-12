import { FaArrowRight } from "react-icons/fa";
import "../styles/CopilotPage.css";

const handleViewDataClick = (slug) => {
  console.log(`View data for ${slug}`);
};

export const getCellRenderers = () => ({
    avatar: ({ value }) =>
      value ? (
        <div className="custom-cell">
          <img className="avatar-image"
            src={value}
            alt="avatar"
          />
        </div>
      ) : null,

    github: ({ value }) =>
      value ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : null,

    url: ({ value }) =>
      value ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : null,

    viewData: ({ data }) =>
      data?.slug ? (
        <div className="custom-cell">
          <button className="view-data-button"
            onClick={() => handleViewDataClick(data.slug)}
            aria-label={`View data for ${data.name}`}
          >
            View <FaArrowRight />
          </button>
        </div>
      ) : null,
  });