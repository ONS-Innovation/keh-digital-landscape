import React, { useState } from 'react';
import Header from '../components/Header/Header';
import PageBanner from '../components/PageBanner/PageBanner';
import ShortUserCard from '../components/AddressBook/ShortUserCard';
import '../styles/pages/AddressBookPage.css';

const AddressBookPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const q = query.trim();
    setHasSearched(true);
    if (!q) {
      setUsers([]);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/addressbook/api/request?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '1rem' }}>Loading...</div>;
  if (error) return <div style={{ padding: '1rem' }}>Error: {error}</div>;

  return (
    <div>
      <Header hideSearch={true} />

      <PageBanner
        title="Address Book"
        description="Search for colleague information using a GitHub username or ONS email address"
        tabs={[]}
      />

      <div>
        <form
          onSubmit={handleSubmit}
          className="addressbook-search"
          role="search"
        >
          <input
            className="addressbook-search__input"
            type="search"
            id="q"
            name="q"
            placeholder="Enter email or GitHub username"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Address book search"
            autoComplete="off"
          />
          <button
            className="addressbook-search__button"
            type="submit"
            disabled={loading}
            aria-label="Submit search"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        <div style={{ padding: '1rem' }}>
          {hasSearched && users.length === 0 && !loading && !error && (
            <div>No results.</div>
          )}
          {users.map((userInfo, index) => (
            <ShortUserCard
              key={index}
              username={userInfo.username}
              email={userInfo.email}
              githubUrl={userInfo.url}
              fullName={userInfo.fullname}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddressBookPage;
