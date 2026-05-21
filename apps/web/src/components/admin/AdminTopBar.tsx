import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import { NotificationBell } from "../notifications/NotificationBell";

type AdminTopBarProps = {
  /** Sub-page title; omit on main dashboard for full nav layout */
  title?: string;
};

export function AdminTopBar({ title }: AdminTopBarProps) {
  const onLogout = () =>
    api.post("/admin/logout", {}).then(() => {
      window.location.href = "/admin/login";
    });

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {title ? (
            <>
              <Link
                to="/admin/dashboard"
                className="text-sm text-gray-500 hover:text-gray-900 shrink-0"
              >
                ← Dashboard
              </Link>
              <span className="font-semibold text-gray-900 truncate">{title}</span>
            </>
          ) : (
            <span className="font-semibold text-gray-900">Admin Dashboard</span>
          )}
        </div>

        <nav className="flex items-center gap-3 sm:gap-4 text-sm text-gray-600 shrink-0">
          {!title && (
            <>
              <Link to="/admin/requests" className="hover:text-gray-900 hidden sm:inline">
                Requests
              </Link>
              <Link to="/admin/tutors" className="hover:text-gray-900 hidden sm:inline">
                Tutors
              </Link>
              <Link to="/admin/matches" className="hover:text-gray-900 hidden sm:inline">
                Matches
              </Link>
            </>
          )}
          <NotificationBell variant="admin" />
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Log out
          </Button>
        </nav>
      </div>
    </div>
  );
}
