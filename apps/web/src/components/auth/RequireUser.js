import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "./useMe";
export function RequireUser({ children, allowPendingClaim = false }) {
    const { data, isLoading, isError } = useMe();
    const loc = useLocation();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading\u2026" }) }));
    }
    if (isError || !data) {
        return (_jsx(Navigate, { to: `/login?next=${encodeURIComponent(loc.pathname + loc.search)}`, replace: true }));
    }
    if (data.pendingClaim && !allowPendingClaim) {
        return _jsx(Navigate, { to: "/onboarding/claim", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
