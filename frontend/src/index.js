import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/dataContext';
import { BugReportProvider } from './contexts/BugReportContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <DataProvider>
      <BugReportProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BugReportProvider>
    </DataProvider>
  </BrowserRouter>
);
