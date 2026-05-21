import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CLASS_LEVEL_LABELS } from "@academy/shared";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { formatTime, dayLabel, MATCH_STATUS_COLORS, REQUEST_STATUS_COLORS, statusChipClass, } from "../../lib/format";
import { invalidateUserNotifications } from "../../components/notifications/useNotifications";
function PanelSkeleton() {
    return (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-6 animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/3 mb-3" }), _jsx("div", { className: "h-3 bg-gray-100 rounded w-2/3" })] }));
}
function CountsRow({ items }) {
    return (_jsx("p", { className: "text-sm text-gray-600", children: items.map((item, i) => (_jsxs("span", { children: [i > 0 && _jsx("span", { className: "mx-2 text-gray-300", children: "\u00B7" }), item] }, item))) }));
}
function ViewFullLink({ to, label }) {
    return (_jsxs(Link, { to: to, className: "text-sm font-medium text-blue-600 hover:text-blue-800", children: [label, " \u2192"] }));
}
function TutorSummaryPanel() {
    const qc = useQueryClient();
    const tutorQ = useQuery({
        queryKey: ["me", "tutor"],
        queryFn: async () => {
            const r = await api.get("/me/tutor");
            if (!r.success)
                throw new Error(r.error);
            return r.data;
        },
    });
    const matchesQ = useQuery({
        queryKey: ["me", "matches"],
        queryFn: async () => {
            const r = await api.get("/me/matches");
            if (!r.success)
                throw new Error(r.error);
            return r.data;
        },
    });
    const respond = useMutation({
        mutationFn: ({ id, action }) => api.post(`/me/matches/${id}/${action}`, {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["me", "matches"] });
            qc.invalidateQueries({ queryKey: ["me", "tutee"] });
            invalidateUserNotifications(qc);
        },
    });
    if (tutorQ.isLoading || matchesQ.isLoading) {
        return _jsx(PanelSkeleton, {});
    }
    if (tutorQ.isError) {
        return (_jsxs(Link, { to: "/onboarding/tutor", className: "block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "+ Become a tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Share your subjects and availability to start tutoring." })] }));
    }
    const tutorData = tutorQ.data;
    const matches = matchesQ.data ?? [];
    const proposed = matches.find((m) => m.status === "proposed");
    const availSlotCount = new Set(tutorData.availability.map((a) => `${a.startMinute}-${a.endMinute}`)).size;
    return (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-6", children: [_jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tutor" }), _jsx(ViewFullLink, { to: "/dashboard/tutor", label: "View full dashboard" })] }), _jsx(CountsRow, { items: [
                    `${matches.length} ${matches.length === 1 ? "match" : "matches"}`,
                    `${tutorData.subjects.length} ${tutorData.subjects.length === 1 ? "subject" : "subjects"}`,
                    `${availSlotCount} availability ${availSlotCount === 1 ? "slot" : "slots"}`,
                ] }), !tutorData.tutor.active && (_jsx("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-3 inline-block", children: "Profile inactive \u2014 contact an admin to reactivate." })), proposed && (_jsxs("div", { className: "mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: ["New match: ", proposed.tuteeName ?? "Tutee", " \u2014", " ", proposed.subjectName ?? "—"] }), _jsx("span", { className: `text-xs font-medium border rounded-full px-2 py-0.5 shrink-0 ${statusChipClass(proposed.status, MATCH_STATUS_COLORS)}`, children: proposed.status })] }), proposed.proposedDayOfWeek != null &&
                        proposed.proposedStartMinute != null &&
                        proposed.proposedEndMinute != null && (_jsxs("p", { className: "text-sm text-gray-700 mb-3", children: [dayLabel(proposed.proposedDayOfWeek), ",", " ", formatTime(proposed.proposedStartMinute), " \u2013", " ", formatTime(proposed.proposedEndMinute)] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", loading: respond.isPending, onClick: () => respond.mutate({ id: proposed.id, action: "accept" }), children: "Accept" }), _jsx(Button, { size: "sm", variant: "secondary", loading: respond.isPending, onClick: () => respond.mutate({ id: proposed.id, action: "decline" }), children: "Decline" })] }), respond.isError && (_jsx("p", { className: "text-sm text-red-600 mt-2", children: respond.error instanceof Error
                            ? respond.error.message
                            : "Something went wrong. Try again." }))] }))] }));
}
function TuteeSummaryPanel() {
    const tuteeQ = useQuery({
        queryKey: ["me", "tutee"],
        queryFn: async () => {
            const r = await api.get("/me/tutee");
            if (!r.success)
                throw new Error(r.error);
            return r.data;
        },
    });
    if (tuteeQ.isLoading) {
        return _jsx(PanelSkeleton, {});
    }
    if (tuteeQ.isError || !tuteeQ.data) {
        return (_jsxs(Link, { to: "/onboarding/request", className: "block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "+ Request a tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Submit a request to be matched with a peer tutor." })] }));
    }
    const data = tuteeQ.data;
    const requests = data.requests;
    const openRequests = requests.filter((r) => r.request.status === "pending" || r.request.status === "matched");
    const activeMatches = requests.flatMap((r) => r.matches).length;
    const latestRequest = [...requests].sort((a, b) => b.request.createdAt - a.request.createdAt)[0];
    const latestMatch = latestRequest?.matches[0];
    return (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-6", children: [_jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tutee" }), _jsx(ViewFullLink, { to: "/dashboard/tutee", label: "View full dashboard" })] }), _jsx(CountsRow, { items: [
                    `${openRequests.length} open ${openRequests.length === 1 ? "request" : "requests"}`,
                    `${activeMatches} active ${activeMatches === 1 ? "match" : "matches"}`,
                ] }), latestRequest && (_jsxs("div", { className: "mt-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-1", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: [latestRequest.subjectName, " ", _jsxs("span", { className: "font-normal text-gray-500", children: ["(", CLASS_LEVEL_LABELS[latestRequest.request.classLevel], ")"] })] }), _jsx("span", { className: `text-xs font-medium border rounded-full px-2 py-0.5 shrink-0 ${statusChipClass(latestRequest.request.status, REQUEST_STATUS_COLORS)}`, children: latestRequest.request.status })] }), latestMatch ? (_jsxs("p", { className: "text-sm text-gray-700", children: [latestMatch.tutorName ?? "Tutor", " \u2014 match", " ", _jsx("span", { className: "font-medium", children: latestMatch.status })] })) : (_jsx("p", { className: "text-sm text-gray-500", children: "Waiting for a tutor match." }))] })), requests.length === 0 && (_jsxs("p", { className: "text-sm text-gray-500 mt-3", children: ["No requests yet.", " ", _jsx(Link, { to: "/dashboard/tutee/new", className: "text-blue-600 hover:text-blue-800 font-medium", children: "Submit one" })] }))] }));
}
function DashboardInner() {
    const { data } = useMe();
    if (!data)
        return null;
    const { roles, user } = data;
    const hasAny = roles.isTutor || roles.isTutee;
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-10", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: ["Hi, ", user.name.split(" ")[0]] }), _jsx("p", { className: "text-gray-600 mb-8", children: hasAny
                    ? "Here's what's on your plate."
                    : "Get started by choosing what brings you here." }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [roles.isTutor ? (_jsx(TutorSummaryPanel, {})) : (_jsxs(Link, { to: "/onboarding/tutor", className: "block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "+ Become a tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Share your subjects and availability to start tutoring." })] })), roles.isTutee ? (_jsx(TuteeSummaryPanel, {})) : (_jsxs(Link, { to: "/onboarding/request", className: "block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "+ Request a tutor" }), _jsx("p", { className: "text-sm text-gray-600", children: "Submit a request to be matched with a peer tutor." })] }))] })] }));
}
export function Dashboard() {
    return (_jsx(RequireUser, { children: _jsx(DashboardInner, {}) }));
}
