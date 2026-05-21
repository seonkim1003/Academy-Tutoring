import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
export function AdminTutors() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["admin", "tutors"],
        queryFn: () => api.get("/admin/tutors").then((r) => (r.success ? r.data : [])),
    });
    const toggleMutation = useMutation({
        mutationFn: ({ id, active }) => api.patch(`/admin/tutors/${id}`, { active }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tutors"] }),
    });
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center gap-4", children: [_jsx(Link, { to: "/admin/dashboard", className: "text-sm text-gray-500 hover:text-gray-900", children: "\u2190 Dashboard" }), _jsx("span", { className: "font-semibold text-gray-900", children: "Tutors" })] }) }), _jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [isLoading && _jsx("p", { className: "text-gray-400 text-sm", children: "Loading\u2026" }), data?.length === 0 && (_jsx("p", { className: "text-gray-500 text-sm", children: "No tutors have signed up yet." })), _jsx("div", { className: "flex flex-col gap-3", children: data?.map((tutor) => (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-medium text-gray-900", children: tutor.name }), tutor.gradeLevel && (_jsxs("span", { className: "text-xs text-gray-400", children: ["Grade ", tutor.gradeLevel] })), _jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-medium ${tutor.active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"}`, children: tutor.active ? "Active" : "Inactive" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: tutor.email }), tutor.bio && (_jsx("p", { className: "text-sm text-gray-600 mt-1 line-clamp-2", children: tutor.bio }))] }), _jsx(Button, { size: "sm", variant: tutor.active ? "secondary" : "primary", loading: toggleMutation.isPending, onClick: () => toggleMutation.mutate({ id: tutor.id, active: !tutor.active }), children: tutor.active ? "Deactivate" : "Activate" })] }, tutor.id))) })] })] }));
}
