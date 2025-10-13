import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/components/ThemeToggle.css';
import {
  IoMoonOutline as MoonIcon,
  IoSunnyOutline as SunIcon,
} from 'react-icons/io5';

/**
 * ThemeToggle component allows users to switch between light and dark theme.
 * It uses the useTheme hook from ThemeContext to get the current theme and toggleTheme function.
 *
 * @param {Object} props - The props passed to the ThemeToggle component
 * @param {string} props.variant - The variant of the toggle ('small' or 'large')
 * @returns A button that toggles the theme when clicked.
 */
function ThemeToggle({ variant = 'small' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle theme-toggle-${variant}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <SunIcon /> : <MoonIcon />}
      {variant === 'large' && (
        <span className="theme-toggle-label">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
