import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./routes/_root";
import { Landing } from "./routes/index";
import { RequestForm } from "./routes/request";
import { TutorSignup } from "./routes/tutor-signup";
import { AdminLogin } from "./routes/admin/login";
import { AdminVerify } from "./routes/admin/verify";
import { AdminDashboard } from "./routes/admin/dashboard";
import { AdminRequests } from "./routes/admin/requests";
import { AdminTutors } from "./routes/admin/tutors";
import { AdminMatches } from "./routes/admin/matches";
import { MatchAccept } from "./routes/actions/accept";
import { MatchDecline } from "./routes/actions/decline";
const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(Root, {}),
        children: [
            { index: true, element: _jsx(Landing, {}) },
            { path: "request", element: _jsx(RequestForm, {}) },
            { path: "tutor-signup", element: _jsx(TutorSignup, {}) },
        ],
    },
    {
        path: "/admin",
        children: [
            { path: "login", element: _jsx(AdminLogin, {}) },
            { path: "verify", element: _jsx(AdminVerify, {}) },
            { path: "dashboard", element: _jsx(AdminDashboard, {}) },
            { path: "requests", element: _jsx(AdminRequests, {}) },
            { path: "tutors", element: _jsx(AdminTutors, {}) },
            { path: "matches", element: _jsx(AdminMatches, {}) },
        ],
    },
    // One-click email action links (no layout wrapper — standalone pages)
    { path: "/actions/:token/accept", element: _jsx(MatchAccept, {}) },
    { path: "/actions/:token/decline", element: _jsx(MatchDecline, {}) },
]);
export default function App() {
    return _jsx(RouterProvider, { router: router });
}
