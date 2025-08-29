"""
This module contains the test cases for the admin API endpoints.
"""

import requests

BASE_URL = "http://localhost:5001"


def test_admin_banner_get():
    """Test the admin banners endpoint for retrieving banner messages.

    This test verifies that the endpoint correctly returns banner messages
    from the S3 bucket. It checks the structure of the response and ensures
    the messages array is present.

    Endpoint:
        GET /admin/api/banners

    Expects:
        - 200 status code
        - JSON response containing a messages array
        - Valid structure that can be parsed by the admin UI
    """
    response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert "messages" in data
    assert isinstance(data["messages"], list)


def test_admin_banner_update():
    """Test the admin banners update endpoint.

    This test verifies that the endpoint correctly processes banner
    updates with valid data and saves them to the S3 bucket.

    Endpoint:
        POST /admin/api/banners/update

    Test Data:
        - Valid banner message
        - Array of pages where the banner should appear
        - Optional banner title and type

    Expects:
        - 200 status code
        - Success message confirming the banner was added
        - Banner should be retrievable in subsequent GET requests
    """
    test_data = {
        "banner": {
            "message": "Test Banner Message",
            "title": "Test Banner",
            "type": "info",
            "pages": ["radar", "statistics"],
            "show": True
        }
    }

    response = requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json=test_data,
        timeout=10
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Banner added successfully"

    # Verify the banner was added
    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert get_response.status_code == 200
    get_data = get_response.json()
    assert "messages" in get_data

    # Find the added banner by message - last message should be the one added
    
    if get_data["messages"]:
        added_banner = get_data["messages"][-1]
    else:
        assert False, "No banners found after adding"
    assert added_banner is not None
    assert added_banner["title"] == "Test Banner"
    assert added_banner["type"] == "info"
    assert "radar" in added_banner["pages"]
    assert "statistics" in added_banner["pages"]
    assert added_banner["show"] is True


def test_admin_banner_update_invalid():
    """Test the admin banners update endpoint with invalid data.

    This test verifies that the endpoint correctly validates banner data
    and returns appropriate error responses for invalid inputs.

    Endpoint:
        POST /admin/api/banners/update

    Test Data:
        - Missing message field
        - Empty pages array
        - Malformed banner object

    Expects:
        - 400 status code
        - Error message indicating invalid banner data
    """
    # Test with missing message
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json={"banner": {"pages": ["radar"]}},
        timeout=10
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid banner data"

    # Test with empty pages array
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json={"banner": {"message": "Test", "pages": []}},
        timeout=10
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid banner data"

    # Test with malformed request body
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json={"not_banner": {}},
        timeout=10
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid banner data"


def test_admin_banner_toggle():
    """Test the admin banners toggle endpoint.

    This test verifies that the endpoint correctly toggles banner visibility
    by updating the 'show' property in the S3 bucket.

    Endpoint:
        POST /admin/api/banners/toggle

    Test Data:
        - Valid index of an existing banner
        - New visibility state

    Expects:
        - 200 status code
        - Success message confirming the visibility update
        - Banner visibility should be updated in subsequent GET requests
    """
    # First, add a test banner
    test_data = {
        "banner": {
            "message": "Toggle Test Banner",
            "pages": ["radar"],
            "show": True
        }
    }

    # Add the banner
    add_response = requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json=test_data,
        timeout=10
    )
    assert add_response.status_code == 200


    # Get all banners
    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert get_response.status_code == 200
    banners = get_response.json()["messages"]

    # Find the index of our test banner
    test_banner_index = next((i for i, banner in enumerate(banners)
                             if banner["message"] == "Toggle Test Banner"), None)
    assert test_banner_index is not None, "Test banner not found after adding"

    # Toggle the banner visibility
    toggle_data = {
        "index": test_banner_index,
        "show": False
    }

    response = requests.post(
        f"{BASE_URL}/admin/api/banners/toggle",
        json=toggle_data,
        timeout=10
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Banner visibility updated successfully"

    # Verify the banner was toggled
    get_response_after_toggle = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert get_response_after_toggle.status_code == 200
    updated_banners = get_response_after_toggle.json()["messages"]
    assert updated_banners[test_banner_index]["show"] is False

    # Clean up: delete the test banner
    delete_data = {"index": test_banner_index}
    delete_response = requests.post(f"{BASE_URL}/admin/api/banners/delete", json=delete_data, timeout=10)
    assert delete_response.status_code == 200


def test_admin_banner_toggle_invalid():
    """Test the admin banners toggle endpoint with invalid data.

    This test verifies that the endpoint correctly validates toggle data
    and returns appropriate error responses for invalid inputs.

    Endpoint:
        POST /admin/api/banners/toggle

    Test Data:
        - Invalid index (non-numeric)
        - Out of range index
        - Missing index

    Expects:
        - 400 status code
        - Error message indicating invalid index
    """
    # Test with string index
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/toggle",
        json={"index": "not-a-number", "show": True},
        timeout=10
    )
    assert response.status_code == 400
    assert "Invalid banner index" in response.json()["error"]

    # Test with missing index
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/toggle",
        json={"show": True},
        timeout=10
    )
    assert response.status_code == 400
    assert "Invalid banner index" in response.json()["error"]

    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    num_banners = 0
    if get_response.status_code == 200:
        num_banners = len(get_response.json().get("messages", []))

    response = requests.post(
        f"{BASE_URL}/admin/api/banners/toggle",
        json={"index": num_banners + 100, "show": True}, # A sufficiently large index
        timeout=10
    )
    assert response.status_code == 400
    assert "Banner index out of range" in response.json()["error"]


