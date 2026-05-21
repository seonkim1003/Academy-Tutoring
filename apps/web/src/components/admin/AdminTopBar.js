import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import { NotificationBell } from "../notifications/NotificationBell";
export function AdminTopBar({ title }) {
    const onLogout = () => api.post("/admin/logout", {}).then(() => {
        window.location.href = "/admin/login";
    });
    return (_jsx("div", { className: "bg-white border-b border-gray-200", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-4 min-w-0", children: title ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/admin/dashboard", className: "text-sm text-gray-500 hover:text-gray-900 shrink-0", children: "\u2190 Dashboard" }), _jsx("span", { className: "font-semibold text-gray-900 truncate", children: title })] })) : (_jsx("span", { className: "font-semibold text-gray-900", children: "Admin Dashboard" })) }), _jsxs("nav", { className: "flex items-center gap-3 sm:gap-4 text-sm text-gray-600 shrink-0", children: [!title && (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/admin/requests", className: "hover:text-gray-900 hidden sm:inline", children: "Requests" }), _jsx(Link, { to: "/admin/tutors", className: "hover:text-gray-900 hidden sm:inline", children: "Tutors" }), _jsx(Link, { to: "/admin/matches", className: "hover:text-gray-900 hidden sm:inline", children: "Matches" })] })), _jsx(NotificationBell, { variant: "admin" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onLogout, children: "Log out" })] })] }) }));
}
