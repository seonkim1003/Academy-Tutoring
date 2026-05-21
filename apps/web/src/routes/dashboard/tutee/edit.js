import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import { RequestForm } from "../../../components/forms/RequestForm";
import { RequireUser } from "../../../components/auth/RequireUser";
import { useMe } from "../../../components/auth/useMe";
function TuteeEditInner() {
    const { id } = useParams();
    const requestId = Number(id);
    const { data: me } = useMe();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["me", "tutee"],
        queryFn: async () => {
            const r = await api.get("/me/tutee");
            if (!r.success)
                throw new Error(r.error);
            return r.data;
        },
    });
    const mutation = useMutation({
        mutationFn: (body) => api.patch(`/me/tutee/request/${requestId}`, body),
        onSuccess: async (res) => {
            if (!res.success)
                throw new Error(res.error);
            await qc.invalidateQueries({ queryKey: ["me", "tutee"] });
            navigate("/dashboard/tutee", { replace: true });
        },
    });
    if (isLoading || !data || !me) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading\u2026" }) }));
    }
    const item = data.requests.find((r) => r.request.id === requestId);
    if (!item) {
        return (_jsx("div", { className: "max-w-lg mx-auto px-4 py-12 text-center", children: _jsx("p", { className: "text-gray-700", children: "Request not found." }) }));
    }
    return (_jsxs("div", { className: "max-w-lg mx-auto px-4 py-12", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Edit request" }), _jsx("p", { className: "text-gray-500 text-sm mb-8", children: "Update the subject, schedule, or description." }), _jsx(RequestForm, { defaultValues: {
                    name: data.tutee.name,
                    email: data.tutee.email,
                    gradeLevel: (data.tutee.gradeLevel ?? undefined),
                    subjectId: item.request.subjectId,
                    classLevel: item.request.classLevel,
                    currentGradePct: item.request.currentGradePct ?? undefined,
                    needsDescription: item.request.needsDescription,
                    availability: item.availability,
                }, submitLabel: "Save changes", pending: mutation.isPending, error: mutation.isError
                    ? "Something went wrong. Please try again."
                    : mutation.data && !mutation.data.success
                        ? mutation.data.error
                        : undefined, onSubmit: (d) => mutation.mutate(d) })] }));
}
export function TuteeEdit() {
    return (_jsx(RequireUser, { children: _jsx(TuteeEditInner, {}) }));
}
