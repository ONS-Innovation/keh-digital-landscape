# GitHub Copilot Usage Dashboard

The Copilot dashboard allows users to analyse GitHub Copilot usage statistics across the organisation and within individual teams.

## Features

### Organisation vs Team View

Switch between organisation-wide and team-specific usage data using the tabs at the top of the page.

### Historic Data

All Copilot usage data displayed is historic data sourced from S3:

- **Organisation View**: Displays aggregated historic trends with options to view by day, week, month, or year
- **Team View**: Displays daily usage data with customisable date range filtering

### Team Selection

When in "Team Usage" mode, authenticated users can select a team they belong to from a list. The dashboard then displays usage data for that team.

Teams that you are a member of are highlighted with a special border to help you quickly identify your own teams.

### Copilot Admin Access

Users who are members of teams listed in the `admin_teams.json` configuration file have Copilot admin privileges. These users can:

- View usage data for all configured teams in the organisation, not just their own teams
- Access team metrics regardless of team membership
- See a "Copilot Admin" badge indicating their elevated access level

### Date Range Filtering

Use the date input fields to filter data by selecting a custom start and end date. The date inputs are constrained to the available data range.

### Authentication

Users must authenticate with GitHub to view and select their teams. The dashboard displays a GitHub login button if the user is not authenticated or their session has expired.

## Usage

### Select Scope

- Choose between viewing data for the whole organisation or for a specific team. On dashboard load, organisation scope is selected by default.

### Authenticate

- If you select "Team Usage" scope and are not authenticated, you will be prompted to log in with GitHub to see your teams.

### Pick a Team:

- Select a team from the list to view its Copilot usage metrics.
- Teams you are a member of will be highlighted with a special border.

### View Data:

- **Organisation**: Change the "View Dates By" dropdown to aggregate historic data by day, week, month, or year.
- **Team**: Adjust the start and end date input fields to focus on specific periods.

## Use Cases

### Organisation Admins:

- Track Copilot adoption and engagement across all teams.

### Copilot Admins:

- Access usage data for all configured teams across the organisation.
- Monitor team performance and identify areas for improvement.
- Support team leads with data-driven insights.

### Team Leads:

- Monitor how their team is using Copilot and identify trends.
