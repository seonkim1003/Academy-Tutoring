import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useMe } from "../components/auth/useMe";
import { api } from "../lib/api";

export function Root() {
  const { pathname } = useLocation();
  const { data: me, isLoading } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const onLogout = async () => {
    await api.post("/auth/logout", {});
    qc.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Academy Tutoring
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {!isLoading && me ? (
              <>
                <Link
                  to="/dashboard"
                  className={clsx(
                    "font-medium transition-colors",
                    pathname.startsWith("/dashboard")
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  {me.user.picture && (
                    <img
                      src={me.user.picture}
                      alt=""
                      className="w-7 h-7 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="text-gray-700 hidden sm:inline">
                    {me.user.name.split(" ")[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={clsx(
                  "font-medium transition-colors",
                  pathname === "/login"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Academy Tutoring Program — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
