import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUBJECTS, CLASS_LEVEL_LABELS, DAYS_OF_WEEK, } from "@academy/shared";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import { RequireUser } from "../../../components/auth/RequireUser";
import { invalidateUserNotifications } from "../../../components/notifications/useNotifications";
function formatTime(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const ampm = h < 12 ? "AM" : "PM";
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${dh}:${m.toString().padStart(2, "0")} ${ampm}`;
}
function dayLabel(d) {
    return DAYS_OF_WEEK.find((x) => x.value === d)?.label ?? `Day ${d}`;
}
const STATUS_COLORS = {
    proposed: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-green-50 text-green-700 border-green-200",
    declined: "bg-gray-100 text-gray-600 border-gray-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
};
function TutorDashboardInner() {
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
            invalidateUserNotifications(qc);
        },
    });
    if (tutorQ.isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading\u2026" }) }));
    }
    if (tutorQ.isError) {
        return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-12 text-center", children: [_jsx("p", { className: "text-gray-700 mb-4", children: "You don't have a tutor profile yet." }), _jsx(Link, { to: "/onboarding/tutor", children: _jsx(Button, { children: "Become a tutor" }) })] }));
    }
    const data = tutorQ.data;
    const matches = matchesQ.data ?? [];
    // Group availability for display: by (start, end), list the days
    const availGroups = new Map();
    for (const a of data.availability) {
        const key = `${a.startMinute}-${a.endMinute}`;
        const g = availGroups.get(key);
        if (g)
            g.days.push(a.dayOfWeek);
        else
            availGroups.set(key, {
                startMinute: a.startMinute,
                endMinute: a.endMinute,
                days: [a.dayOfWeek],
            });
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-10", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Tutor dashboard" }), _jsx(Link, { to: "/dashboard/tutor/edit", children: _jsx(Button, { variant: "secondary", size: "sm", children: "Edit profile" }) })] }), _jsxs(Section, { title: "Profile", children: [_jsx("p", { className: "text-gray-900 font-medium", children: data.tutor.name }), _jsx("p", { className: "text-sm text-gray-500", children: data.tutor.email }), data.tutor.gradeLevel != null && (_jsxs("p", { className: "text-sm text-gray-500", children: ["Grade ", data.tutor.gradeLevel] })), data.tutor.bio && (_jsxs("p", { className: "text-sm text-gray-700 italic mt-2", children: ["\"", data.tutor.bio, "\""] })), !data.tutor.active && (_jsx("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-2 inline-block", children: "Your profile is currently inactive \u2014 an admin can reactivate it." }))] }), _jsx(Section, { title: "Subjects you tutor", children: data.subjects.length === 0 ? (_jsx("p", { className: "text-sm text-gray-400 italic", children: "No subjects yet." })) : (_jsx("ul", { className: "flex flex-wrap gap-2", children: data.subjects.map((s) => {
                        const name = SUBJECTS.find((x) => x.id === s.subjectId)?.name ?? s.subjectId;
                        return (_jsxs("li", { className: "rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 text-xs font-medium", children: [name, _jsxs("span", { className: "ml-1 text-blue-500", children: ["\u00B7 up to ", CLASS_LEVEL_LABELS[s.maxLevel]] })] }, s.subjectId));
                    }) })) }), _jsx(Section, { title: "Availability", children: availGroups.size === 0 ? (_jsx("p", { className: "text-sm text-gray-400 italic", children: "No availability set." })) : (_jsx("ul", { className: "flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200", children: [...availGroups.values()]
                        .sort((a, b) => a.startMinute - b.startMinute)
                        .map((g, i) => (_jsxs("li", { className: "px-3 py-2 text-sm text-gray-800 flex justify-between", children: [_jsx("span", { className: "font-medium", children: g.days
                                    .sort()
                                    .map((d) => dayLabel(d).slice(0, 3))
                                    .join(", ") }), _jsxs("span", { children: [formatTime(g.startMinute), " \u2013 ", formatTime(g.endMinute)] })] }, i))) })) }), _jsx(Section, { title: `Matches (${matches.length})`, children: matchesQ.isLoading ? (_jsx("p", { className: "text-sm text-gray-400", children: "Loading\u2026" })) : matches.length === 0 ? (_jsx("p", { className: "text-sm text-gray-400 italic", children: "No matches yet. An admin will match you with a tutee when one needs help in your subject." })) : (_jsx("ul", { className: "flex flex-col gap-3", children: matches.map((m) => (_jsxs("li", { className: "rounded-lg border border-gray-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900", children: [m.tuteeName ?? "Tutee", " \u2014 ", m.subjectName ?? "—"] }), m.classLevel && (_jsx("p", { className: "text-xs text-gray-500", children: CLASS_LEVEL_LABELS[m.classLevel] ??
                                                    m.classLevel }))] }), _jsx("span", { className: `text-xs font-medium border rounded-full px-2 py-0.5 ${STATUS_COLORS[m.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`, children: m.status })] }), m.proposedDayOfWeek != null &&
                                m.proposedStartMinute != null &&
                                m.proposedEndMinute != null && (_jsxs("p", { className: "text-sm text-gray-700", children: ["Proposed:", " ", _jsxs("span", { className: "font-medium", children: [dayLabel(m.proposedDayOfWeek), ",", " ", formatTime(m.proposedStartMinute), " \u2013", " ", formatTime(m.proposedEndMinute)] })] })), m.needsDescription && (_jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["\"", m.needsDescription, "\""] })), m.status === "proposed" && (_jsxs("div", { className: "flex gap-2 mt-3", children: [_jsx(Button, { size: "sm", loading: respond.isPending, onClick: () => respond.mutate({ id: m.id, action: "accept" }), children: "Accept" }), _jsx(Button, { size: "sm", variant: "secondary", loading: respond.isPending, onClick: () => respond.mutate({ id: m.id, action: "decline" }), children: "Decline" })] }))] }, m.id))) })) })] }));
}
function Section({ title, children, }) {
    return (_jsxs("section", { className: "mb-8", children: [_jsx("h2", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2", children: title }), _jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-5", children: children })] }));
}
export function TutorDashboard() {
    return (_jsx(RequireUser, { children: _jsx(TutorDashboardInner, {}) }));
}
