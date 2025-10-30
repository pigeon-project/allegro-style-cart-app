import { createRootRoute, Outlet } from "@tanstack/react-router";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useDarkMode } from "../hooks/useDarkMode";

function RootComponent() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Dark mode toggle - accessible from anywhere */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggle}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-900 min-h-[44px] min-w-[44px]"
          aria-label="Toggle dark mode"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <IconMoon size={20} stroke={2} aria-hidden="true" />
          ) : (
            <IconSun size={20} stroke={2} aria-hidden="true" />
          )}
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
