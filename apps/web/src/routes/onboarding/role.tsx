import { Link, useNavigate } from "react-router-dom";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";

function RoleInner() {
  const { data } = useMe();
  const navigate = useNavigate();

  // If they already have a role, bounce them home.
  if (data && (data.roles.isTutor || data.roles.isTutee)) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            What brings you here?
          </h1>
          <p className="text-gray-600">
            Pick one to start. You can do both — add the other later from your
            dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/onboarding/request"
            className="block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              I want a tutor
            </h2>
            <p className="text-sm text-gray-600">
              Tell us what subject you need help with and your availability —
              we'll match you with a peer tutor.
            </p>
          </Link>

          <Link
            to="/onboarding/tutor"
            className="block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              I want to tutor
            </h2>
            <p className="text-sm text-gray-600">
              Share which subjects you can teach and when you're free.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function OnboardingRole() {
  return (
    <RequireUser>
      <RoleInner />
    </RequireUser>
  );
}
