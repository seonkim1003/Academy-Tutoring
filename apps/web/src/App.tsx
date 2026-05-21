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
    element: <Root />,
    children: [
      { index: true, element: <Landing /> },
      { path: "login", element: <LoginPage /> },

      // Onboarding (auth-required via RequireUser inside each page)
      { path: "onboarding/role", element: <OnboardingRole /> },
      { path: "onboarding/claim", element: <OnboardingClaim /> },
      { path: "onboarding/tutor", element: <OnboardingTutor /> },
      { path: "onboarding/request", element: <OnboardingRequest /> },

      // Dashboards (auth-required via RequireUser inside each page)
      { path: "dashboard", element: <Dashboard /> },
      { path: "dashboard/tutor", element: <TutorDashboard /> },
      { path: "dashboard/tutor/edit", element: <TutorEdit /> },
      { path: "dashboard/tutee", element: <TuteeDashboard /> },
      { path: "dashboard/tutee/new", element: <TuteeNewRequest /> },
      { path: "dashboard/tutee/request/:id/edit", element: <TuteeEdit /> },

      // Legacy URLs — redirect to the auth-gated onboarding flow
      { path: "request", element: <Navigate to="/onboarding/request" replace /> },
      { path: "tutor-signup", element: <Navigate to="/onboarding/tutor" replace /> },
    ],
  },
  {
    path: "/admin",
    children: [
      { path: "login", element: <AdminLogin /> },
      { path: "verify", element: <AdminVerify /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "requests", element: <AdminRequests /> },
      { path: "tutors", element: <AdminTutors /> },
      { path: "matches", element: <AdminMatches /> },
    ],
  },
  // One-click email action links (no layout wrapper — standalone pages)
  { path: "/actions/:token/accept", element: <MatchAccept /> },
  { path: "/actions/:token/decline", element: <MatchDecline /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
