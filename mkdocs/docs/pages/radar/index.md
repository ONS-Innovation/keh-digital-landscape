# Tech Radar

The Tech Radar is an interactive visualisation tool that helps track and manage technology adoption across the organisation.

## Overview

The Tech Radar provides a visual representation of technologies categorised into four quadrants:

- **Languages**: such as Python, JavaScript, Java
- **Frameworks**: such as Flask, React, Spring
- **Supporting Tools**: such as CI/CD (e.g. Jenkins, GitHub Actions, Concourse) and other tools used for development, documentation and project management (e.g. VSCode, Confluence, Jira)
- **Infrastructure**: such as AWS, Azure, GCP

Each technology is placed in one of four rings:

- **Adopt**: technologies that are mature, widely adopted and recommended for use in production environments
- **Trial**: technologies that are gaining traction, have significant potential and warrant further investigation or experimentation
- **Assess**: technologies that are emerging, have some promise, but require further testing and refinement. These technologies have moved beyond the initial curiosity phase. They've shown some success in limited use cases and are ready for more structured testing
- **Hold**: technologies that are either outdated, have significant limitations or do not align with the organisation's strategic direction

## Features

### Interactive Visualisation

- Hover over blips to view information or click to lock selection
- Drag quadrant lists to customise your view
- Filter technologies by quadrant by clicking on the label around the radar
- Search functionality for quick access (CMD + K or CTRL + K)

### Technology Details

- Using the [Info Box](/components/infoBox) component, you can view:
  - Current adoption status
  - Timeline of changes
  - Related projects

### Navigation

- Keyboard shortcuts:
  - Press key `1` to move up the list
  - Press key `2` to move down the list
