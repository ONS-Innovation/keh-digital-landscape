# Layout Component

The Layout component serves as the main structural wrapper for the Digital Landscape application, providing a consistent layout across all pages.

## Features

- Consistent header across all pages
- Responsive sidebar that adapts to different viewport sizes
- Main content area that properly scales and positions content

## Implementation

The Layout component combines the Header and Sidebar components and wraps the main content in a structured layout.

```javascript
import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import '../../styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
```

## Props

| Prop       | Type            | Description                                    |
| ---------- | --------------- | ---------------------------------------------- |
| `children` | React.ReactNode | The content to render in the main content area |

## Usage

The Layout component should wrap all page components to ensure consistent structure:

```jsx
import Layout from '../components/Layout/Layout';
import HomePage from './HomePage';

function App() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}
```

## Responsive Behaviour

The Layout component works with its child components to provide a responsive experience:

- The Header maintains visibility and functionality across all viewport sizes
- The Sidebar can collapse to icons-only view when space is limited
- The main content area adjusts to fill available space

## Styling

The Layout uses dedicated CSS defined in `../../styles/Layout.css` that handles:

- Grid-based positioning of elements
- Proper spacing and alignment
- Overflow handling for scrollable content
