import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../Sidebar/Sidebar';
import '../../styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <ThemeProvider className="layout">
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
