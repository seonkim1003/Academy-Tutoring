import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useMe } from "../components/auth/useMe";
import { api } from "../lib/api";
export function Root() {
    const { pathname } = useLocation();
    const { data: me, isLoading } = useMe();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const onLogout = async () => {
        await api.post("/auth/logout", {});
        qc.clear();
        navigate("/", { replace: true });
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-10", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 h-14 flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "font-semibold text-gray-900 hover:text-blue-600 transition-colors", children: "Academy Tutoring" }), _jsx("nav", { className: "flex items-center gap-4 text-sm", children: !isLoading && me ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/dashboard", className: clsx("font-medium transition-colors", pathname.startsWith("/dashboard")
                                            ? "text-blue-600"
                                            : "text-gray-600 hover:text-gray-900"), children: "Dashboard" }), _jsxs("div", { className: "flex items-center gap-2", children: [me.user.picture && (_jsx("img", { src: me.user.picture, alt: "", className: "w-7 h-7 rounded-full", referrerPolicy: "no-referrer" })), _jsx("span", { className: "text-gray-700 hidden sm:inline", children: me.user.name.split(" ")[0] })] }), _jsx("button", { type: "button", onClick: onLogout, className: "text-gray-500 hover:text-gray-900", children: "Log out" })] })) : (_jsx(Link, { to: "/login", className: clsx("font-medium transition-colors", pathname === "/login"
                                    ? "text-blue-600"
                                    : "text-gray-600 hover:text-gray-900"), children: "Sign in" })) })] }) }), _jsx("main", { className: "flex-1", children: _jsx(Outlet, {}) }), _jsxs("footer", { className: "border-t border-gray-100 py-6 text-center text-xs text-gray-400", children: ["Academy Tutoring Program \u2014 ", new Date().getFullYear()] })] }));
}
