import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CLASS_LEVEL_LABELS } from "@academy/shared";
import { api } from "../../../lib/api";
import { formatTime, dayLabel, formatDate, REQUEST_STATUS_COLORS, statusChipClass, } from "../../../lib/format";
import { Button } from "../../../components/ui/Button";
import { RequireUser } from "../../../components/auth/RequireUser";
function TuteeDashboardInner() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["me", "tutee"],
        queryFn: async () => {
            const r = await api.get("/me/tutee");
            if (!r.success)
                throw new Error(r.error);
            return r.data;
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading\u2026" }) }));
    }
    if (isError || !data) {
        return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-12 text-center", children: [_jsx("p", { className: "text-gray-700 mb-4", children: "You haven't submitted any requests yet." }), _jsx(Link, { to: "/onboarding/request", children: _jsx(Button, { children: "Submit a request" }) })] }));
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-10", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Tutee dashboard" }), _jsxs("p", { className: "text-sm text-gray-500", children: [data.tutee.name, " \u2014 ", data.tutee.email] })] }), _jsx(Link, { to: "/dashboard/tutee/new", children: _jsx(Button, { children: "+ New request" }) })] }), data.requests.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center", children: [_jsx("p", { className: "text-gray-700 mb-3", children: "No requests yet." }), _jsx(Link, { to: "/dashboard/tutee/new", children: _jsx(Button, { children: "Submit your first request" }) })] })) : (_jsx("ul", { className: "flex flex-col gap-4", children: data.requests.map(({ request, subjectName, availability, matches }) => (_jsxs("li", { className: "rounded-xl border border-gray-200 bg-white p-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [_jsxs("div", { children: [_jsxs("h2", { className: "font-semibold text-gray-900", children: [subjectName, " ", _jsxs("span", { className: "text-sm font-normal text-gray-500", children: ["(", CLASS_LEVEL_LABELS[request.classLevel], ")"] })] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Submitted ", formatDate(request.createdAt), request.currentGradePct != null
                                                    ? ` · current grade ${request.currentGradePct}%`
                                                    : ""] })] }), _jsx("span", { className: `text-xs font-medium border rounded-full px-2 py-0.5 ${statusChipClass(request.status, REQUEST_STATUS_COLORS)}`, children: request.status })] }), _jsx("p", { className: "text-sm text-gray-700 whitespace-pre-wrap mb-3", children: request.needsDescription }), availability.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1", children: "Availability" }), _jsx("ul", { className: "text-sm text-gray-700 list-disc list-inside space-y-0.5", children: availability.map((a, i) => (_jsxs("li", { children: [dayLabel(a.dayOfWeek), " \u2014 ", formatTime(a.startMinute), " to", " ", formatTime(a.endMinute)] }, i))) })] })), matches.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1", children: "Matches" }), _jsx("ul", { className: "flex flex-col gap-2", children: matches.map((m) => (_jsxs("li", { className: "text-sm text-gray-700 rounded-md border border-gray-200 bg-gray-50 px-3 py-2", children: [_jsxs("div", { className: "flex justify-between gap-2", children: [_jsx("span", { className: "font-medium", children: m.tutorName ?? "Tutor" }), _jsx("span", { className: "text-xs text-gray-500", children: m.status })] }), m.proposedDayOfWeek != null &&
                                                m.proposedStartMinute != null &&
                                                m.proposedEndMinute != null && (_jsxs("p", { className: "text-xs text-gray-600 mt-0.5", children: ["Proposed: ", dayLabel(m.proposedDayOfWeek), ",", " ", formatTime(m.proposedStartMinute), " \u2013", " ", formatTime(m.proposedEndMinute)] }))] }, m.id))) })] })), _jsx("div", { className: "flex justify-end", children: _jsx(Link, { to: `/dashboard/tutee/request/${request.id}/edit`, children: _jsx(Button, { variant: "secondary", size: "sm", children: "Edit" }) }) })] }, request.id))) }))] }));
}
export function TuteeDashboard() {
    return (_jsx(RequireUser, { children: _jsx(TuteeDashboardInner, {}) }));
}
