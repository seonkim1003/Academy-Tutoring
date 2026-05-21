import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
export function Root() {
    const { pathname } = useLocation();
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-10", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 h-14 flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "font-semibold text-gray-900 hover:text-blue-600 transition-colors", children: "Academy Tutoring" }), _jsxs("nav", { className: "flex items-center gap-4 text-sm", children: [_jsx(Link, { to: "/request", className: clsx("font-medium transition-colors", pathname === "/request" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"), children: "Request Tutoring" }), _jsx(Link, { to: "/tutor-signup", className: clsx("font-medium transition-colors", pathname === "/tutor-signup" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"), children: "Become a Tutor" })] })] }) }), _jsx("main", { className: "flex-1", children: _jsx(Outlet, {}) }), _jsxs("footer", { className: "border-t border-gray-100 py-6 text-center text-xs text-gray-400", children: ["Academy Tutoring Program \u2014 ", new Date().getFullYear()] })] }));
}
