"""
This module contains the test cases for the copilot API endpoints.
"""

import requests

BASE_URL = "http://localhost:5001/copilot"

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

def test_team_live_get():
    """Test the copilot team live get endpoint.

    This test verifies that the endpoint correctly retrieves the
    team live data.
    Endpoint:
        GET /api/team/live
    Expects:
        - 200 status code
        - JSON response with team live data
    """
    team_slug = "keh-dev"
    response = requests.get(f"{BASE_URL}/api/team/live", params={"teamSlug": team_slug}, timeout=10)
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

    Expects:
        - 500 status code
        - JSON response with error message
    """
    invalid_slug = "invalid-slug"
    response = requests.get(f"{BASE_URL}/api/team/live", params={"teamSlug": invalid_slug}, timeout=10)
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

def test_team_seats_get():
    """Test the copilot teams seats get endpoint.

    This test verifies that the endpoint correctly retrieves the
    seats data for a specific team.

    Endpoint:
        GET /copilot/api/team/seats

    Expects:
        - 200 status code
        - JSON response with organisation teams seats data
    """
    team_slug = "keh-dev"
    response = requests.get(f"{BASE_URL}/api/team/seats", params={"teamSlug": team_slug}, timeout=10)
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

    Expects:
        - 500 status code
        - JSON response with error message
    """
    invalid_slug = "invalid-slug"
    response = requests.get(f"{BASE_URL}/api/team/seats", params={"teamSlug": invalid_slug}, timeout=10)
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
