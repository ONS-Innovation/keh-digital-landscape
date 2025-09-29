import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import '../../styles/Layout.css';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Toaster position="bottom-right" />
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
