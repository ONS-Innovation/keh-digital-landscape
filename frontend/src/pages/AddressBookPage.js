import React, { useEffect, useState } from 'react';
import ShortUserCard from '../components/AddressBook/ShortUserCard';

const AddressBookPage = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await fetch('/addressbook/api/request?q=Cooper-Wright'); //,TotalDwarf03');
				if (!res.ok) {
					throw new Error(`Request failed: ${res.status}`);
				}
				const data = await res.json();
				setUsers(Array.isArray(data) ? data : []);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

	if (loading) return <div style={{ padding: '1rem' }}>Loading...</div>;
	if (error) return <div style={{ padding: '1rem' }}>Error: {error}</div>;

	return (
		<div style={{ padding: '1rem' }}>
			{users.length === 0 && <div>No results.</div>}
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
	);
};

export default AddressBookPage;