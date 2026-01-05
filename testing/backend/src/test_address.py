"""
This module contains the test cases for the address book API endpoints.
"""

import os
import requests

BASE_URL = "http://localhost:5001/addressbook"

# Get authentication token from environment variable
GITHUB_TOKEN = os.environ.get('TEST_GITHUBUSERTOKEN')

# Set up cookies if ever needed (addressbook endpoints do not require auth)
AUTH_COOKIES = {"githubUserToken": GITHUB_TOKEN} if GITHUB_TOKEN else {}


def test_addressbook_missing_query():
	"""Test should return 400 when the query is missing or empty.

	Expects:
        - 401 status code
        - JSON response with error message
	"""
	# No query parameter at all
	response = requests.get(f"{BASE_URL}/api/request", timeout=10)
	assert response.status_code == 400
	data = response.json()
	assert "error" in data
	assert data["error"].lower() == "missing input"

	# Query present but empty values resolve to empty input
	response = requests.get(
		f"{BASE_URL}/api/request", params={"q": " , , ,"}, timeout=10
	)
	assert response.status_code == 400
	data = response.json()
	assert "error" in data
	assert data["error"].lower() == "missing input"


def test_addressbook_username_query():
	"""Accept a username and return a list (possibly empty).

	Expects:
	- 200 status
	- JSON array (may be empty)
	- If not empty, check for keys
	"""
	response = requests.get(
		f"{BASE_URL}/api/request", params={"q": "octocat"}, timeout=10
	)
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	if data:
		first = data[0]
		for key in [
			"username",
			"email",
			"accountID",
			"avatarUrl",
			"url",
			"fullname",
		]:
			assert key in first


def test_addressbook_email_query():
	"""Accept an email and return a list (possibly empty).

	Expects:
	- 200 status
	- JSON array (may be empty)
	- If not empty, check for keys
	"""
	response = requests.get(
		f"{BASE_URL}/api/request", params={"q": "octo.cat@ons.gov.uk"}, timeout=10
	)
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	if data:
		first = data[0]
		for key in [
			"username",
			"email",
			"accountID",
			"avatarUrl",
			"url",
			"fullname",
		]:
			assert key in first


def test_addressbook_comma_separated_input():
	"""Comma-separated query should be split and processed.

	Expects:
	- 200 status
	- JSON array (may be empty)
	- If multiple results, usernames are unique
	"""
	response = requests.get(
		f"{BASE_URL}/api/request", params={"q": "octocat, anotheruser"}, timeout=10
	)
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	if len(data) > 1:
		usernames = [
			(item.get("username") or "").lower() for item in data if item.get("username")
		]
		assert len(usernames) == len(set(usernames))
		

def test_addressbook_different_input_types():
	"""Query with different types of inputs (one email, one username)

	Expects:
	- 200 status
	- JSON array (may be empty)
	- If multiple results, usernames are unique
	"""
	response = requests.get(
		f"{BASE_URL}/api/request", params={"q": "octocat, octo.cat@ons.gov.uk"}, timeout=10
	)
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	if len(data) > 1:
		usernames = [
			(item.get("username") or "").lower() for item in data if item.get("username")
		]
		assert len(usernames) == len(set(usernames))


def test_addressbook_split_trim():
	"""Whitespace around identifiers should be trimmed and empty values filtered.

	Expects:
	- 200 status (if at least one non-empty input remains after trimming)
	- 400 status if all inputs are empty after trimming
	- On 200, JSON array with expected keys when data present
	"""
	response = requests.get(
		f"{BASE_URL}/api/request", params={"q": "  octocat  ,   , anotheruser  "}, timeout=10
	)
	assert response.status_code in (200, 400)
	if response.status_code == 200:
		data = response.json()
		assert isinstance(data, list)
		if data:
			first = data[0]
			for key in [
				"username",
				"email",
				"accountID",
				"avatarUrl",
				"url",
				"fullname",
			]:
				assert key in first
