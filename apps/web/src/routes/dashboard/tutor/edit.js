import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { TutorProfileForm } from "../../../components/forms/TutorProfileForm";
import { RequireUser } from "../../../components/auth/RequireUser";
import { useMe } from "../../../components/auth/useMe";
function TutorEditInner() {
    const { data: me } = useMe();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["me", "tutor"],
        queryFn: async () => {
            const r = await api.get("/me/tutor");
            if (!r.success)
                throw new Error(r.error);
            return r.data;
        },
    });
    const mutation = useMutation({
        mutationFn: (body) => api.patch("/me/tutor", body),
        onSuccess: async (res) => {
            if (!res.success)
                throw new Error(res.error);
            await qc.invalidateQueries({ queryKey: ["me", "tutor"] });
            navigate("/dashboard/tutor", { replace: true });
        },
    });
    if (isLoading || !data || !me) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading\u2026" }) }));
    }
    return (_jsxs("div", { className: "max-w-lg mx-auto px-4 py-12", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Edit profile" }), _jsx("p", { className: "text-gray-500 text-sm mb-8", children: "Update your subjects, availability, or bio." }), _jsx(TutorProfileForm, { defaultValues: {
                    name: data.tutor.name,
                    email: data.tutor.email,
                    gradeLevel: (data.tutor.gradeLevel ?? undefined),
                    bio: data.tutor.bio ?? undefined,
                    phone: data.tutor.phone ?? undefined,
                    subjects: data.subjects,
                    availability: data.availability,
                }, submitLabel: "Save changes", pending: mutation.isPending, error: mutation.isError
                    ? "Something went wrong. Please try again."
                    : mutation.data && !mutation.data.success
                        ? mutation.data.error
                        : undefined, onSubmit: (d) => mutation.mutate(d) })] }));
}
export function TutorEdit() {
    return (_jsx(RequireUser, { children: _jsx(TutorEditInner, {}) }));
}
