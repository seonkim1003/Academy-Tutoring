import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tutorSignupSchema, SUBJECTS, CLASS_LEVEL_LABELS, GRADE_LEVELS, getSubjectLevelOptions, } from "@academy/shared";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { AvailabilityPicker } from "./AvailabilityPicker";
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
export function TutorProfileForm({ defaultValues, submitLabel, onSubmit, pending, error, emailReadOnly = true, }) {
    const { register, handleSubmit, setValue, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(tutorSignupSchema),
        defaultValues: {
            subjects: [],
            availability: [],
            ...defaultValues,
        },
    });
    const availability = watch("availability");
    const selectedSubjects = watch("subjects");
    const setAvailability = (val) => setValue("availability", val, { shouldValidate: true });
    const setSelectedSubjects = (val) => setValue("subjects", val, { shouldValidate: true });
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
    return (_jsxs("form", { onSubmit: handleSubmit((data) => onSubmit(data)), className: "flex flex-col gap-5", children: [_jsx(Input, { label: "Your name", required: true, placeholder: "First and last name", error: errors.name?.message, ...register("name") }), _jsx(Input, { label: "Email", type: "email", required: true, readOnly: emailReadOnly, className: emailReadOnly ? "bg-gray-50 text-gray-500" : undefined, hint: emailReadOnly
                    ? "From your signed-in Google account."
                    : undefined, error: errors.email?.message, ...register("email") }), _jsx(Input, { label: "Phone (optional)", type: "tel", placeholder: "e.g. (555) 123-4567", hint: "Shared with your matched tutee so they can reach you.", error: errors.phone?.message, ...register("phone") }), _jsx(Select, { label: "Your grade", required: true, placeholder: "Select your grade", options: gradeLevelOptions, error: errors.gradeLevel?.message, ...register("gradeLevel") }), _jsx(Textarea, { label: "Short bio (optional)", placeholder: "e.g. I'm a junior who loves math and took AP Calc BC last year...", hint: "Helps tutees know who they're working with.", ...register("bio") }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700", children: ["Subjects you can tutor ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("p", { className: "text-xs text-gray-500", children: "Select subjects and set the highest level you're comfortable teaching." }), Object.entries(subjectsByCategory).map(([category, subs]) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-1", children: category }), _jsx("div", { className: "flex flex-col gap-1.5", children: subs.map((s) => {
                                    const selected = selectedSubjects.find((sel) => sel.subjectId === s.id);
                                    const levelOptions = getSubjectLevelOptions(s.id);
                                    const showLevel = selected && levelOptions.length > 1;
                                    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => toggleSubject(s.id), className: `flex-1 text-left rounded-md border px-3 py-1.5 text-sm transition ${selected
                                                    ? "border-blue-500 bg-blue-50 text-blue-800"
                                                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"}`, children: s.name }), showLevel && (_jsx("select", { value: selected.maxLevel, onChange: (e) => setMaxLevel(s.id, e.target
                                                    .value), className: "rounded border border-gray-300 px-2 py-1 text-xs bg-white", children: levelOptions.map((l) => (_jsxs("option", { value: l, children: ["up to ", CLASS_LEVEL_LABELS[l]] }, l))) }))] }, s.id));
                                }) })] }, category))), errors.subjects && (_jsx("p", { className: "text-xs text-red-600", children: errors.subjects.message }))] }), _jsx(AvailabilityPicker, { value: availability ?? [], onChange: setAvailability, error: (availability?.length ?? 0) === 0 && errors.availability
                    ? "Please select at least one availability window"
                    : undefined }), error && (_jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2", children: error })), _jsx(Button, { type: "submit", size: "lg", loading: pending, className: "mt-2", children: submitLabel })] }));
}
