"""
This module contains the test cases for the copilot API endpoints.
"""

import os
import requests
import pytest

BASE_URL = "http://localhost:5001/copilot"

# Get authentication token from environment variable
GITHUB_TOKEN = os.environ.get('TEST_GITHUBUSERTOKEN')

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
    assert data == { 'response': 'No user token found' }

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

def test_teams_historic_get_no_auth():
    """Test the copilot teams historic get endpoint without authentication.

    Expects:
        - 401 status code
        - JSON response with error message
    """
    response = requests.get(f"{BASE_URL}/api/teams/historic", timeout=10)
    assert response.status_code == 401
    data = response.json()
    assert data == { 'response': 'No user token found' }

def test_teams_historic_get_invalid_token():
    """Test the copilot teams historic get endpoint with an invalid token.

    Expects:
        - 500 status code (GitHub API error)
        - JSON response with error message
    """
    invalid_cookies = {"githubUserToken": "invalid_token"}
    response = requests.get(
        f"{BASE_URL}/api/teams/historic",
        cookies=invalid_cookies,
        timeout=10
    )
    assert response.status_code == 500
    data = response.json()
    assert "error" in data

def test_teams_historic_get_with_auth():
    """Test the copilot teams historic get endpoint with authentication.
    
    This test requires TEST_GITHUBUSERTOKEN to be set.
    Note: This test will be marked as xfailed if the GitHub API returns a permission error,
    which is expected in some environments.

    Expects:
        - Either 200 status code with team live data
        - Or 500 status code with "Resource not accessible by integration" error
    """
    if not GITHUB_TOKEN:
        pytest.skip("TEST_GITHUBUSERTOKEN not set")

    response = requests.get(
        f"{BASE_URL}/api/teams/historic",
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

    # Verify the response structure - array of team objects
    assert isinstance(data, list)

    if data:
        first_team = data[0]
        # Each item should be a team object with team metadata and data array
        assert "team" in first_team and isinstance(first_team["team"], dict)
        assert "data" in first_team and isinstance(first_team["data"], list)
        
        # Verify team metadata structure
        team_info = first_team["team"]
        assert "slug" in team_info and isinstance(team_info["slug"], str)
        assert "name" in team_info and isinstance(team_info["name"], str)
        assert "url" in team_info and isinstance(team_info["url"], str)
        
        # Verify data array contains daily usage objects
        if first_team["data"]:
            first_day = first_team["data"][0]
            assert "date" in first_day and isinstance(first_day["date"], str)
            assert "copilot_ide_chat" in first_day and isinstance(first_day["copilot_ide_chat"], dict)
            assert "copilot_ide_code_completions" in first_day and isinstance(first_day["copilot_ide_code_completions"], dict)


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

    # Verify the response structure - object with isAdmin, teams, and userTeamSlugs
    assert isinstance(data, dict)
    assert "isAdmin" in data and isinstance(data["isAdmin"], bool)
    assert "teams" in data and isinstance(data["teams"], list)
    assert "userTeamSlugs" in data and isinstance(data["userTeamSlugs"], list)

    # Verify teams array structure
    if data["teams"]:
        first_team = data["teams"][0]
        assert "slug" in first_team and isinstance(first_team["slug"], str)
        assert "name" in first_team and isinstance(first_team["name"], str)
        assert "url" in first_team and isinstance(first_team["url"], str)
