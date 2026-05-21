import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from "clsx";
const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    ghost: "text-gray-600 hover:bg-gray-100 disabled:opacity-50",
};
const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
};
export function Button({ variant = "primary", size = "md", loading, disabled, className, children, ...props }) {
    return (_jsxs("button", { disabled: disabled || loading, className: clsx("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed", variants[variant], sizes[size], className), ...props, children: [loading && (_jsxs("svg", { className: "h-4 w-4 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8H4z" })] })), children] }));
}
