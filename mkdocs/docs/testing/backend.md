# Backend Testing

## Overview

The backend testing suite validates the API endpoints that serve data to the Digital Landscape application. These tests ensure that the backend correctly processes requests, applies filters, and returns properly structured data.

## Test Implementation

The backend tests are implemented in `testing/backend/test_main.py` using the pytest framework and the requests library to make HTTP calls to the API endpoints.

### Base Configuration

All tests use a common base URL configuration:

```python
BASE_URL = "http://localhost:5001"
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

#### Valid Structure

Tests updating the Tech Radar with valid data:

::: testing.backend.test_main.test_tech_radar_update_valid_structure

#### Invalid Structure

Tests the endpoint's handling of invalid data structures:

::: testing.backend.test_main.test_tech_radar_update_invalid_structure

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