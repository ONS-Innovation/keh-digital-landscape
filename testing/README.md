# Backend Testing

This directory contains tests for the backend API endpoints. The tests are written in Python using pytest.

## Prerequisites

- Python 3.8 or higher
- Make (for using Makefile commands)
- Backend server running on localhost:5001

Make sure you are currently in the /testing directory when running the commands. To change directory, run:

```bash
cd testing
```

## Setup

1. Create a virtual environment (recommended but not required):
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
make setup
```

## Running Tests

Make sure the backend server is running on localhost:5001 before running tests.

### Running All Tests

To run all tests:
```bash
make test
```

### Running Specific Test Sets

The tests are organized into three main categories:

1. **Main API tests** - Core API endpoints like health check, CSV data, and repository statistics:
```bash
make test-main
```

2. **Admin API tests** - Admin banner management endpoints:
```bash
make test-admin
```

3. **Review API tests** - Tech radar update endpoints:
```bash
make test-review
```

3. **Copilot API tests** - Copilot endpoints:
```bash
make test-copilot
```

### Running a Specific Test

To run a specific test, use:

```bash
python3 -m pytest backend/test_main.py::test_name -v
```

For example:

```bash
python3 -m pytest backend/test_main.py::test_health_check -v
python3 -m pytest backend/test_admin.py::test_admin_banner_update -v
python3 -m pytest backend/test_review.py::test_tech_radar_update_valid_structure -v
```

Ensure tests are passing before committing.

## Linting and Cleaning

### Linting

To run linting checks on all test files:
```bash
make lint
```

### Cleaning Up

To clean Python cache files:
```bash
make clean
```

## Test Structure

The tests cover these main endpoint groups:

| Test File | Endpoint Group | Description |
|---|---|---|
| `test_main.py` | `/api/*` | Core API endpoints (health, CSV, JSON, repository) |
| `test_admin.py` | `/admin/api/*` | Admin API endpoints for banner management |
| `test_review.py` | `/review/api/*` | Review API endpoints for tech radar updates |
| `test_copilot.py` | `/api/*` | Copilot API endpoints |

## Making changes to the tests

To make changes to the tests, edit the appropriate test file in the `backend/` directory.

After making changes, run the specific test set or all tests to verify they still pass:
```bash
make test
```

Also run `make lint` to check for any linting errors, and `make clean` to clean up cache files before committing.