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
    element: <Root />,
    children: [
      { index: true, element: <Landing /> },
      { path: "request", element: <RequestForm /> },
      { path: "tutor-signup", element: <TutorSignup /> },
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
