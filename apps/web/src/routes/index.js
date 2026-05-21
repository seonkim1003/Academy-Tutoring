import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useMe } from "../components/auth/useMe";
export function Landing() {
    const { data: me, isLoading } = useMe();
    const signedIn = !!me;
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-20 text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Peer Tutoring at Academy" }), _jsx("p", { className: "text-lg text-gray-600 mb-10 max-w-xl mx-auto", children: "Connect with a fellow student who can help you succeed \u2014 or sign up to share your knowledge with others." }), _jsx("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: isLoading ? null : signedIn ? (_jsx(Link, { to: "/dashboard", children: _jsx(Button, { size: "lg", className: "w-full sm:w-auto", children: "Go to your dashboard" }) })) : (_jsx(Link, { to: "/login", children: _jsx(Button, { size: "lg", className: "w-full sm:w-auto", children: "Sign in with Google to get started" }) })) }), _jsx("div", { className: "mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left", children: [
                    {
                        title: "Quick to start",
                        body: "Sign in with your Google account and pick whether you want a tutor or want to tutor.",
                    },
                    {
                        title: "Smart matching",
                        body: "We match you with a tutor based on subject and shared availability — so scheduling is already handled.",
                    },
                    {
                        title: "Track your progress",
                        body: "Your dashboard shows your matches and lets you update your subjects, availability, and requests anytime.",
                    },
                ].map((card) => (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-5", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: card.title }), _jsx("p", { className: "text-sm text-gray-600 leading-relaxed", children: card.body })] }, card.title))) })] }));
}
