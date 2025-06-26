import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../../../styles/components/SimilarityModal.css';

const SimilarityModal = ({
  isOpen,
  onClose,
  tech,
  similarTechnologies,
  onSelectTechnology,
  thresholdPercentage = 80,
}) => {
  if (!isOpen) return null;

  const handleSelectTech = similarTech => {
    if (onSelectTechnology) {
      onSelectTechnology(tech, similarTech.name);
    }
  };

  // Helper function to highlight case differences
  const highlightCaseDifferences = (original, similar) => {
    // If lengths don't match or lowercase versions are different, return the regular string
    if (
      original.length !== similar.length ||
      original.toLowerCase() !== similar.toLowerCase()
    ) {
      return similar;
    }

    // Create an array of character spans with different styling for case differences
    return (
      <>
        {similar.split('').map((char, index) => {
          const isDifferentCase = char !== original[index];
          return (
            <span
              key={index}
              className={isDifferentCase ? 'similarity-modal-diff-case' : ''}
              title={isDifferentCase ? 'Case difference detected' : ''}
            >
              {char}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className="similarity-modal-container">
      <div className="similarity-modal-header">
        <h3 className="similarity-modal-title">
          Similar to: <span className="similarity-modal-tech">{tech}</span>
          <span className="similarity-modal-threshold">
            (threshold: {thresholdPercentage}%)
          </span>
        </h3>
        <button className="similarity-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <div className="similarity-modal-content">
        {similarTechnologies && similarTechnologies.length > 0 ? (
          <div className="similarity-modal-items">
            {similarTechnologies.map((similarTech, idx) => (
              <div key={idx} className="similarity-modal-item">
                <div className="similarity-modal-item-info">
                  <div className="similarity-modal-item-name">
                    {tech.length === similarTech.name.length &&
                    tech.toLowerCase() === similarTech.name.toLowerCase() ? (
                      <span className="similarity-modal-diff-case">
                        {similarTech.name}
                      </span>
                    ) : (
                      similarTech.name
                    )}
                    {similarTech.isCaseMatch &&
                      !(
                        tech.length === similarTech.name.length &&
                        tech.toLowerCase() === similarTech.name.toLowerCase()
                      ) && (
                        <span className="similarity-modal-case-badge">
                          Case Diff
                        </span>
                      )}
                  </div>
                  <div className="similarity-modal-item-details">
                    <span
                      className={`similarity-modal-source ${similarTech.source === 'Tech Radar' ? 'radar' : 'reflist'}`}
                    >
                      {similarTech.source}
                    </span>
                    <span className="similarity-modal-match">
                      {Math.round(similarTech.similarity * 100)}% match
                    </span>
                  </div>
                </div>
                <button
                  className="similarity-modal-use-btn"
                  onClick={() => handleSelectTech(similarTech)}
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="similarity-modal-empty">
            No similar technologies found
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarityModal;
