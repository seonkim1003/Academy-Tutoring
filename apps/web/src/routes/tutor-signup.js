import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { tutorSignupSchema, SUBJECTS, CLASS_LEVEL_LABELS, CLASS_LEVELS, GRADE_LEVELS, } from "@academy/shared";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { AvailabilityPicker } from "../components/forms/AvailabilityPicker";
import { api } from "../lib/api";
const gradeLevelOptions = GRADE_LEVELS.map((g) => ({
    value: g,
    label: `Grade ${g}`,
}));
const subjectsByCategory = SUBJECTS.reduce((acc, s) => {
    if (!acc[s.category])
        acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
}, {});
export function TutorSignup() {
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, setError, setValue, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(tutorSignupSchema),
        defaultValues: { subjects: [], availability: [] },
    });
    const availability = watch("availability");
    const selectedSubjects = watch("subjects");
    const setAvailability = (val) => setValue("availability", val, { shouldValidate: true });
    const setSelectedSubjects = (val) => setValue("subjects", val, { shouldValidate: true });
    const mutation = useMutation({
        mutationFn: (data) => api.post("/tutors", data),
        onSuccess: (res) => {
            if (res.success)
                setSubmitted(true);
            else
                setError("root", { message: res.error });
        },
        onError: () => setError("root", { message: "Something went wrong. Please try again." }),
    });
    const toggleSubject = (subjectId) => {
        const exists = selectedSubjects.find((s) => s.subjectId === subjectId);
        if (exists) {
            setSelectedSubjects(selectedSubjects.filter((s) => s.subjectId !== subjectId));
        }
        else {
            setSelectedSubjects([
                ...selectedSubjects,
                { subjectId, maxLevel: "regular" },
            ]);
        }
    };
    const setMaxLevel = (subjectId, maxLevel) => {
        setSelectedSubjects(selectedSubjects.map((s) => s.subjectId === subjectId ? { ...s, maxLevel } : s));
    };
    const onSubmit = (data) => {
        mutation.mutate(data);
    };
    if (submitted) {
        return (_jsxs("div", { className: "max-w-lg mx-auto px-4 py-20 text-center", children: [_jsx("div", { className: "w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-7 h-7 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "You're signed up!" }), _jsx("p", { className: "text-gray-600", children: "Thanks for joining the tutoring program. We'll email you at your school address when a student is matched with you." })] }));
    }
    return (_jsxs("div", { className: "max-w-lg mx-auto px-4 py-12", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Become a Tutor" }), _jsx("p", { className: "text-gray-500 text-sm mb-8", children: "Sign up to help fellow students \u2014 takes about 2 minutes. No account needed." }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-5", children: [_jsx(Input, { label: "Your name", required: true, placeholder: "First and last name", error: errors.name?.message, ...register("name") }), _jsx(Input, { label: "School email", type: "email", required: true, placeholder: "you@yourschool.org", error: errors.email?.message, ...register("email") }), _jsx(Select, { label: "Your grade", required: true, placeholder: "Select your grade", options: gradeLevelOptions, error: errors.gradeLevel?.message, ...register("gradeLevel") }), _jsx(Textarea, { label: "Short bio (optional)", placeholder: "e.g. I'm a junior who loves math and took AP Calc BC last year...", hint: "Helps tutees know who they're working with.", ...register("bio") }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700", children: ["Subjects you can tutor ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("p", { className: "text-xs text-gray-500", children: "Select subjects and set the highest level you're comfortable teaching." }), Object.entries(subjectsByCategory).map(([category, subs]) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-1", children: category }), _jsx("div", { className: "flex flex-col gap-1.5", children: subs.map((s) => {
                                            const selected = selectedSubjects.find((sel) => sel.subjectId === s.id);
                                            return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => toggleSubject(s.id), className: `flex-1 text-left rounded-md border px-3 py-1.5 text-sm transition ${selected
                                                            ? "border-blue-500 bg-blue-50 text-blue-800"
                                                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"}`, children: s.name }), selected && (_jsx("select", { value: selected.maxLevel, onChange: (e) => setMaxLevel(s.id, e.target.value), className: "rounded border border-gray-300 px-2 py-1 text-xs bg-white", children: CLASS_LEVELS.map((l) => (_jsxs("option", { value: l, children: ["up to ", CLASS_LEVEL_LABELS[l]] }, l))) }))] }, s.id));
                                        }) })] }, category))), errors.subjects && (_jsx("p", { className: "text-xs text-red-600", children: errors.subjects.message }))] }), _jsx(AvailabilityPicker, { value: availability, onChange: setAvailability, error: availability.length === 0 && errors.availability
                            ? "Please select at least one availability window"
                            : undefined }), errors.root && (_jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2", children: errors.root.message })), _jsx(Button, { type: "submit", size: "lg", loading: mutation.isPending, className: "mt-2", children: "Sign Up to Tutor" })] })] }));
}
