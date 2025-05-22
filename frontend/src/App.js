import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Radar from "./pages/RadarPage";
import Statistics from "./pages/StatisticsPage";
import Home from "./pages/HomePage";
import Projects from "./pages/ProjectsPage";
import ReviewDashboard from "./pages/ReviewPage";
import AdminPage from "./pages/AdminPage";
import Layout from "./components/Layout/Layout";
import CopilotDashboard from "./pages/CopilotPage";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/review/dashboard" element={<ReviewDashboard />} />
        <Route path="/admin/dashboard" element={<AdminPage />} />
        <Route path="/copilot" element={<CopilotDashboard />} />
    </Routes>
    </Layout>
  );
};

export default App;
