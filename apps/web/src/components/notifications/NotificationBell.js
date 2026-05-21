import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { clsx } from "clsx";
import { useAdminNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, } from "./useNotifications";
function formatRelativeTime(unixSeconds) {
    const diffSec = Math.floor(Date.now() / 1000) - unixSeconds;
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (diffSec < 60)
        return rtf.format(-diffSec, "second");
    if (diffSec < 3600)
        return rtf.format(-Math.floor(diffSec / 60), "minute");
    if (diffSec < 86400)
        return rtf.format(-Math.floor(diffSec / 3600), "hour");
    return rtf.format(-Math.floor(diffSec / 86400), "day");
}
export function NotificationBell({ variant }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const userQ = useNotifications(variant === "user");
    const adminQ = useAdminNotifications(variant === "admin");
    const { data, isLoading } = variant === "user" ? userQ : adminQ;
    const markRead = useMarkNotificationRead(variant);
    const markAllRead = useMarkAllNotificationsRead(variant);
    const unreadCount = data?.unreadCount ?? 0;
    const items = data?.items ?? [];
    useEffect(() => {
        if (!open)
            return;
        const onKeyDown = (e) => {
            if (e.key === "Escape")
                setOpen(false);
        };
        const onPointerDown = (e) => {
            if (containerRef.current &&
                !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("mousedown", onPointerDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("mousedown", onPointerDown);
        };
    }, [open]);
    const onItemClick = async (item) => {
        if (!item.readAt) {
            await markRead.mutateAsync(item.id);
        }
        setOpen(false);
        navigate(item.targetUrl);
    };
    return (_jsxs("div", { ref: containerRef, className: "relative", children: [_jsxs("button", { type: "button", onClick: () => setOpen((v) => !v), className: "relative p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors", "aria-label": unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications", "aria-expanded": open, "aria-haspopup": "true", children: [_jsx(Bell, { className: "w-5 h-5", "aria-hidden": true }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none", children: unreadCount > 9 ? "9+" : unreadCount }))] }), open && (_jsxs("div", { role: "menu", className: "absolute right-0 mt-2 w-80 max-h-[min(24rem,70vh)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-50 flex flex-col", children: [_jsxs("div", { className: "px-4 py-3 border-b border-gray-100 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-gray-900", children: "Notifications" }), unreadCount > 0 && (_jsx("button", { type: "button", onClick: () => markAllRead.mutate(), disabled: markAllRead.isPending, className: "text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50", children: "Mark all as read" }))] }), _jsxs("div", { className: "overflow-y-auto flex-1", children: [isLoading && (_jsx("p", { className: "px-4 py-6 text-sm text-gray-400 text-center", children: "Loading\u2026" })), !isLoading && items.length === 0 && (_jsx("p", { className: "px-4 py-6 text-sm text-gray-500 text-center", children: "You're all caught up." })), !isLoading &&
                                items.map((item) => (_jsx("button", { type: "button", role: "menuitem", onClick: () => onItemClick(item), className: clsx("w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors", !item.readAt && "bg-blue-50/40"), children: _jsxs("div", { className: "flex items-start gap-2", children: [!item.readAt && (_jsx("span", { className: "mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0", "aria-hidden": true })), _jsxs("div", { className: clsx("min-w-0 flex-1", item.readAt && "pl-4"), children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: item.title }), _jsx("p", { className: "text-xs text-gray-600 mt-0.5 line-clamp-2", children: item.body }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: formatRelativeTime(item.createdAt) })] })] }) }, item.id)))] })] }))] }));
}
