import { Link } from "react-router-dom";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";

function DashboardInner() {
  const { data } = useMe();
  if (!data) return null;
  const { roles, user } = data;
  const hasAny = roles.isTutor || roles.isTutee;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Hi, {user.name.split(" ")[0]}
      </h1>
      <p className="text-gray-600 mb-8">
        {hasAny
          ? "Here's what's on your plate."
          : "Get started by choosing what brings you here."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.isTutor ? (
          <Link
            to="/dashboard/tutor"
            className="block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Tutor dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Your subjects, availability, and matches.
            </p>
          </Link>
        ) : (
          <Link
            to="/onboarding/tutor"
            className="block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              + Become a tutor
            </h2>
            <p className="text-sm text-gray-600">
              Share your subjects and availability to start tutoring.
            </p>
          </Link>
        )}

        {roles.isTutee ? (
          <Link
            to="/dashboard/tutee"
            className="block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Tutee dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Your requests, availability, and matches.
            </p>
          </Link>
        ) : (
          <Link
            to="/onboarding/request"
            className="block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              + Request a tutor
            </h2>
            <p className="text-sm text-gray-600">
              Submit a request to be matched with a peer tutor.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <RequireUser>
      <DashboardInner />
    </RequireUser>
  );
}
