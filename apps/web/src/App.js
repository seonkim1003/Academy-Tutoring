import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Root } from "./routes/_root";
import { Landing } from "./routes/index";
import { LoginPage } from "./routes/login";
import { OnboardingRole } from "./routes/onboarding/role";
import { OnboardingClaim } from "./routes/onboarding/claim";
import { OnboardingTutor } from "./routes/onboarding/tutor";
import { OnboardingRequest } from "./routes/onboarding/request";
import { Dashboard } from "./routes/dashboard";
import { TutorDashboard } from "./routes/dashboard/tutor";
import { TutorEdit } from "./routes/dashboard/tutor/edit";
import { TuteeDashboard } from "./routes/dashboard/tutee";
import { TuteeNewRequest } from "./routes/dashboard/tutee/new";
import { TuteeEdit } from "./routes/dashboard/tutee/edit";
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
            { path: "login", element: _jsx(LoginPage, {}) },
            // Onboarding (auth-required via RequireUser inside each page)
            { path: "onboarding/role", element: _jsx(OnboardingRole, {}) },
            { path: "onboarding/claim", element: _jsx(OnboardingClaim, {}) },
            { path: "onboarding/tutor", element: _jsx(OnboardingTutor, {}) },
            { path: "onboarding/request", element: _jsx(OnboardingRequest, {}) },
            // Dashboards (auth-required via RequireUser inside each page)
            { path: "dashboard", element: _jsx(Dashboard, {}) },
            { path: "dashboard/tutor", element: _jsx(TutorDashboard, {}) },
            { path: "dashboard/tutor/edit", element: _jsx(TutorEdit, {}) },
            { path: "dashboard/tutee", element: _jsx(TuteeDashboard, {}) },
            { path: "dashboard/tutee/new", element: _jsx(TuteeNewRequest, {}) },
            { path: "dashboard/tutee/request/:id/edit", element: _jsx(TuteeEdit, {}) },
            // Legacy URLs — redirect to the auth-gated onboarding flow
            { path: "request", element: _jsx(Navigate, { to: "/onboarding/request", replace: true }) },
            { path: "tutor-signup", element: _jsx(Navigate, { to: "/onboarding/tutor", replace: true }) },
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
