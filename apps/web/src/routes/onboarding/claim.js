import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";
function formatDate(unix) {
    return new Date(unix * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
function ClaimInner() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { data: me } = useMe();
    const [tutorChoice, setTutorChoice] = useState(null);
    const [tuteeChoice, setTuteeChoice] = useState(null);
    const { data, isLoading } = useQuery({
        queryKey: ["me", "claim-candidates"],
        queryFn: async () => {
            const r = await api.get("/me/claim-candidates");
            if (!r.success)
                throw new Error(r.error);
            return r.data;
        },
    });
    const mutation = useMutation({
        mutationFn: (body) => api.post("/me/claim", body),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["me"] });
            navigate("/dashboard", { replace: true });
        },
    });
    const startFresh = () => {
        // User wants to ignore the existing records and start a brand new profile.
        // We don't claim either candidate; the onboarding flow handles row reuse
        // (and overwrites the orphan with the fresh data) on submit.
        navigate("/onboarding/role");
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading\u2026" }) }));
    }
    // No candidates? Should not happen given pendingClaim flag, but guard anyway.
    if (!data?.tutor && !data?.tutee) {
        navigate("/onboarding/role", { replace: true });
        return null;
    }
    const tutorNeedsAnswer = !!data?.tutor;
    const tuteeNeedsAnswer = !!data?.tutee;
    const ready = (!tutorNeedsAnswer || tutorChoice !== null) &&
        (!tuteeNeedsAnswer || tuteeChoice !== null);
    const submit = () => {
        mutation.mutate({
            claimTutor: tutorChoice === "yes",
            claimTutee: tuteeChoice === "yes",
        });
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 px-4 py-12", children: _jsxs("div", { className: "max-w-xl mx-auto", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Is this you?" }), _jsxs("p", { className: "text-gray-600 mb-8", children: ["We found existing data under", " ", _jsx("strong", { className: "text-gray-900", children: me?.user.email }), ". Confirm which records belong to you."] }), _jsxs("div", { className: "flex flex-col gap-4", children: [data?.tutor && (_jsxs(Candidate, { title: "Tutor profile", choice: tutorChoice, onChoose: setTutorChoice, children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: data.tutor.name }), data.tutor.gradeLevel != null && (_jsxs("span", { className: "text-gray-500", children: [" \u2014 Grade ", data.tutor.gradeLevel] }))] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Submitted ", formatDate(data.tutor.createdAt)] }), data.tutor.subjects.length > 0 && (_jsxs("p", { className: "text-sm text-gray-700 mt-2", children: ["Subjects: ", data.tutor.subjects.join(", ")] })), data.tutor.bio && (_jsxs("p", { className: "text-sm text-gray-500 italic mt-1", children: ["\"", data.tutor.bio, "\""] }))] })), data?.tutee && (_jsxs(Candidate, { title: "Tutee profile", choice: tuteeChoice, onChoose: setTuteeChoice, children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: data.tutee.name }), data.tutee.gradeLevel != null && (_jsxs("span", { className: "text-gray-500", children: [" \u2014 Grade ", data.tutee.gradeLevel] }))] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Submitted ", formatDate(data.tutee.createdAt)] }), _jsxs("p", { className: "text-sm text-gray-700 mt-2", children: [data.tutee.requestCount, " open request", data.tutee.requestCount !== 1 ? "s" : ""] })] }))] }), _jsxs("div", { className: "mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3", children: [_jsx(Button, { variant: "secondary", onClick: startFresh, disabled: mutation.isPending, children: "Create new profile" }), _jsx(Button, { onClick: submit, loading: mutation.isPending, disabled: !ready, children: "Continue" })] }), _jsxs("p", { className: "mt-3 text-xs text-gray-500 text-center sm:text-left", children: ["None of these are you? Use ", _jsx("span", { className: "font-medium", children: "Create new profile" }), " to start fresh."] })] }) }));
}
function Candidate({ title, choice, onChoose, children, }) {
    return (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-5", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3", children: title }), _jsx("div", { className: "text-gray-800", children: children }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsx("button", { type: "button", onClick: () => onChoose("yes"), className: `flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${choice === "yes"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"}`, children: "Yes, that's me" }), _jsx("button", { type: "button", onClick: () => onChoose("no"), className: `flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${choice === "no"
                            ? "border-gray-700 bg-gray-100 text-gray-900"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"}`, children: "Not mine" })] })] }));
}
export function OnboardingClaim() {
    return (_jsx(RequireUser, { allowPendingClaim: true, children: _jsx(ClaimInner, {}) }));
}
