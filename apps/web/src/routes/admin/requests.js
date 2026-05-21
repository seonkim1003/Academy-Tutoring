import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SUBJECTS, CLASS_LEVEL_LABELS } from "@academy/shared";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function minutesToTime(m) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const ampm = h < 12 ? "AM" : "PM";
    return `${h > 12 ? h - 12 : h}:${min.toString().padStart(2, "0")} ${ampm}`;
}
function subjectName(id) {
    return SUBJECTS.find((s) => s.id === id)?.name ?? id;
}
function RequestRow({ req }) {
    const [expanded, setExpanded] = useState(false);
    const [, setMatching] = useState(false);
    const qc = useQueryClient();
    const suggestionsQuery = useQuery({
        queryKey: ["admin", "suggestions", req.id],
        queryFn: () => api
            .get(`/admin/requests/${req.id}/suggestions`)
            .then((r) => (r.success ? r.data : [])),
        enabled: expanded,
    });
    const matchMutation = useMutation({
        mutationFn: (tutorId) => api.post("/admin/matches", { requestId: req.id, tutorId }),
        onSuccess: () => {
            setExpanded(false);
            setMatching(false);
            qc.invalidateQueries({ queryKey: ["admin", "requests"] });
            qc.invalidateQueries({ queryKey: ["admin", "overview"] });
        },
    });
    const statusColor = {
        pending: "bg-yellow-100 text-yellow-800",
        matched: "bg-green-100 text-green-800",
        expired: "bg-gray-100 text-gray-500",
        cancelled: "bg-red-100 text-red-700",
    };
    return (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: [_jsxs("div", { className: "p-4 flex items-start gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-medium text-gray-900", children: req.tuteeName }), _jsx("span", { className: "text-xs text-gray-400", children: req.tuteeEmail }), _jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[req.status] ?? "bg-gray-100 text-gray-600"}`, children: req.status })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-0.5", children: [_jsx("strong", { children: subjectName(req.subjectId) }), " \u2014", " ", CLASS_LEVEL_LABELS[req.classLevel] ?? req.classLevel, req.currentGradePct != null && (_jsxs("span", { className: "ml-2 text-gray-400", children: ["Current grade: ", req.currentGradePct, "%"] }))] }), _jsx("p", { className: "text-sm text-gray-500 mt-1 line-clamp-2", children: req.needsDescription })] }), req.status === "pending" && (_jsx(Button, { size: "sm", variant: "secondary", onClick: () => setExpanded((v) => !v), children: expanded ? "Close" : "Match" }))] }), expanded && (_jsxs("div", { className: "border-t border-gray-100 bg-gray-50 p-4", children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3", children: "Tutor Suggestions" }), suggestionsQuery.isLoading && (_jsx("p", { className: "text-sm text-gray-400", children: "Finding matches\u2026" })), suggestionsQuery.data?.length === 0 && (_jsxs("p", { className: "text-sm text-gray-500", children: ["No tutors currently available for this subject and level. Check the", " ", _jsx(Link, { to: "/admin/tutors", className: "text-blue-600 underline", children: "Tutors" }), " ", "page."] })), suggestionsQuery.data?.map((s) => (_jsxs("div", { className: "flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2 mb-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: s.tutorName }), _jsxs("p", { className: "text-xs text-gray-500", children: [s.overlappingSlots.length, " overlapping slot", s.overlappingSlots.length !== 1 ? "s" : "", " \u2014", " ", s.overlappingSlots
                                                .slice(0, 2)
                                                .map((sl) => `${DAYS[sl.dayOfWeek]} ${minutesToTime(sl.startMinute)}`)
                                                .join(", "), s.overlappingSlots.length > 2 && `, +${s.overlappingSlots.length - 2} more`] })] }), _jsx(Button, { size: "sm", loading: matchMutation.isPending, onClick: () => matchMutation.mutate(s.tutorId), children: "Match" })] }, s.tutorId)))] }))] }));
}
export function AdminRequests() {
    const [statusFilter, setStatusFilter] = useState("pending");
    const { data, isLoading } = useQuery({
        queryKey: ["admin", "requests", statusFilter],
        queryFn: () => api
            .get(`/admin/requests?status=${statusFilter}`)
            .then((r) => (r.success ? r.data : [])),
    });
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center gap-4", children: [_jsx(Link, { to: "/admin/dashboard", className: "text-sm text-gray-500 hover:text-gray-900", children: "\u2190 Dashboard" }), _jsx("span", { className: "font-semibold text-gray-900", children: "Requests" })] }) }), _jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [_jsx("div", { className: "flex items-center gap-2 mb-6", children: ["pending", "matched", "all"].map((s) => (_jsx("button", { onClick: () => setStatusFilter(s === "all" ? "" : s), className: `rounded-full px-3 py-1 text-xs font-medium transition ${(s === "all" ? statusFilter === "" : statusFilter === s)
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`, children: s.charAt(0).toUpperCase() + s.slice(1) }, s))) }), isLoading && _jsx("p", { className: "text-gray-400 text-sm", children: "Loading\u2026" }), data?.length === 0 && (_jsx("p", { className: "text-gray-500 text-sm", children: "No requests found." })), _jsx("div", { className: "flex flex-col gap-3", children: data?.map((req) => _jsx(RequestRow, { req: req }, req.id)) })] })] }));
}
