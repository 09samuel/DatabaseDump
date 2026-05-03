import { useEffect, useState } from "react";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import { getInitialTheme, setThemePreference, type Theme } from "../../utils/theme";

function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    setThemePreference(nextTheme);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your preferences and appearance.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Appearance
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred theme.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleThemeChange("light")}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              theme === "light"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            } dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-200 dark:hover:bg-neutral-900`}
          >
            <span>Light</span>
            {theme === "light" && (
              <span className="text-xs font-semibold">Active</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange("dark")}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            } dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-200 dark:hover:bg-neutral-900`}
          >
            <span>Dark</span>
            {theme === "dark" && (
              <span className="text-xs font-semibold">Active</span>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
