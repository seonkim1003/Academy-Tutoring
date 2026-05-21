import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
function StatCard({ label, value, sub }) {
    return (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-5", children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: label }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: value }), sub && _jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: sub })] }));
}
export function AdminDashboard() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["admin", "overview"],
        queryFn: () => api.get("/admin/analytics/overview").then((r) => r.success ? r.data : Promise.reject(r.error)),
    });
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("p", { className: "text-gray-400 text-sm", children: "Loading\u2026" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-red-500 text-sm mb-2", children: "Session expired or not logged in." }), _jsx("a", { href: "/admin/login", className: "text-blue-600 text-sm underline", children: "Log in again" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center justify-between", children: [_jsx("span", { className: "font-semibold text-gray-900", children: "Admin Dashboard" }), _jsxs("nav", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsx(Link, { to: "/admin/requests", className: "hover:text-gray-900", children: "Requests" }), _jsx(Link, { to: "/admin/tutors", className: "hover:text-gray-900", children: "Tutors" }), _jsx(Link, { to: "/admin/matches", className: "hover:text-gray-900", children: "Matches" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => api.post("/admin/logout", {}).then(() => (window.location.href = "/admin/login")), children: "Log out" })] })] }) }), _jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-xl font-bold text-gray-900 mb-6", children: "Overview" }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10", children: [_jsx(StatCard, { label: "Pending requests", value: data?.pendingRequests ?? 0 }), _jsx(StatCard, { label: "Active tutors", value: data?.activeTutors ?? 0 }), _jsx(StatCard, { label: "Total matches", value: data?.totalMatches ?? 0 }), _jsx(StatCard, { label: "Accepted matches", value: data?.acceptedMatches ?? 0, sub: data?.totalMatches
                                    ? `${Math.round((data.acceptedMatches / data.totalMatches) * 100)}% acceptance`
                                    : undefined })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs(Link, { to: "/admin/requests", className: "block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition", children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-1", children: "Manage Requests" }), _jsx("p", { className: "text-sm text-gray-500", children: "View pending tutoring requests and create matches." })] }), _jsxs(Link, { to: "/admin/tutors", className: "block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition", children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-1", children: "Manage Tutors" }), _jsx("p", { className: "text-sm text-gray-500", children: "View all tutors, their subjects, and toggle their active status." })] }), _jsxs(Link, { to: "/admin/matches", className: "block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition", children: [_jsx("h2", { className: "font-semibold text-gray-900 mb-1", children: "Manage Matches" }), _jsx("p", { className: "text-sm text-gray-500", children: "Track all proposed and confirmed tutoring matches." })] })] })] })] }));
}
