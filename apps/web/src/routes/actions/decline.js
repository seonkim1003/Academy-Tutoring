import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
export function MatchDecline() {
    const { token } = useParams();
    const [state, setState] = useState("loading");
    const [errorMsg, setErrorMsg] = useState("");
    useEffect(() => {
        if (!token) {
            setState("error");
            setErrorMsg("Missing token.");
            return;
        }
        api.post(`/actions/${token}/match-decline`, {}).then((res) => {
            if (res.success) {
                setState("success");
            }
            else {
                setState("error");
                setErrorMsg(res.error ?? "Something went wrong.");
            }
        }).catch(() => {
            setState("error");
            setErrorMsg("Something went wrong. Please try again.");
        });
    }, [token]);
    if (state === "loading") {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("p", { className: "text-gray-400 text-sm", children: "Confirming your response\u2026" }) }));
    }
    if (state === "success") {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-sm w-full text-center", children: [_jsx("div", { className: "w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-7 h-7 text-yellow-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }), _jsx("h1", { className: "text-xl font-bold text-gray-900 mb-2", children: "Response recorded" }), _jsx("p", { className: "text-gray-500 text-sm", children: "Got it \u2014 you've declined this match. Leadership will be notified and will try to find another tutor for this student. No action needed on your end." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-sm w-full text-center", children: [_jsx("div", { className: "w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-7 h-7 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }), _jsx("h1", { className: "text-xl font-bold text-gray-900 mb-2", children: "Link invalid or expired" }), _jsx("p", { className: "text-gray-500 text-sm", children: errorMsg }), _jsx("p", { className: "text-gray-400 text-xs mt-3", children: "If you think this is a mistake, reply to the email you received or contact leadership directly." })] }) }));
}
