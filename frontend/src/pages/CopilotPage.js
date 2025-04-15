import React from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";

function CopilotDashboard() {
  return (
    <ThemeProvider>
      <Header hideSearch={true}/>
    </ThemeProvider>
  );
}

export default CopilotDashboard;