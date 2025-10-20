# Sidebar Component

The Sidebar component provides navigation throughout the Digital Landscape application and adapts based on viewport size.

## Features

- Responsive design that collapses to an icon-only view on smaller screens or by user preference
- Persistent collapse state saved in localStorage
- Active route highlighting
- Theme toggle integration
- Help modal access

## Navigation Items

The sidebar includes links to:

- Home
- Tech Radar
- Statistics
- Projects
- Review
- Admin
- Copilot

## Implementation

The component maintains its collapse state in localStorage and toggles between expanded and collapsed views. When collapsed, only icons are displayed to maximise screen real estate while maintaining functionality.

```javascript
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/components/Sidebar.css';
import HelpModal from '../Header/HelpModal';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { MdOutlineRadar } from 'react-icons/md';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import {
  TbSmartHome,
  TbEditCircle,
  TbUserShield,
  TbUsers,
  TbChartBar,
  TbHelp,
} from 'react-icons/tb';
import { VscCopilot } from 'react-icons/vsc';

const Sidebar = () => {
  const location = useLocation();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true' ? true : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  // Navigation items definition and rendering
  // Help modal integration
  // Collapse/expand functionality
};
```

## Responsive Behaviour

The sidebar automatically:

- Stores user preference for collapsed/expanded state
- Adjusts ThemeToggle component size based on collapse state
- Provides a collapse/expand button for user control

## Help Integration

The sidebar includes a Help button in the footer that triggers the HelpModal component. This component displays contextual help based on the current route.