def test_admin_banner_delete():
    """Test the admin banners delete endpoint.

    This test verifies that the endpoint correctly deletes banners
    from the S3 bucket based on their index.

    Endpoint:
        POST /admin/api/banners/delete

    Test Data:
        - Valid index of an existing banner

    Expects:
        - 200 status code
        - Success message confirming deletion
        - Banner should be removed in subsequent GET requests
    """
    # First, add a test banner to delete
    test_data = {
        "banner": {
            "message": "Delete Test Banner",
            "pages": ["radar"]
        }
    }

    # Add the banner
    add_response = requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json=test_data,
        timeout=10
    )
    assert add_response.status_code == 200


    # Get all banners
    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert get_response.status_code == 200
    banners = get_response.json()["messages"]

    # Find the index of our test banner
    test_banner_index = next((i for i, banner in enumerate(banners)
                             if banner["message"] == "Delete Test Banner"), None)
    assert test_banner_index is not None, "Test banner for deletion not found after adding"

    # Delete the banner
    delete_data = {
        "index": test_banner_index
    }

    response = requests.post(
        f"{BASE_URL}/admin/api/banners/delete",
        json=delete_data,
        timeout=10
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Banner deleted successfully"

    # Verify the banner was deleted
    get_response_after_delete = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert get_response_after_delete.status_code == 200
    updated_banners = get_response_after_delete.json()["messages"]

    # The banner should no longer exist
    deleted_banner = next((banner for banner in updated_banners
                          if banner["message"] == "Delete Test Banner"), None)
    assert deleted_banner is None


def test_admin_banner_delete_invalid():
    """Test the admin banners delete endpoint with invalid data.

    This test verifies that the endpoint correctly validates delete data
    and returns appropriate error responses for invalid inputs.

    Endpoint:
        POST /admin/api/banners/delete

    Test Data:
        - Invalid index (non-numeric)
        - Out of range index
        - Missing index

    Expects:
        - 400 status code
        - Error message indicating invalid index
    """
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/delete",
        json={"index": "not-a-number"},
        timeout=10
    )
    assert response.status_code == 400
    assert "Invalid banner index" in response.json()["error"]

    response = requests.post(
        f"{BASE_URL}/admin/api/banners/delete",
        json={},
        timeout=10
    )
    assert response.status_code == 400
    assert "Invalid banner index" in response.json()["error"]

    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    num_banners = 0
    if get_response.status_code == 200:
        num_banners = len(get_response.json().get("messages", []))

    response = requests.post(
        f"{BASE_URL}/admin/api/banners/delete",
        json={"index": num_banners + 100},
        timeout=10
    )
    assert response.status_code == 400
    assert "Banner index out of range" in response.json()["error"]

# Helper functions for array data tests
def _get_initial_array_data(base_url):
    """Fetches the current array_data.json from the server."""
    response = requests.get(f"{base_url}/admin/api/array-data", timeout=10)
    response.raise_for_status()
    return response.json()

def _restore_array_data(base_url, original_data):
    """Restores array_data.json to its original state."""
    payload = {
        "allCategories": True,
        "items": original_data
    }
    response = requests.post(f"{base_url}/admin/api/array-data/update", json=payload, timeout=10)
    response.raise_for_status()


def test_admin_get_array_data():
    """Test fetching array data.

    Endpoint: GET /admin/api/array-data
    Expects:
        - 200 status code
        - JSON response (dictionary)
    """
    response = requests.get(f"{BASE_URL}/admin/api/array-data", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)


def test_admin_update_array_data_single_category():
    """Test updating a single category in array data.

    Endpoint: POST /admin/api/array-data/update
    Expects:
        - 200 status code
        - Success message
        - Data correctly updated and other categories preserved
    """
    original_data = _get_initial_array_data(BASE_URL)

    try:
        category_to_update = "languages"
        new_items = ["item1", "item2_updated"]

        payload = {
            "allCategories": False,
            "category": category_to_update,
            "items": new_items
        }
        response = requests.post(f"{BASE_URL}/admin/api/array-data/update", json=payload, timeout=10)
        assert response.status_code == 200
        assert response.json()["message"] == f"Technology list for {category_to_update} updated successfully"

        updated_data = _get_initial_array_data(BASE_URL)
        assert updated_data[category_to_update] == new_items

        # Verify other categories are unchanged
        for key, value in original_data.items():
            if key != category_to_update:
                assert updated_data.get(key) == value
            elif category_to_update not in original_data: # if it was a new category
                pass # no need to check original value

    finally:
        _restore_array_data(BASE_URL, original_data)


