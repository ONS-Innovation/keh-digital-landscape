# Address Book Page

The Address Book page allows users to resolve employee information from GitHub usernames and ONS email addresses.

## Features

### Inputs

- Accepts GitHub usernames and ONS email addresses
- Case-insensitive matching; inputs are trimmed

### Returned Data

- ONS email address and GitHub username
- Full name
- GitHub profile URL
- GitHub profile picture

### Matching and Normalisation

- Converts emails ↔ usernames using S3-backed lookup dictionaries.
- Filters out incomplete records to ensure only fully populated results.

### Multiple User Searches

- Supports comma-separated inputs and mixed input types.
- Has no duplicate results when inputs refer to the same employee.

## Usage

### Searching

- Enter a GitHub username (e.g., `username`).
- Enter an ONS email address (e.g., `firstname.lastname@ons.gov.uk`).

### Multiple user searches

- Separate inputs with commas: `username1, username2`.
- Use mixed input types; if both inputs refer to the same employee, only one result is returned: `username1, email2`.

## Use Cases

### All Employees:

- Find projects and see who created or maintains them
- Discover colleagues’ GitHub profiles and related repositories
