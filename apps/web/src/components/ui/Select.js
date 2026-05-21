import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { clsx } from "clsx";
export const Select = forwardRef(({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("label", { htmlFor: selectId, className: "text-sm font-medium text-gray-700", children: [label, props.required && _jsx("span", { className: "ml-0.5 text-red-500", children: "*" })] }), _jsxs("select", { ref: ref, id: selectId, className: clsx("rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", error ? "border-red-400 bg-red-50" : "border-gray-300", className), ...props, children: [placeholder && _jsx("option", { value: "", children: placeholder }), options.map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value)))] }), hint && !error && _jsx("p", { className: "text-xs text-gray-500", children: hint }), error && _jsx("p", { className: "text-xs text-red-600", children: error })] }));
});
Select.displayName = "Select";
