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
2. Compose the banner message (the main content to display)
3. Select a banner type:
   - Info (blue): For general announcements
   - Warning (yellow): For important notices
   - Error (red): For critical alerts
4. Choose target pages where the banner should appear
5. Click "Save Banner" to create the banner
6. Confirm the action in the confirmation modal

### Managing Existing Banners

The "Existing Banners" section displays all banners in the system and offers these management options:

- **View Details**: See banner title, message, type, target pages, and status
- **Toggle Visibility**: Show or hide a banner without deleting it
- **Delete**: Permanently remove a banner from the system

### Banner Display Logic

Banners are displayed on the selected pages based on these rules:

1. Only active banners (show = true) are displayed to users
2. Banners appear on all pages selected during creation
3. Banners appear at the top of the page in order of creation (newest first)
4. Banner styling is determined by the selected type

## Integration with Frontend

The banner management system integrates with the frontend application through these components:

1. **Banner Component**: Displays active banners on specified pages
2. **Admin API**: Handles banner CRUD operations
3. **Banner Utilities**: Provides functions for fetching and managing banners

This integration ensures that administrators can easily communicate with users across the application without requiring code changes or deployments.
