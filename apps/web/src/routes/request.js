import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { tuteeRequestSchema, SUBJECTS, CLASS_LEVEL_LABELS, CLASS_LEVELS, GRADE_LEVELS, DAYS_OF_WEEK, } from "@academy/shared";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { AvailabilityPicker } from "../components/forms/AvailabilityPicker";
import { api } from "../lib/api";
// Group subjects by category for the dropdown
const subjectOptions = SUBJECTS.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.category})`,
}));
const classLevelOptions = CLASS_LEVELS.map((l) => ({
    value: l,
    label: CLASS_LEVEL_LABELS[l],
}));
const gradeLevelOptions = GRADE_LEVELS.map((g) => ({
    value: g,
    label: `Grade ${g}`,
}));
function formatMinutes(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const ampm = h < 12 ? "AM" : "PM";
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${dh}:${m.toString().padStart(2, "0")} ${ampm}`;
}
export function RequestForm() {
    const [submitted, setSubmitted] = useState(null);
    const { register, handleSubmit, setError, setValue, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(tuteeRequestSchema),
        defaultValues: { availability: [] },
    });
    const availability = watch("availability");
    const setAvailability = (val) => setValue("availability", val, { shouldValidate: true });
    const mutation = useMutation({
        mutationFn: (data) => api.post("/requests", data),
        onSuccess: (res, variables) => {
            if (res.success) {
                setSubmitted(variables);
            }
            else {
                setError("root", { message: res.error });
            }
        },
        onError: () => {
            setError("root", { message: "Something went wrong. Please try again." });
        },
    });
    const onSubmit = (data) => {
        mutation.mutate(data);
    };
    if (submitted) {
        const subjectLabel = SUBJECTS.find((s) => s.id === submitted.subjectId)?.name ??
            submitted.subjectId;
        const dayLabel = (d) => DAYS_OF_WEEK.find((x) => x.value === d)?.label ?? `Day ${d}`;
        return (_jsxs("div", { className: "max-w-lg mx-auto px-4 py-16", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-7 h-7 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Request submitted!" }), _jsxs("p", { className: "text-gray-600", children: ["We'll match you with a tutor and reach out to", " ", _jsx("span", { className: "font-medium text-gray-900", children: submitted.email }), " ", "once a match is confirmed."] })] }), _jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-5", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide", children: "Your submission" }), _jsxs("dl", { className: "text-sm space-y-2", children: [_jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("dt", { className: "text-gray-500", children: "Name" }), _jsx("dd", { className: "text-gray-900 text-right", children: submitted.name })] }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("dt", { className: "text-gray-500", children: "Email" }), _jsx("dd", { className: "text-gray-900 text-right break-all", children: submitted.email })] }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("dt", { className: "text-gray-500", children: "Grade" }), _jsxs("dd", { className: "text-gray-900 text-right", children: ["Grade ", submitted.gradeLevel] })] }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("dt", { className: "text-gray-500", children: "Subject" }), _jsx("dd", { className: "text-gray-900 text-right", children: subjectLabel })] }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("dt", { className: "text-gray-500", children: "Class level" }), _jsx("dd", { className: "text-gray-900 text-right", children: CLASS_LEVEL_LABELS[submitted.classLevel] })] }), submitted.currentGradePct != null && (_jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("dt", { className: "text-gray-500", children: "Current grade" }), _jsxs("dd", { className: "text-gray-900 text-right", children: [submitted.currentGradePct, "%"] })] })), _jsxs("div", { className: "pt-2", children: [_jsx("dt", { className: "text-gray-500 mb-1", children: "Needs" }), _jsx("dd", { className: "text-gray-900 whitespace-pre-wrap", children: submitted.needsDescription })] }), _jsxs("div", { className: "pt-2", children: [_jsx("dt", { className: "text-gray-500 mb-1", children: "Availability" }), _jsx("dd", { className: "text-gray-900", children: _jsx("ul", { className: "list-disc list-inside space-y-0.5", children: submitted.availability.map((a, i) => (_jsxs("li", { children: [dayLabel(a.dayOfWeek), " \u2014 ", formatMinutes(a.startMinute), " to", " ", formatMinutes(a.endMinute)] }, i))) }) })] })] })] }), _jsx("p", { className: "text-center text-sm text-gray-500 mt-6", children: "This usually takes a few days. You can close this page." })] }));
    }
    return (_jsxs("div", { className: "max-w-lg mx-auto px-4 py-12", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Request a Tutor" }), _jsx("p", { className: "text-gray-500 text-sm mb-8", children: "Fill this out and we'll match you with a peer tutor. No account needed." }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-5", children: [_jsx(Input, { label: "Your name", required: true, placeholder: "First and last name", error: errors.name?.message, ...register("name") }), _jsx(Input, { label: "School email", type: "email", required: true, placeholder: "you@yourschool.org", hint: "We'll contact you here when a match is found.", error: errors.email?.message, ...register("email") }), _jsx(Select, { label: "Your grade", required: true, placeholder: "Select your grade", options: gradeLevelOptions, error: errors.gradeLevel?.message, ...register("gradeLevel") }), _jsx(Select, { label: "Subject", required: true, placeholder: "Select a subject", options: subjectOptions, error: errors.subjectId?.message, ...register("subjectId") }), _jsx(Select, { label: "Class level", required: true, placeholder: "Select level", options: classLevelOptions, error: errors.classLevel?.message, ...register("classLevel") }), _jsx(Input, { label: "Current grade (%)", type: "number", min: 0, max: 100, step: 0.1, placeholder: "e.g. 74", hint: "Optional \u2014 helps us track improvement over time.", error: errors.currentGradePct?.message, ...register("currentGradePct", {
                            setValueAs: (v) => v === "" || v == null || Number.isNaN(v) ? undefined : Number(v),
                        }) }), _jsx(Textarea, { label: "What do you need help with?", required: true, placeholder: "e.g. I'm struggling with integration by parts and related rates problems...", hint: "Be specific \u2014 this helps us find the best match.", error: errors.needsDescription?.message, ...register("needsDescription") }), _jsx(AvailabilityPicker, { value: availability, onChange: setAvailability, error: errors.availability?.message }), errors.root && (_jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2", children: errors.root.message })), _jsx(Button, { type: "submit", size: "lg", loading: mutation.isPending, className: "mt-2", children: "Submit Request" })] })] }));
}
