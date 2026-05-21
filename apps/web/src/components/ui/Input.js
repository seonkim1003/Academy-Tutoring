import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { clsx } from "clsx";
export const Input = forwardRef(({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("label", { htmlFor: inputId, className: "text-sm font-medium text-gray-700", children: [label, props.required && _jsx("span", { className: "ml-0.5 text-red-500", children: "*" })] }), _jsx("input", { ref: ref, id: inputId, className: clsx("rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500", error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white", className), ...props }), hint && !error && _jsx("p", { className: "text-xs text-gray-500", children: hint }), error && _jsx("p", { className: "text-xs text-red-600", children: error })] }));
});
Input.displayName = "Input";
