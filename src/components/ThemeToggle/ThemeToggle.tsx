import { useEffect, useState } from "react";
import { getInitialTheme, setThemePreference, type Theme } from "../../utils/theme";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  className?: string;
};

function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setThemePreference(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`h-10 w-10 inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${className}`}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}

    </button>
  );
}

export default ThemeToggle;
