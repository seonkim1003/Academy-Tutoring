import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { adminLoginSchema } from "@academy/shared";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
export function AdminLogin() {
    const [sent, setSent] = useState(false);
    const { register, handleSubmit, setError, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(adminLoginSchema),
    });
    const email = watch("email");
    const mutation = useMutation({
        mutationFn: (data) => api.post("/admin/login", data),
        onSuccess: () => setSent(true),
        onError: () => setError("root", { message: "Something went wrong. Please try again." }),
    });
    if (sent) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-sm w-full bg-white rounded-xl border border-gray-200 p-8 text-center", children: [_jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-6 h-6 text-blue-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }), _jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Check your inbox" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["If ", _jsx("strong", { children: email }), " is an admin account, a login link is on its way. It expires in 15 minutes."] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-sm w-full bg-white rounded-xl border border-gray-200 p-8", children: [_jsx("h1", { className: "text-xl font-bold text-gray-900 mb-1", children: "Admin Login" }), _jsx("p", { className: "text-sm text-gray-500 mb-6", children: "Enter your school email \u2014 we'll send a one-click login link." }), _jsxs("form", { onSubmit: handleSubmit((d) => mutation.mutate(d)), className: "flex flex-col gap-4", children: [_jsx(Input, { label: "School email", type: "email", required: true, placeholder: "you@yourschool.org", error: errors.email?.message, ...register("email") }), errors.root && (_jsx("p", { className: "text-xs text-red-600", children: errors.root.message })), _jsx(Button, { type: "submit", loading: mutation.isPending, children: "Send Login Link" })] })] }) }));
}
