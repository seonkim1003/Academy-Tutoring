import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
export function AdminVerify() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    useEffect(() => {
        const token = params.get("token");
        if (!token) {
            setError("Missing login token.");
            return;
        }
        api.get(`/admin/verify?token=${token}`).then((res) => {
            if (res.success) {
                navigate("/admin/dashboard", { replace: true });
            }
            else {
                setError(res.error ?? "Invalid or expired link.");
            }
        });
    }, []);
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-sm w-full text-center", children: [_jsx("p", { className: "text-red-600 font-medium mb-2", children: error }), _jsx("a", { href: "/admin/login", className: "text-sm text-blue-600 underline", children: "Request a new login link" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("p", { className: "text-gray-500 text-sm", children: "Logging you in\u2026" }) }));
}
