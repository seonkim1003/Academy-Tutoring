import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";
function DashboardInner() {
    const { data } = useMe();
    if (!data)
        return null;
    const { roles, user } = data;
    const hasAny = roles.isTutor || roles.isTutee;
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-10", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: ["Hi, ", user.name.split(" ")[0]] }), _jsx("p", { className: "text-gray-600 mb-8", children: hasAny
                    ? "Here's what's on your plate."
                    : "Get started by choosing what brings you here." }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [roles.isTutor ? (_jsxs(Link, { to: "/dashboard/tutor", className: "block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Tutor dashboard" }), _jsx("p", { className: "text-sm text-gray-600", children: "Your subjects, availability, and matches." })] })) : (_jsxs(Link, { to: "/onboarding/tutor", className: "block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "+ Become a tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Share your subjects and availability to start tutoring." })] })), roles.isTutee ? (_jsxs(Link, { to: "/dashboard/tutee", className: "block rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Tutee dashboard" }), _jsx("p", { className: "text-sm text-gray-600", children: "Your requests, availability, and matches." })] })) : (_jsxs(Link, { to: "/onboarding/request", className: "block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "+ Request a tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Submit a request to be matched with a peer tutor." })] }))] })] }));
}
export function Dashboard() {
    return (_jsx(RequireUser, { children: _jsx(DashboardInner, {}) }));
}
