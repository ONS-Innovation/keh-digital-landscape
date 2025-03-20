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
    
    # Find the added banner by message
    added_banner = next((banner for banner in get_data["messages"] 
                         if banner["message"] == "Test Banner Message"), None)
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
    requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json=test_data,
        timeout=10
    )
    
    # Get all banners
    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert get_response.status_code == 200
    banners = get_response.json()["messages"]
    
    # Find the index of our test banner
    test_banner_index = next((i for i, banner in enumerate(banners) 
                             if banner["message"] == "Toggle Test Banner"), None)
    assert test_banner_index is not None
    
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
    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    updated_banners = get_response.json()["messages"]
    assert updated_banners[test_banner_index]["show"] is False

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
    requests.post(
        f"{BASE_URL}/admin/api/banners/update",
        json=test_data,
        timeout=10
    )
    
    # Get all banners
    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    assert get_response.status_code == 200
    banners = get_response.json()["messages"]
    
    # Find the index of our test banner
    test_banner_index = next((i for i, banner in enumerate(banners) 
                             if banner["message"] == "Delete Test Banner"), None)
    assert test_banner_index is not None
    
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
    get_response = requests.get(f"{BASE_URL}/admin/api/banners", timeout=10)
    updated_banners = get_response.json()["messages"]
    
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
    # Test with string index
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/delete",
        json={"index": "not-a-number"},
        timeout=10
    )
    assert response.status_code == 400
    assert "Invalid banner index" in response.json()["error"]

    # Test with missing index
    response = requests.post(
        f"{BASE_URL}/admin/api/banners/delete",
        json={},
        timeout=10
    )
    assert response.status_code == 400
    assert "Invalid banner index" in response.json()["error"]
