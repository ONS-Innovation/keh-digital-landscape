import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Radar from './pages/RadarPage';
import Statistics from './pages/StatisticsPage';
import Home from './pages/HomePage';
import Projects from './pages/ProjectsPage';
import ReviewDashboard from './pages/ReviewPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout/Layout';
import AddressBookPage from './pages/AddressBookPage';
import CopilotDashboard from './pages/CopilotPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/addressbook" element={<AddressBookPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/review/dashboard"
          element={
            <ProtectedRoute
              requiredRoles={['reviewer']}
              pageName="Review Dashboard"
            >
              <ReviewDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              requiredRoles={['admin']}
              pageName="Admin Dashboard"
            >
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/copilot" element={<CopilotDashboard />} />
        <Route path="/copilot/org/:view" element={<CopilotDashboard />} />
        <Route path="/copilot/team/:teamSlug" element={<CopilotDashboard />} />
        <Route path="/copilot/:scope" element={<CopilotDashboard />} />
      </Routes>
    </Layout>
  );
};

export default App;
