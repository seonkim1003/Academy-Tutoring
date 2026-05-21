import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function minutesToTime(m) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const ampm = h < 12 ? "AM" : "PM";
    return `${h > 12 ? h - 12 : h}:${min.toString().padStart(2, "0")} ${ampm}`;
}
const statusColor = {
    proposed: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-500",
    cancelled: "bg-gray-100 text-gray-500",
    completed: "bg-blue-100 text-blue-700",
};
export function AdminMatches() {
    const { data, isLoading } = useQuery({
        queryKey: ["admin", "matches"],
        queryFn: () => api.get("/admin/matches").then((r) => (r.success ? r.data : [])),
    });
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center gap-4", children: [_jsx(Link, { to: "/admin/dashboard", className: "text-sm text-gray-500 hover:text-gray-900", children: "\u2190 Dashboard" }), _jsx("span", { className: "font-semibold text-gray-900", children: "Matches" })] }) }), _jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [isLoading && _jsx("p", { className: "text-gray-400 text-sm", children: "Loading\u2026" }), data?.length === 0 && (_jsx("p", { className: "text-gray-500 text-sm", children: "No matches yet. Go to Requests to create one." })), _jsx("div", { className: "flex flex-col gap-3", children: data?.map((m) => (_jsx("div", { className: "bg-white rounded-xl border border-gray-200 p-4", children: _jsx("div", { className: "flex items-start justify-between gap-2", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-medium text-gray-900", children: m.tutorName }), _jsx("span", { className: "text-xs text-gray-400", children: m.tutorEmail }), _jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[m.status] ?? "bg-gray-100 text-gray-600"}`, children: m.status })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: ["Request #", m.requestId, m.proposedDayOfWeek != null && m.proposedStartMinute != null && (_jsxs(_Fragment, { children: [" \u2014 ", DAYS[m.proposedDayOfWeek], " ", minutesToTime(m.proposedStartMinute)] }))] }), _jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: ["Created ", new Date(m.createdAt * 1000).toLocaleDateString(), m.respondedAt && (_jsxs(_Fragment, { children: [" \u00B7 Responded ", new Date(m.respondedAt * 1000).toLocaleDateString()] }))] })] }) }) }, m.id))) })] })] }));
}
