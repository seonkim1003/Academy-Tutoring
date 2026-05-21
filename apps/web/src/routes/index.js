import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
export function Landing() {
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-20 text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Peer Tutoring at Academy" }), _jsx("p", { className: "text-lg text-gray-600 mb-10 max-w-xl mx-auto", children: "Connect with a fellow student who can help you succeed \u2014 or sign up to share your knowledge with others." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Link, { to: "/request", children: _jsx(Button, { size: "lg", className: "w-full sm:w-auto", children: "Request a Tutor" }) }), _jsx(Link, { to: "/tutor-signup", children: _jsx(Button, { size: "lg", variant: "secondary", className: "w-full sm:w-auto", children: "Become a Tutor" }) })] }), _jsx("div", { className: "mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left", children: [
                    {
                        title: "Quick to submit",
                        body: "No account needed. Just fill out a short form with your subject, schedule, and what you need help with.",
                    },
                    {
                        title: "Smart matching",
                        body: "We match you with a tutor based on subject and shared availability — so scheduling is already handled.",
                    },
                    {
                        title: "Track your progress",
                        body: "After each session, share a quick update so leadership can measure what's working across the program.",
                    },
                ].map((card) => (_jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-5", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: card.title }), _jsx("p", { className: "text-sm text-gray-600 leading-relaxed", children: card.body })] }, card.title))) })] }));
}
