"""
This module contains the test cases for the copilot API endpoints.
"""

import os
import requests
import pytest

BASE_URL = "http://localhost:5001/copilot"

# Get authentication token from environment variable
GITHUB_TOKEN = os.environ.get('TEST_GITHUBUSERTOKEN')
TEST_TEAM = os.environ.get('TEST_GITHUBTEAM', 'keh-dev')

# Set up cookies for all requests that need authentication
AUTH_COOKIES = {"githubUserToken": GITHUB_TOKEN} if GITHUB_TOKEN else {}

def test_auth_status_no_token():
    """Test the auth status endpoint with no token.
    
    Expects:
        - 401 status code
        - JSON response with error message
    """
    response = requests.get(f"{BASE_URL}/api/auth/status", timeout=10)
    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert "Authentication required" in data["error"]

def test_auth_status_with_token():
    """Test the auth status endpoint with a token.
    
    This test requires TEST_GITHUBUSERTOKEN to be set.
    
    Expects:
        - 200 status code
        - JSON response with authenticated=true
    """
    if not GITHUB_TOKEN:
        pytest.skip("TEST_GITHUBUSERTOKEN not set")

    response = requests.get(f"{BASE_URL}/api/auth/status", cookies=AUTH_COOKIES, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data["authenticated"] is True
    assert data["hasToken"] is True

def test_org_live_get():
    """Test the copilot org live get endpoint.

    This test verifies that the endpoint correctly retrieves the
    organisation live data.

    Endpoint:
        GET /api/org/live

    Expects:
        - 200 status code
        - JSON response with organisation live data
    """
    response = requests.get(f"{BASE_URL}/api/org/live", timeout=10)
    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert isinstance(data, list)

    if data:
        first_item = data[0]
        assert "date" in first_item and isinstance(first_item["date"], str)
        assert "total_active_users" in first_item and isinstance(first_item["total_active_users"], int)
        assert "total_engaged_users" in first_item and isinstance(first_item["total_engaged_users"], int)
        assert "copilot_ide_chat" in first_item and isinstance(first_item["copilot_ide_chat"], dict)
        assert "copilot_ide_code_completions" in first_item and isinstance(first_item["copilot_ide_code_completions"], dict)

def test_team_live_get_no_auth():
    """Test the copilot team live get endpoint without authentication.

    Expects:
        - 401 status code
        - JSON response with error message
    """
    team_slug = TEST_TEAM
    response = requests.get(f"{BASE_URL}/api/team/live", params={"teamSlug": team_slug}, timeout=10)
    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert "Authentication required" in data["error"]

def test_team_live_get_invalid_token():
    """Test the copilot team live get endpoint with an invalid token.

    Expects:
        - 500 status code (GitHub API error)
        - JSON response with error message
    """
    team_slug = TEST_TEAM
    invalid_cookies = {"githubUserToken": "invalid_token"}
    response = requests.get(
        f"{BASE_URL}/api/team/live",
        params={"teamSlug": team_slug},
        cookies=invalid_cookies,
        timeout=10
    )
    assert response.status_code == 500
    data = response.json()
    assert "error" in data

def test_team_live_get_with_auth():
    """Test the copilot team live get endpoint with authentication.
    
    This test requires TEST_GITHUBUSERTOKEN to be set.
    Note: This test will be marked as xfailed if the GitHub API returns a permission error,
    which is expected in some environments.

    Expects:
        - Either 200 status code with team live data
        - Or 500 status code with "Resource not accessible by integration" error
    """
    if not GITHUB_TOKEN:
        pytest.skip("TEST_GITHUBUSERTOKEN not set")

    team_slug = TEST_TEAM
    response = requests.get(
        f"{BASE_URL}/api/team/live",
        params={"teamSlug": team_slug},
        cookies=AUTH_COOKIES,
        timeout=10
    )

    # Check if this is a permission error (expected in some environments)
    if response.status_code == 500:
        data = response.json()
        error_msg = data.get("error", "")
        if "Resource not accessible by integration" in error_msg:
            pytest.xfail("GitHub API permission error: Resource not accessible by integration")

    # If we get here, we should have a successful response
    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert isinstance(data, list)

    if data:
        first_item = data[0]
        assert "date" in first_item and isinstance(first_item["date"], str)
        assert "total_active_users" in first_item and isinstance(first_item["total_active_users"], int)
        assert "total_engaged_users" in first_item and isinstance(first_item["total_engaged_users"], int)
        assert "copilot_ide_chat" in first_item and isinstance(first_item["copilot_ide_chat"], dict)
        assert "copilot_ide_code_completions" in first_item and isinstance(first_item["copilot_ide_code_completions"], dict)

def test_team_live_get_invalid_slug():
    """Test the copilot team live get endpoint with an invalid team slug.
    
    This test requires TEST_GITHUBUSERTOKEN to be set.

    Expects:
        - 500 status code
        - JSON response with error message
    """
    if not GITHUB_TOKEN:
        pytest.skip("TEST_GITHUBUSERTOKEN not set")

    invalid_slug = "invalid-team-slug-123456"
    response = requests.get(
        f"{BASE_URL}/api/team/live",
        params={"teamSlug": invalid_slug},
        cookies=AUTH_COOKIES,
        timeout=10
    )
    assert response.status_code == 500
    data = response.json()
    assert "error" in data

def test_team_live_get_missing_slug():
    """Test the copilot team live get endpoint with a missing team slug.

    Expects:
        - 400 status code
        - JSON response with error message
    """
    response = requests.get(f"{BASE_URL}/api/team/live", timeout=10)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data

def test_org_historic_get():
    """Test the copilot org historic get endpoint.

    This test verifies that the endpoint correctly retrieves the
    organisation historic data.

    Endpoint:
        GET /api/org/historic

    Expects:
        - 200 status code
        - JSON response with organisation historic data
    """
    response = requests.get(f"{BASE_URL}/api/org/historic", timeout=10)
    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert isinstance(data, list)

    if data:
        first_item = data[0]
        assert "date" in first_item and isinstance(first_item["date"], str)
        assert "total_active_users" in first_item and isinstance(first_item["total_active_users"], int)
        assert "total_engaged_users" in first_item and isinstance(first_item["total_engaged_users"], int)
        assert "copilot_ide_chat" in first_item and isinstance(first_item["copilot_ide_chat"], dict)
        assert "copilot_ide_code_completions" in first_item and isinstance(first_item["copilot_ide_code_completions"], dict)

def test_seats_get():
    """Test the copilot seats get endpoint.

    This test verifies that the endpoint correctly retrieves the
    organisation seats data.

    Endpoint:
        GET /copilot/api/seats

    Expects:
        - 200 status code
        - JSON response with organisation seats data
    """
    response = requests.get(f"{BASE_URL}/api/seats", timeout=10)
    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert isinstance(data, list)

    if data:
        first_item = data[0]
        assert "created_at" in first_item and isinstance(first_item["created_at"], str)
        assert "assignee" in first_item and isinstance(first_item["assignee"], dict)
        assert "last_activity_at" in first_item and isinstance(first_item["last_activity_at"], str)

def test_team_seats_get_no_auth():
    """Test the copilot teams seats get endpoint without authentication.

    Expects:
        - 401 status code
        - JSON response with error message
    """
    team_slug = TEST_TEAM
    response = requests.get(f"{BASE_URL}/api/team/seats", params={"teamSlug": team_slug}, timeout=10)
    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert "Authentication required" in data["error"]

def test_team_seats_get_with_auth():
    """Test the copilot teams seats get endpoint with authentication.
    
    This test requires TEST_GITHUBUSERTOKEN to be set.

    Expects:
        - 200 status code
        - JSON response with team seats data
    """
    if not GITHUB_TOKEN:
        pytest.skip("TEST_GITHUBUSERTOKEN not set")

    team_slug = TEST_TEAM
    response = requests.get(
        f"{BASE_URL}/api/team/seats",
        params={"teamSlug": team_slug},
        cookies=AUTH_COOKIES,
        timeout=10
    )

    # Check for permission errors
    if response.status_code == 500:
        data = response.json()
        error_msg = data.get("error", "")
        if "Resource not accessible by integration" in error_msg:
            pytest.xfail("GitHub API permission error: Resource not accessible by integration")

    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert isinstance(data, list)

    if data:
        first_item = data[0]
        assert "created_at" in first_item and isinstance(first_item["created_at"], str)
        assert "assignee" in first_item and isinstance(first_item["assignee"], dict)
        assert "last_activity_at" in first_item and isinstance(first_item["last_activity_at"], str)

def test_team_seats_get_invalid_slug():
    """Test the copilot teams seats get endpoint with an invalid team slug.
    
    This test requires TEST_GITHUBUSERTOKEN to be set.

    Expects:
        - 500 status code
        - JSON response with error message
    """
    if not GITHUB_TOKEN:
        pytest.skip("TEST_GITHUBUSERTOKEN not set")

    invalid_slug = "invalid-team-slug-123456"
    response = requests.get(
        f"{BASE_URL}/api/team/seats",
        params={"teamSlug": invalid_slug},
        cookies=AUTH_COOKIES,
        timeout=10
    )
    assert response.status_code == 500
    data = response.json()
    assert "error" in data

def test_team_seats_get_missing_slug():
    """Test the copilot teams seats get endpoint with a missing team slug.

    Expects:
        - 400 status code
        - JSON response with error message
    """
    response = requests.get(f"{BASE_URL}/api/team/seats", timeout=10)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data

def test_teams_get_no_auth():
    """Test the teams get endpoint without authentication.

    Expects:
        - 401 status code
        - JSON response with error message
    """
    response = requests.get(f"{BASE_URL}/api/teams", timeout=10)
    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert "Missing GitHub user token" in data["error"]

def test_teams_get_with_auth():
    """Test the teams get endpoint with authentication.
    
    This test requires TEST_GITHUBUSERTOKEN to be set.

    Expects:
        - 200 status code
        - JSON response with teams data
    """
    if not GITHUB_TOKEN:
        pytest.skip("TEST_GITHUBUSERTOKEN not set")

    response = requests.get(f"{BASE_URL}/api/teams", cookies=AUTH_COOKIES, timeout=10)
    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert isinstance(data, list)

    if data:
        first_item = data[0]
        assert "slug" in first_item and isinstance(first_item["slug"], str)
        assert "name" in first_item and isinstance(first_item["name"], str)
        assert "url" in first_item and isinstance(first_item["url"], str)
