import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import '../../styles/components/Changelog.css';

const processChangelogLine = (line) => {
  // Skip empty lines or lines that don't contain links
  if (!line || !line.includes('http')) {
    return line;
  }

  // Replace GitHub URLs with appropriate text and links
  return line.replace(
    /(https:\/\/[^\s]+)/g,
    (url) => {
      if (url.includes('/pull/')) {
        const pullNumber = url.match(/\/pull\/(\d+)/)[1];
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">Pull Request #${pullNumber}</a>`;
      } else if (url.includes('/compare/')) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">Changelog Link</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
  );
};

const Changelog = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReleases = async (pageNum) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/ONS-Innovation/keh-digital-landscape/releases?per_page=3&page=${pageNum}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      const data = await response.json();
      
      // If we got less than 3 releases, there are no more to load
      setHasMore(data.length === 3);
      
      if (pageNum === 1) {
        setReleases(data);
      } else {
        setReleases(prev => [...prev, ...data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReleases(1);
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setPage(prev => prev + 1);
    fetchReleases(page + 1);
  };

  if (loading && !loadingMore) {
    return <div className="changelog-loading">Loading changelog...</div>;
  }

  if (error) {
    return <div className="changelog-error">Error loading changelog: {error}</div>;
  }

  return (
    <div className="changelog-container">
      <h2>Recent Updates</h2>
      <div className="changelog-list">
        {releases.map((release) => (
          <div key={release.id} className="changelog-item">
            <div className="changelog-header">
              <h3>{release.name}</h3>
              <span className="changelog-date">
                {format(new Date(release.published_at), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="changelog-body">
              {release.body.split('\n').map((line, index) => {
                if (line.startsWith('*')) {
                  const processedLine = processChangelogLine(line.replace('*', '•'));
                  return (
                    <p 
                      key={index} 
                      className="changelog-entry"
                      dangerouslySetInnerHTML={{ __html: processedLine }}
                    />
                  );
                }
                return null;
              })}
            </div>
            <a
              href={release.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="changelog-link"
            >
              View on GitHub
            </a>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="changelog-load-more">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="changelog-load-more-button"
          >
            {loadingMore ? 'Loading...' : 'Load more updates'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Changelog;
