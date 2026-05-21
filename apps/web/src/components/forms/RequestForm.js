import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tuteeRequestSchema, SUBJECTS, CLASS_LEVEL_LABELS, CLASS_LEVELS, GRADE_LEVELS, } from "@academy/shared";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { AvailabilityPicker } from "./AvailabilityPicker";
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
export function RequestForm({ defaultValues, submitLabel, onSubmit, pending, error, emailReadOnly = true, }) {
    const { register, handleSubmit, setValue, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(tuteeRequestSchema),
        defaultValues: {
            availability: [],
            ...defaultValues,
        },
    });
    const availability = watch("availability");
    const setAvailability = (val) => setValue("availability", val, { shouldValidate: true });
    return (_jsxs("form", { onSubmit: handleSubmit((data) => onSubmit(data)), className: "flex flex-col gap-5", children: [_jsx(Input, { label: "Your name", required: true, placeholder: "First and last name", error: errors.name?.message, ...register("name") }), _jsx(Input, { label: "Email", type: "email", required: true, readOnly: emailReadOnly, className: emailReadOnly ? "bg-gray-50 text-gray-500" : undefined, hint: emailReadOnly
                    ? "From your signed-in Google account."
                    : "We'll contact you here when a match is found.", error: errors.email?.message, ...register("email") }), _jsx(Select, { label: "Your grade", required: true, placeholder: "Select your grade", options: gradeLevelOptions, error: errors.gradeLevel?.message, ...register("gradeLevel") }), _jsx(Select, { label: "Subject", required: true, placeholder: "Select a subject", options: subjectOptions, error: errors.subjectId?.message, ...register("subjectId") }), _jsx(Select, { label: "Class level", required: true, placeholder: "Select level", options: classLevelOptions, error: errors.classLevel?.message, ...register("classLevel") }), _jsx(Input, { label: "Current grade (%)", type: "number", min: 0, max: 100, step: 0.1, placeholder: "e.g. 74", hint: "Optional \u2014 helps us track improvement over time.", error: errors.currentGradePct?.message, ...register("currentGradePct", {
                    setValueAs: (v) => v === "" || v == null || Number.isNaN(v) ? undefined : Number(v),
                }) }), _jsx(Textarea, { label: "What do you need help with?", required: true, placeholder: "e.g. I'm struggling with integration by parts and related rates problems...", hint: "Be specific \u2014 this helps us find the best match.", error: errors.needsDescription?.message, ...register("needsDescription") }), _jsx(AvailabilityPicker, { value: availability ?? [], onChange: setAvailability, error: errors.availability?.message }), error && (_jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2", children: error })), _jsx(Button, { type: "submit", size: "lg", loading: pending, className: "mt-2", children: submitLabel })] }));
}
