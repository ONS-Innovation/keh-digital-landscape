import { FaArrowRight } from 'react-icons/fa';
import '../styles/CopilotPage.css';

export const getCellRenderers = onViewDataClick => ({
  avatar: ({ value }) =>
    value ? (
      <div className="custom-cell">
        <img className="avatar-image" src={value} alt="avatar" />
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
        <button
          className="view-data-button"
          onClick={() => onViewDataClick(data.slug)}
          aria-label={`View data for ${data.name}`}
        >
          View <FaArrowRight size={10}/>
        </button>
      </div>
    ) : null,
});
