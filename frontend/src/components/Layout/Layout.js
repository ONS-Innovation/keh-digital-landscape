import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import '../../styles/Layout.css';
import { ThemeProvider } from "../../contexts/ThemeContext";

const Layout = ({ children }) => {
  return (
      <ThemeProvider className="layout">
        <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Layout; 