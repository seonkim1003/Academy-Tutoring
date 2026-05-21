import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: [_jsxs("div", { className: "p-4 flex items-start gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-medium text-gray-900", children: req.tuteeName }), _jsx("span", { className: "text-xs text-gray-400", children: req.tuteeEmail }), _jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[req.status] ?? "bg-gray-100 text-gray-600"}`, children: req.status })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-0.5", children: [_jsx("strong", { children: subjectName(req.subjectId) }), " \u2014", " ", CLASS_LEVEL_LABELS[req.classLevel] ?? req.classLevel, req.currentGradePct != null && (_jsxs("span", { className: "ml-2 text-gray-400", children: ["Current grade: ", req.currentGradePct, "%"] }))] }), _jsx("p", { className: "text-sm text-gray-500 mt-1 line-clamp-2", children: req.needsDescription })] }), req.status === "pending" && (_jsx(Button, { size: "sm", variant: "secondary", onClick: () => setExpanded((v) => !v), children: expanded ? "Close" : "Match" }))] }), expanded && (_jsxs("div", { className: "border-t border-gray-100 bg-gray-50 p-4", children: [suggestionsQuery.isLoading && (_jsx("p", { className: "text-sm text-gray-400", children: "Finding tutors\u2026" })), suggestionsQuery.data && suggestionsQuery.data.length === 0 && (_jsxs("p", { className: "text-sm text-gray-500", children: ["No tutors currently qualified for this subject and level. Check the", " ", _jsx(Link, { to: "/admin/tutors", className: "text-blue-600 underline", children: "Tutors" }), " ", "page."] })), suggestionsQuery.data && suggestionsQuery.data.length > 0 && (() => {
                        const matchingTime = suggestionsQuery.data.filter((s) => s.overlappingSlots.length > 0);
                        const noTimeOverlap = suggestionsQuery.data.filter((s) => s.overlappingSlots.length === 0);
                        return (_jsxs(_Fragment, { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3", children: ["Tutors with matching times", _jsx("span", { className: "ml-2 text-gray-400 normal-case font-normal", children: matchingTime.length })] }), matchingTime.length === 0 && (_jsx("p", { className: "text-sm text-gray-500 mb-3", children: "No tutors are free at the tutee's available times." })), matchingTime.map((s) => (_jsx(SuggestionRow, { s: s, isMatching: matchMutation.isPending, onMatch: () => matchMutation.mutate(s.tutorId) }, s.tutorId))), noTimeOverlap.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-5", children: ["Other tutors for this subject", _jsxs("span", { className: "ml-2 text-gray-400 normal-case font-normal", children: [noTimeOverlap.length, " \u00B7 no time overlap"] })] }), _jsx("p", { className: "text-xs text-gray-500 mb-3", children: "These tutors teach this subject + level but their hours don't currently line up with the tutee. You can still match them and coordinate a time manually." }), noTimeOverlap.map((s) => (_jsx(SuggestionRow, { s: s, isMatching: matchMutation.isPending, onMatch: () => matchMutation.mutate(s.tutorId), noOverlap: true }, s.tutorId)))] }))] }));
                    })()] }))] }));
}
function SuggestionRow({ s, isMatching, onMatch, noOverlap = false, }) {
    const summary = noOverlap
        ? s.tutorSlots.length === 0
            ? "No availability on file"
            : `Free: ${s.tutorSlots
                .slice(0, 2)
                .map((sl) => `${DAYS[sl.dayOfWeek]} ${minutesToTime(sl.startMinute)}`)
                .join(", ")}${s.tutorSlots.length > 2 ? `, +${s.tutorSlots.length - 2} more` : ""}`
        : `${s.overlappingSlots.length} overlapping slot${s.overlappingSlots.length !== 1 ? "s" : ""} — ${s.overlappingSlots
            .slice(0, 2)
            .map((sl) => `${DAYS[sl.dayOfWeek]} ${minutesToTime(sl.startMinute)}`)
            .join(", ")}${s.overlappingSlots.length > 2 ? `, +${s.overlappingSlots.length - 2} more` : ""}`;
    return (_jsxs("div", { className: "flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2 mb-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900 flex items-center gap-2", children: [s.tutorName, noOverlap && (_jsx("span", { className: "rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5", children: "Time mismatch" }))] }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: summary })] }), _jsx(Button, { size: "sm", variant: noOverlap ? "secondary" : "primary", loading: isMatching, onClick: onMatch, children: "Match" })] }));
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
