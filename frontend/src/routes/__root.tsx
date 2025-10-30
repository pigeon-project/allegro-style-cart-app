import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useDarkMode } from "../hooks/useDarkMode";

function RootComponent() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Dark mode toggle - accessible from anywhere */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggle}
          className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-900"
          aria-label="Toggle dark mode"
        >
          {isDark ? "🌙" : "☀️"}
          <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
        </button>
      </div>

      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