def test_admin_update_array_data_all_categories():
    """Test updating all categories in array data.

    Endpoint: POST /admin/api/array-data/update
    Expects:
        - 200 status code
        - Success message
        - Data completely replaced with new data
    """
    original_data = _get_initial_array_data(BASE_URL)

    try:
        new_full_data = {
            "languages_updated": ["Go", "Rust"],
            "frameworks_updated": ["Svelte", "Vue"]
        }
        payload = {
            "allCategories": True,
            "items": new_full_data
        }
        response = requests.post(f"{BASE_URL}/admin/api/array-data/update", json=payload, timeout=10)
        assert response.status_code == 200
        assert response.json()["message"] == "All technology lists updated successfully"

        updated_data = _get_initial_array_data(BASE_URL)
        assert updated_data == new_full_data
    finally:
        _restore_array_data(BASE_URL, original_data)


def test_admin_update_array_data_invalid():
    """Test updating array data with invalid payloads.

    Endpoint: POST /admin/api/array-data/update
    Expects:
        - 400 status code
        - Specific error messages for different invalid inputs
    """
    # Test allCategories: true, but items is not an object
    payload1 = {"allCategories": True, "items": "not_an_object"}
    response1 = requests.post(f"{BASE_URL}/admin/api/array-data/update", json=payload1, timeout=10)
    assert response1.status_code == 400
    assert response1.json()["error"] == "Invalid data format. Complete items object is required for all categories update."

    # Test allCategories: false, but category is missing
    payload2 = {"allCategories": False, "items": ["item"]}
    response2 = requests.post(f"{BASE_URL}/admin/api/array-data/update", json=payload2, timeout=10)
    assert response2.status_code == 400
    assert response2.json()["error"] == "Invalid data format. Category and items array are required for single category update."

    # Test allCategories: false, but items is missing
    payload3 = {"allCategories": False, "category": "some_category"}
    response3 = requests.post(f"{BASE_URL}/admin/api/array-data/update", json=payload3, timeout=10)
    assert response3.status_code == 400
    assert response3.json()["error"] == "Invalid data format. Category and items array are required for single category update."

    # Test allCategories: false, but items is not an array
    payload4 = {"allCategories": False, "category": "some_category", "items": "not_an_array"}
    response4 = requests.post(f"{BASE_URL}/admin/api/array-data/update", json=payload4, timeout=10)
    assert response4.status_code == 400
    assert response4.json()["error"] == "Invalid data format. Category and items array are required for single category update."


def test_admin_get_tech_radar():
    """Test fetching tech radar data.

    Endpoint: GET /admin/api/tech-radar
    Expects:
        - 200 status code
        - JSON response (dictionary)
    """
    response = requests.get(f"{BASE_URL}/admin/api/tech-radar", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)


def test_admin_normalise_technology_positive():
    """Test normalising technology names.

    Endpoint: POST /admin/api/normalise-technology
    Expects:
        - 200 status code
        - Success message
        - updatedProjects count in response
    Note: This test assumes new_project_data.json exists and can be processed.
          It doesn't verify the actual content change in S3 due to test limitations,
          but checks the API response.
    """
    # The API should succeed even if 'from_tech' is not found (updatedProjects will be 0).
    payload = {"from": "NonExistentTech123", "to": "SomeNewTechABC"}
    response = requests.post(f"{BASE_URL}/admin/api/normalise-technology", json=payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Technology names normalised successfully"
    assert "updatedProjects" in data
    assert isinstance(data["updatedProjects"], int)


def test_admin_normalise_technology_invalid():
    """Test normalising technology names with invalid data.

    Endpoint: POST /admin/api/normalise-technology
    Expects:
        - 400 status code
        - Specific error message for missing 'from' or 'to'
    """
    # 'from' missing
    payload1 = {"to": "NewTech"}
    response1 = requests.post(f"{BASE_URL}/admin/api/normalise-technology", json=payload1, timeout=10)
    assert response1.status_code == 400
    assert response1.json()["error"] == "Both 'from' and 'to' values are required"

    # 'to' missing
    payload2 = {"from": "OldTech"}
    response2 = requests.post(f"{BASE_URL}/admin/api/normalise-technology", json=payload2, timeout=10)
    assert response2.status_code == 400
    assert response2.json()["error"] == "Both 'from' and 'to' values are required"

    # Both missing
    payload3 = {}
    response3 = requests.post(f"{BASE_URL}/admin/api/normalise-technology", json=payload3, timeout=10)
    assert response3.status_code == 400
    assert response3.json()["error"] == "Both 'from' and 'to' values are required"
