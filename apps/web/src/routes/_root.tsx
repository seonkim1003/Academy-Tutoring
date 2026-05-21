import { Outlet, Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";

export function Root() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            Academy Tutoring
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/request"
              className={clsx(
                "font-medium transition-colors",
                pathname === "/request" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Request Tutoring
            </Link>
            <Link
              to="/tutor-signup"
              className={clsx(
                "font-medium transition-colors",
                pathname === "/tutor-signup" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Become a Tutor
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Academy Tutoring Program — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
