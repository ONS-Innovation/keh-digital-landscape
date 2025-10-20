# Banner Management Component

The BannerManage component provides an interface for administrators to create and manage notification banners that appear across different pages of the Digital Landscape application.

## Overview

Site-wide banners are useful for communicating important information to users, such as upcoming maintenance, new features, or important notices. The BannerManage component allows administrators to control these messages without requiring code changes.

## Features

- **Banner Creation**: Create new banner messages with configurable properties
- **Banner Visibility Control**: Toggle visibility of existing banners
- **Banner Deletion**: Remove outdated or unnecessary banners
- **Multi-page Targeting**: Specify which pages should display each banner
- **Banner Types**: Choose from different banner types (info, warning, error) with appropriate styling
- **Centralised Management**: View and manage all banners from a single interface

## Implementation

The BannerManage component is implemented with these key elements:

- **State Management**:

  - Banner properties (title, message, type)
  - Target pages selection
  - Existing banners list
  - Confirmation modals

- **Banner Properties**:

  - Title (optional heading for the banner)
  - Message (main content of the banner)
  - Type (info, warning, or error)
  - Target pages (where the banner will appear)
  - Visibility status (active or hidden)

- **API Integration**:

  - Fetches existing banners from backend API
  - Saves new banners to backend storage
  - Updates banner visibility status
  - Deletes banners from the system

## Usage

### Creating a Banner

1. Enter a banner title (used as the heading for the banner)
1. Compose the banner message (the main content to display)
1. Select a banner type:
   - Info (blue): For general announcements
   - Warning (yellow): For important notices
   - Error (red): For critical alerts
1. Choose target pages where the banner should appear
1. Click "Save Banner" to create the banner
1. Confirm the action in the confirmation modal

### Managing Existing Banners

The "Existing Banners" section displays all banners in the system and offers these management options:

- **View Details**: See banner title, message, type, target pages, and status
- **Toggle Visibility**: Show or hide a banner without deleting it
- **Delete**: Permanently remove a banner from the system

### Banner Display Logic

Banners are displayed on the selected pages based on these rules:

1. Only active banners (show = true) are displayed to users
1. Banners appear on all pages selected during creation
1. Banners appear at the top of the page in order of creation (newest first)
1. Banner styling is determined by the selected type

## Integration with Frontend

The banner management system integrates with the frontend application through these components:

1. **Banner Component**: Displays active banners on specified pages
1. **Admin API**: Handles banner CRUD operations
1. **Banner Utilities**: Provides functions for fetching and managing banners

This integration ensures that administrators can easily communicate with users across the application without requiring code changes or deployments.
