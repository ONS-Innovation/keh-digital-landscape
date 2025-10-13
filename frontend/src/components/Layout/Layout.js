import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import '../../styles/Layout.css';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--background))',
            opacity: '1',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            textAlign: 'left',
            padding: '10px 16px',
            boxSizing: 'border-box',
            boxShadow:
              '0 3px 10px hsl(var(--foreground) / .05), 0 3px 3px hsl(var(--foreground) / .01)',
          },
        }}
      />{' '}
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
