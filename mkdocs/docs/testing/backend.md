# Backend Testing

## Overview

The backend testing suite validates the API endpoints that serve data to the Digital Landscape application. These tests ensure that the backend correctly processes requests, applies filters, and returns properly structured data.

## Test Implementation

The backend tests are implemented in the `testing/backend/` directory using the pytest framework and the requests library to make HTTP calls to the API endpoints. The tests are organised into four main files:

- `test_main.py` - Tests for core API endpoints
- `test_admin.py` - Tests for admin API endpoints
- `test_review.py` - Tests for review API endpoints
- `test_copilot.py` - Tests for CoPilot API endpoints

### Base Configuration

All tests use a common base URL configuration:
```python
BASE_URL = "http://localhost:5001"
```

### Running Tests
```bash
# Navigate to the testing directory
cd testing

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
make setup
```

The testing framework provides several commands for running tests:

```bash
# Run all tests
make test

# Run only main API tests
make test-main

# Run only admin API tests
make test-admin

# Run only review API tests
make test-review

# Run only CoPilot API tests
make test-copilot
```

### Health Check Tests

The health check endpoint test verifies that the server is operational and returns basic health metrics:

::: testing.backend.test_main.test_health_check

### Project Data Tests

The CSV endpoint test verifies that project data is correctly retrieved and formatted:

::: testing.backend.test_main.test_csv_endpoint

### Tech Radar Data Tests

The Tech Radar JSON endpoint test verifies that the radar configuration data is correctly retrieved:

::: testing.backend.test_main.test_tech_radar_json_endpoint

### Repository Statistics Tests

#### Basic Statistics

Tests the default behavior with no filters:

::: testing.backend.test_main.test_json_endpoint_no_params

#### Date Filtering

Tests filtering repositories by a specific date:

::: testing.backend.test_main.test_json_endpoint_with_datetime

#### Archived Status Filtering

Tests filtering repositories by archived status:

::: testing.backend.test_main.test_json_endpoint_with_archived

#### Combined Filtering

Tests applying multiple filters simultaneously:

::: testing.backend.test_main.test_json_endpoint_combined_params

### Repository Project Tests

#### Error Handling

Tests the endpoint's response when required parameters are missing:

::: testing.backend.test_main.test_repository_project_json_no_params

#### Single Repository

Tests retrieving data for a single repository:

::: testing.backend.test_main.test_repository_project_json_with_repos

#### Multiple Repositories

Tests retrieving data for multiple repositories:

::: testing.backend.test_main.test_repository_project_json_multiple_repos

### Tech Radar Update Tests

These tests are located in `test_review.py` and verify the review API endpoints.

#### Missing Entries

Tests handling of missing entries data:

::: testing.backend.test_review.test_tech_radar_update_no_entries

#### Partial Updates

Tests processing of partial updates:

::: testing.backend.test_review.test_tech_radar_update_partial

#### Invalid Entries

Tests validation of invalid entries:

::: testing.backend.test_review.test_tech_radar_update_invalid_entries

#### Valid Structure

Tests updating the Tech Radar with valid data:

::: testing.backend.test_review.test_tech_radar_update_valid_structure

#### Invalid Structure

Tests the endpoint's handling of invalid data structures:

::: testing.backend.test_review.test_tech_radar_update_invalid_structure

#### Invalid References

Tests validation of references between entries and quadrants/rings:

::: testing.backend.test_review.test_tech_radar_update_invalid_references

### Admin API Tests

These tests are located in `test_admin.py` and verify the admin API endpoints.

#### Banner Retrieval

Tests retrieving banner messages:

::: testing.backend.test_admin.test_admin_banner_get

#### Banner Creation

Tests creating new banner messages:

::: testing.backend.test_admin.test_admin_banner_update

#### Banner Creation Validation

Tests validation of banner creation requests:

::: testing.backend.test_admin.test_admin_banner_update_invalid

#### Banner Visibility Toggle

Tests toggling banner visibility:

::: testing.backend.test_admin.test_admin_banner_toggle

#### Banner Visibility Toggle Validation

Tests validation of banner toggle requests:

::: testing.backend.test_admin.test_admin_banner_toggle_invalid

#### Banner Deletion

Tests deleting banner messages:

::: testing.backend.test_admin.test_admin_banner_delete

#### Banner Deletion Validation

Tests validation of banner deletion requests:

::: testing.backend.test_admin.test_admin_banner_delete_invalid

### CoPilot API Tests

These tests are located in `test_copilot.py` and verify the CoPilot API endpoints.

#### Live Organisation Data Retrieval
Tests retrieving live CoPilot organisation usage data:

::: testing.backend.test_copilot.test_org_live_get

#### Organisation Seat Data Retrieval
Tests retrieving CoPilot seat data:

::: testing.backend.test_copilot.test_seats_get

### Banner Endpoints

Tests the banner message endpoints for retrieving active and all banners:

::: testing.backend.test_main.test_banner_endpoints

The banner endpoint tests verify:
- Active banners are correctly filtered in the /api/banners endpoint
- All banners (active and inactive) are returned by /api/banners/all
- Missing messages.json is handled gracefully
- Response structure is consistent and valid
- Error cases are properly handled with appropriate status codes

