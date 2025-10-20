# Review Dashboard

The Review Dashboard provides administrative tools for managing the Tech Radar technologies, accessible to users with reviewer permissions through AWS Cognito authentication.

## Overview

The Review Dashboard allows authorised users with reviewer group membership to manage and update the organisation's technology catalogue. This interface offers a structured way to categorise technologies across different adoption phases and maintain an accurate picture of the technology landscape.

## Access Requirements

### Authentication

- Users must be authenticated through AWS Cognito
- Requires membership in the `reviewer` group
- Development mode bypasses authentication for local development

### User Attribution

When reviewers make changes to technologies, their email address is automatically captured and attributed as the author of the change for audit and tracking purposes.

## Features

### Technology Management

- Drag-and-drop interface for moving technologies between rings
- Add new technologies through a guided dialogue
- Edit technology details including name and category
- Filter technologies by category
- Search functionality for quick access
- View details using [InfoBox](../../components/infoBox.md)
- Automatic author attribution for all changes

### Project Visibility

- View projects using each technology
- Toggle project count display to see project count metrics
- Click project entries to explore detailed project information

## Usage

### Moving Technologies

1. Drag a technology from one ring to another
1. Enter a description explaining the reason for the change (supports simple markdown formatting)
1. Your email will be automatically recorded as the author of this change
1. Confirm the move to update the technology's status

### Adding Technologies

1. Click "Add Technology" button
1. Enter technology name and select appropriate category
1. Your email will be automatically recorded as the author
1. Confirm to add the technology to the Review ring

### Saving Changes

Changes made in the Review Dashboard are not applied until explicitly saved using the "Save Changes" button. This ensures a controlled update process and maintains data integrity.

### Project Count Visibility

Toggle the "Show Project Count" button to display the number of projects using each technology, helping identify widely-adopted versus rarely-used technologies.

## Security & Audit Trail

The Review Dashboard maintains a complete audit trail of all changes:

- **Author Attribution** - Every change is linked to the authenticated user's email
- **Change Descriptions** - Reviewers must provide reasons for technology moves
- **Timestamp Tracking** - All changes include when they were made
- **Role-based Access** - Only authorised reviewers can make changes

## Error Handling

The dashboard handles authentication errors gracefully:

- **401 Unauthorised** - Redirects to login if authentication expires
- **403 Forbidden** - Displays access denied message for insufficient permissions
- **Network Errors** - Provides user-friendly error messages for connectivity issues
