import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CLASS_LEVEL_LABELS, type ClassLevel } from "@academy/shared";
import { api } from "../../../lib/api";
import {
  formatTime,
  dayLabel,
  formatDate,
  REQUEST_STATUS_COLORS,
  statusChipClass,
} from "../../../lib/format";
import { Button } from "../../../components/ui/Button";
import { RequireUser } from "../../../components/auth/RequireUser";

type TuteeData = {
  tutee: {
    id: number;
    name: string;
    email: string;
    gradeLevel: number | null;
  };
  requests: {
    request: {
      id: number;
      subjectId: string;
      classLevel: ClassLevel;
      currentGradePct: number | null;
      needsDescription: string;
      status: string;
      createdAt: number;
    };
    subjectName: string;
    availability: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
    }[];
    matches: {
      id: number;
      status: string;
      proposedDayOfWeek: number | null;
      proposedStartMinute: number | null;
      proposedEndMinute: number | null;
      tutorName: string | null;
      tutorEmail: string | null;
    }[];
  }[];
};

function TuteeDashboardInner() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me", "tutee"],
    queryFn: async () => {
      const r = await api.get<TuteeData>("/me/tutee");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-700 mb-4">You haven't submitted any requests yet.</p>
        <Link to="/onboarding/request">
          <Button>Submit a request</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutee dashboard</h1>
          <p className="text-sm text-gray-500">
            {data.tutee.name} — {data.tutee.email}
          </p>
        </div>
        <Link to="/dashboard/tutee/new">
          <Button>+ New request</Button>
        </Link>
      </div>

      {data.requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-700 mb-3">No requests yet.</p>
          <Link to="/dashboard/tutee/new">
            <Button>Submit your first request</Button>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {data.requests.map(({ request, subjectName, availability, matches }) => (
            <li
              key={request.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {subjectName}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      ({CLASS_LEVEL_LABELS[request.classLevel]})
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    Submitted {formatDate(request.createdAt)}
                    {request.currentGradePct != null
                      ? ` · current grade ${request.currentGradePct}%`
                      : ""}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium border rounded-full px-2 py-0.5 ${statusChipClass(
                    request.status,
                    REQUEST_STATUS_COLORS
                  )}`}
                >
                  {request.status}
                </span>
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                {request.needsDescription}
              </p>

              {availability.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    Availability
                  </p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
                    {availability.map((a, i) => (
                      <li key={i}>
                        {dayLabel(a.dayOfWeek)} — {formatTime(a.startMinute)} to{" "}
                        {formatTime(a.endMinute)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matches.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    Matches
                  </p>
                  <ul className="flex flex-col gap-2">
                    {matches.map((m) => (
                      <li
                        key={m.id}
                        className="text-sm text-gray-700 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-medium">
                            {m.tutorName ?? "Tutor"}
                          </span>
                          <span className="text-xs text-gray-500">{m.status}</span>
                        </div>
                        {m.proposedDayOfWeek != null &&
                          m.proposedStartMinute != null &&
                          m.proposedEndMinute != null && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              Proposed: {dayLabel(m.proposedDayOfWeek)},{" "}
                              {formatTime(m.proposedStartMinute)} –{" "}
                              {formatTime(m.proposedEndMinute)}
                            </p>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <Link to={`/dashboard/tutee/request/${request.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TuteeDashboard() {
  return (
    <RequireUser>
      <TuteeDashboardInner />
    </RequireUser>
  );
}
