"""
This module contains the test cases for the review API endpoints.
"""

import random
import requests

BASE_URL = "http://localhost:5001"

def test_tech_radar_update_no_entries():
    """Test the tech radar update endpoint with missing entries.
    
    This test verifies that the endpoint correctly handles requests with
    missing entries data by returning an appropriate error response.

    Endpoint:
        POST /review/api/tech-radar/update

    Expects:
        - 400 status code
        - JSON response with error message
        - Error message indicating invalid or missing title
    """
    response = requests.post(f"{BASE_URL}/review/api/tech-radar/update", json={}, timeout=10)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"] == "Invalid or empty entries data"

def test_tech_radar_update_partial():
    """Test the tech radar update endpoint with a partial update.
    
    This test verifies that the endpoint correctly processes updates
    when provided with the complete tech radar structure.

    Endpoint:
        POST /review/api/tech-radar/update

    Test Data:
        - Complete tech radar structure
        - Valid entries with all required fields

    Expects:
        - 200 status code
        - Successful update of entries
        - Correct structure in stored data
    """
    random_number = random.randint(100,1000)
    test_data = {
        "entries": [
            {
                "id": "test-entry-partial-1",
                "title": "Test Entry Partial 1",
                "description": "Languages",
                "key": "test1",
                "url": "#",
                "quadrant": "1",
                "timeline": [
                    {
                        "moved": 0,
                        "ringId": "ignore",
                        "date": "2000-01-01",
                        "description": f"For testing purposes [CASE:{random_number}:1]"
                    }
                ],
                "links": []
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/review/api/tech-radar/update",
        json=test_data,
        timeout=10
    )
    assert response.status_code == 200
    
    # Verify the updates
    get_response = requests.get(f"{BASE_URL}/api/tech-radar/json", timeout=10)
    assert get_response.status_code == 200
    updated_data = get_response.json()
    
    # Verify our entry exists and is correct
    updated_entries = {entry["id"]: entry for entry in updated_data["entries"]}
    assert "test-entry-partial-1" in updated_entries
    assert updated_entries["test-entry-partial-1"]["timeline"][0]["ringId"] == "ignore"
    assert updated_entries["test-entry-partial-1"]["quadrant"] == "1"

def test_tech_radar_update_invalid_entries():
    """Test the tech radar update endpoint with invalid entries format.
    
    This test verifies that the endpoint correctly handles requests with
    invalid entries data format by returning an appropriate error response.

    Endpoint:
        POST /review/api/tech-radar/update

    Test Data:
        - Invalid entries format
        - Missing required fields
        - Malformed data structures

    Expects:
        - 400 status code
        - Error message for invalid data
        - No changes to existing entries
    """
    # Test with missing title
    response = requests.post(
        f"{BASE_URL}/review/api/tech-radar/update",
        json={"entries": "not_an_array"},
        timeout=10
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid or empty entries data"

def test_tech_radar_update_invalid_structure():
    """Test the tech radar update endpoint with invalid structure.
    
    This test verifies that the endpoint correctly validates the complete
    structure of the tech radar data, including title, quadrants, rings,
    and entries.

    Endpoint:
        POST /review/api/tech-radar/update

    Test Data:
        - Missing title
        - Invalid quadrants structure
        - Invalid rings structure
        - Invalid entries structure

    Expects:
        - 400 status code for each invalid case
        - Appropriate error messages
        - No changes to existing data
    """
    # Test missing title
    response = requests.post(
        f"{BASE_URL}/review/api/tech-radar/update",
        json={
            "quadrants": [],
            "rings": [],
            "entries": []
        },
        timeout=10
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid or empty entries data"

    # Test invalid quadrants
    response = requests.post(
        f"{BASE_URL}/review/api/tech-radar/update",
        json={
            "title": "Test Radar",
            "quadrants": [{"invalid": "structure"}],
            "rings": [],
            "entries": []
        },
        timeout=10
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid or empty entries data"

    # Test invalid rings
    response = requests.post(
        f"{BASE_URL}/review/api/tech-radar/update",
        json={
            "title": "Test Radar",
            "quadrants": [{"id": "1", "name": "Test"}],
            "rings": [{"invalid": "structure"}],
            "entries": []
        },
        timeout=10
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid or empty entries data"

def test_tech_radar_update_valid_structure():
    """Test the tech radar update endpoint with valid complete structure.
    
    This test verifies that the endpoint correctly processes a complete
    tech radar update with valid structure for all components.

    Endpoint:
        POST /review/api/tech-radar/update

    Test Data:
        - Valid title
        - Valid quadrants with required fields
        - Valid rings with required fields
        - Valid entries with required fields

    Expects:
        - 200 status code
        - Successful update confirmation
        - Correct structure in stored data
    """
    random_number = random.randint(100,1000)
    test_data = {
        "entries": [
            {
                "id": "test-entry-1",
                "title": "Test Entry 1",
                "description": "Languages",
                "key": "test1",
                "url": "#",
                "quadrant": "1",
                "timeline": [
                    {
                        "moved": 0,
                        "ringId": "ignore",
                        "date": "2000-01-01",
                        "description": f"For testing purposes [CASE:{random_number}:2]"
                    }
                ],
                "links": []
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/review/api/tech-radar/update",
        json=test_data,
        timeout=10
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Tech radar updated successfully"

    # Verify the update
    get_response = requests.get(f"{BASE_URL}/api/tech-radar/json", timeout=10)
    assert get_response.status_code == 200
    updated_data = get_response.json()

    # Verify entry structure
    entries = updated_data["entries"]
    test_entry = next((entry for entry in entries if entry["id"] == "test-entry-1"), None)
    assert test_entry is not None, "No entry with id 'test-entry-1' found"
    assert str(random_number) in test_entry["timeline"][0]["description"], "Entry with id 'test-entry-1' does not have the expected description"

def test_tech_radar_update_invalid_references():
    """Test the tech radar update endpoint with invalid references.
    
    This test verifies that the endpoint correctly validates references
    between entries and their quadrants/rings.

    Endpoint:
        POST /review/api/tech-radar/update

    Test Data:
        - Entry with invalid quadrant reference
        - Entry with invalid ring reference
        - Entry with missing required fields

    Expects:
        - 400 status code
        - Appropriate error messages
        - No changes to existing data
    """
    test_data = {
        "title": "ONS Tech Radar",
        "quadrants": [
            {"id": "1", "name": "Languages"}
        ],
        "rings": [
            {"id": "adopt", "name": "ADOPT", "color": "#008a00"}
        ],
        "entries": [
            {
                "id": "test-entry",
                "title": "Test Entry",
                "quadrant": "invalid",  # Invalid quadrant reference
                "timeline": [
                    {
                        "moved": 0,
                        "ringId": "invalid",  # Invalid ring reference
                        "date": "2024-03",
                        "description": "Test"
                    }
                ]
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/review/api/tech-radar/update",
        json=test_data,
        timeout=10
    )
    assert response.status_code == 400
    assert "Invalid entry structure" in response.json()["error"]
