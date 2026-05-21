import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12", children: _jsxs("div", { className: "max-w-2xl w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "What brings you here?" }), _jsx("p", { className: "text-gray-600", children: "Pick one to start. You can do both \u2014 add the other later from your dashboard." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs(Link, { to: "/onboarding/request", className: "block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "I want a tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Tell us what subject you need help with and your availability \u2014 we'll match you with a peer tutor." })] }), _jsxs(Link, { to: "/onboarding/tutor", className: "block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "I want to tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Share which subjects you can teach and when you're free." })] })] })] }) }));
}
export function OnboardingRole() {
    // Allow pending-claim users in too — they may have opted to skip the claim
    // screen and create a new profile from scratch.
    return (_jsx(RequireUser, { allowPendingClaim: true, children: _jsx(RoleInner, {}) }));
}