## Admin API Tests

These tests are located in `test_admin.py` and verify the administration API endpoints that manage platform configuration, banners, and technology reference lists.

### Banner Management Tests

#### Banner Retrieval

Tests retrieving all banner messages from the admin endpoint:

::: testing.backend.test_admin.test_admin_banner_get

This test validates that:
- The endpoint correctly returns banner messages from the S3 bucket
- The response has a valid structure with a "messages" array
- The response can be successfully parsed by the admin UI

#### Banner Creation

Tests creating a new banner with complete and valid data:

::: testing.backend.test_admin.test_admin_banner_update

This test verifies:
- Creating a banner with title, message, type, and target pages
- The appropriate success response is returned
- The newly created banner can be retrieved in a subsequent GET request

#### Banner Creation Validation

Tests validation of banner creation requests with invalid data:

::: testing.backend.test_admin.test_admin_banner_update_invalid

This test checks error handling for:
- Missing required message field
- Empty target pages array
- Malformed banner structure in the request

#### Banner Visibility Toggle

Tests toggling the visibility status of an existing banner:

::: testing.backend.test_admin.test_admin_banner_toggle

This test ensures:
- A test banner can be created for toggling
- The visibility can be toggled from true to false
- The updated banner visibility is correctly stored
- The system returns appropriate success messages

#### Banner Visibility Toggle Validation

Tests validation of banner visibility toggle requests with invalid data:

::: testing.backend.test_admin.test_admin_banner_toggle_invalid

This test validates error handling for:
- Non-numeric index values
- Missing index parameter
- Out-of-range index values

#### Banner Deletion

Tests deleting an existing banner:

::: testing.backend.test_admin.test_admin_banner_delete

This test verifies:
- A test banner can be created for deletion
- The banner can be successfully deleted
- The deleted banner is no longer returned in subsequent GET requests

#### Banner Deletion Validation

Tests validation of banner deletion requests with invalid parameters:

::: testing.backend.test_admin.test_admin_banner_delete_invalid

This test checks error handling for:
- Non-numeric index values
- Missing index parameter
- Out-of-range index values

### Technology Management Tests

#### Array Data Retrieval

Tests retrieval of the technology reference lists:

::: testing.backend.test_admin.test_admin_get_array_data

This test verifies:
- The endpoint returns JSON data with technology references
- The response has a valid structure as a dictionary

#### Single Category Update

Tests updating a single category in the technology reference lists:

::: testing.backend.test_admin.test_admin_update_array_data_single_category

This test ensures:
- A single category can be updated without affecting others
- The response includes a specific success message for single category update
- The updated data can be retrieved in a subsequent GET request

#### Multiple Category Update

Tests updating all categories in the technology reference lists simultaneously:

::: testing.backend.test_admin.test_admin_update_array_data_all_categories

This test validates:
- The entire technology reference data structure can be replaced
- The response includes a specific success message for all categories update
- The updated data structure can be retrieved in a subsequent GET request

#### Array Data Update Validation

Tests validation of technology reference list updates with invalid data:

::: testing.backend.test_admin.test_admin_update_array_data_invalid

This test checks error handling for:
- Updating all categories with non-object data
- Single category update without specifying a category
- Single category update with missing items array
- Single category update with non-array items

#### Tech Radar Data Retrieval

Tests fetching the Tech Radar data for administrative purposes:

::: testing.backend.test_admin.test_admin_get_tech_radar

This test verifies that the admin endpoint correctly returns the radar configuration data.

#### Technology Normalisation

Tests normalising technology names across projects:

::: testing.backend.test_admin.test_admin_normalise_technology_positive

This test ensures:
- Technology names can be normalised from one form to another
- The response includes a count of updated projects
- The system handles normalisation of non-existent technologies gracefully

#### Technology Normalisation Validation

Tests validation of technology normalisation requests with invalid data:

::: testing.backend.test_admin.test_admin_normalise_technology_invalid

This test checks error handling for:
- Missing "from" parameter
- Missing "to" parameter
- Missing both parameters

## Error Handling Tests

### Invalid Endpoints

Tests the server's response to non-existent endpoints:

::: testing.backend.test_main.test_invalid_endpoint

### Invalid Parameters

Tests the server's handling of invalid parameter values:

::: testing.backend.test_main.test_json_endpoint_invalid_date

## Test Execution Flow

The backend tests follow this general execution flow:

1. **Setup**: Configure the test environment and parameters
2. **Request**: Make an HTTP request to the target endpoint
3. **Validation**: Assert that the response status code is as expected
4. **Data Verification**: Assert that the response data structure is correct
5. **Content Verification**: Assert that the response data contains the expected values

## Integration with Frontend Utilities

These backend tests validate the same endpoints that are used by the frontend utilities:

1. **Project Data Utility**: The `test_csv_endpoint()` test validates the endpoint used by `fetchCSVFromS3()`
2. **Repository Data Utility**: The repository project tests validate the endpoint used by `fetchRepositoryData()`
3. **Tech Radar Data Utility**: The `test_tech_radar_json_endpoint()` test validates the endpoint used by `fetchTechRadarJSONFromS3()`
4. **Admin Utilities**: The admin API tests validate the endpoints used by the admin interface for banner management and technology reference list management 