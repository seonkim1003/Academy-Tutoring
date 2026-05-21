import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CLASS_LEVEL_LABELS, type ClassLevel } from "@academy/shared";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import {
  formatTime,
  dayLabel,
  MATCH_STATUS_COLORS,
  REQUEST_STATUS_COLORS,
  statusChipClass,
} from "../../lib/format";
import { invalidateUserNotifications } from "../../components/notifications/useNotifications";

type TutorData = {
  tutor: { id: number; name: string; active: boolean };
  subjects: { subjectId: string }[];
  availability: { dayOfWeek: number; startMinute: number; endMinute: number }[];
};

type TutorMatch = {
  id: number;
  status: string;
  proposedDayOfWeek: number | null;
  proposedStartMinute: number | null;
  proposedEndMinute: number | null;
  subjectName: string | null;
  tuteeName: string | null;
};

type TuteeData = {
  tutee: { id: number; name: string };
  requests: {
    request: {
      id: number;
      classLevel: ClassLevel;
      status: string;
      createdAt: number;
    };
    subjectName: string;
    matches: { id: number; status: string; tutorName: string | null }[];
  }[];
};

function PanelSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  );
}

function CountsRow({ items }: { items: string[] }) {
  return (
    <p className="text-sm text-gray-600">
      {items.map((item, i) => (
        <span key={item}>
          {i > 0 && <span className="mx-2 text-gray-300">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
}

function ViewFullLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-blue-600 hover:text-blue-800"
    >
      {label} →
    </Link>
  );
}

function TutorSummaryPanel() {
  const qc = useQueryClient();
  const tutorQ = useQuery({
    queryKey: ["me", "tutor"],
    queryFn: async () => {
      const r = await api.get<TutorData>("/me/tutor");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });
  const matchesQ = useQuery({
    queryKey: ["me", "matches"],
    queryFn: async () => {
      const r = await api.get<TutorMatch[]>("/me/matches");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) =>
      api.post(`/me/matches/${id}/${action}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "matches"] });
      qc.invalidateQueries({ queryKey: ["me", "tutee"] });
      invalidateUserNotifications(qc);
    },
  });

  if (tutorQ.isLoading || matchesQ.isLoading) {
    return <PanelSkeleton />;
  }

  if (tutorQ.isError) {
    return (
      <Link
        to="/onboarding/tutor"
        className="block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          + Become a tutor
        </h2>
        <p className="text-sm text-gray-600">
          Share your subjects and availability to start tutoring.
        </p>
      </Link>
    );
  }

  const tutorData = tutorQ.data!;
  const matches = matchesQ.data ?? [];
  const proposed = matches.find((m) => m.status === "proposed");

  const availSlotCount = new Set(
    tutorData.availability.map((a) => `${a.startMinute}-${a.endMinute}`)
  ).size;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Tutor</h2>
        <ViewFullLink to="/dashboard/tutor" label="View full dashboard" />
      </div>

      <CountsRow
        items={[
          `${matches.length} ${matches.length === 1 ? "match" : "matches"}`,
          `${tutorData.subjects.length} ${tutorData.subjects.length === 1 ? "subject" : "subjects"}`,
          `${availSlotCount} availability ${availSlotCount === 1 ? "slot" : "slots"}`,
        ]}
      />

      {!tutorData.tutor.active && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-3 inline-block">
          Profile inactive — contact an admin to reactivate.
        </p>
      )}

      {proposed && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900">
              New match: {proposed.tuteeName ?? "Tutee"} —{" "}
              {proposed.subjectName ?? "—"}
            </p>
            <span
              className={`text-xs font-medium border rounded-full px-2 py-0.5 shrink-0 ${statusChipClass(
                proposed.status,
                MATCH_STATUS_COLORS
              )}`}
            >
              {proposed.status}
            </span>
          </div>
          {proposed.proposedDayOfWeek != null &&
            proposed.proposedStartMinute != null &&
            proposed.proposedEndMinute != null && (
              <p className="text-sm text-gray-700 mb-3">
                {dayLabel(proposed.proposedDayOfWeek)},{" "}
                {formatTime(proposed.proposedStartMinute)} –{" "}
                {formatTime(proposed.proposedEndMinute)}
              </p>
            )}
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={respond.isPending}
              onClick={() => respond.mutate({ id: proposed.id, action: "accept" })}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={respond.isPending}
              onClick={() =>
                respond.mutate({ id: proposed.id, action: "decline" })
              }
            >
              Decline
            </Button>
          </div>
          {respond.isError && (
            <p className="text-sm text-red-600 mt-2">
              {respond.error instanceof Error
                ? respond.error.message
                : "Something went wrong. Try again."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TuteeSummaryPanel() {
  const tuteeQ = useQuery({
    queryKey: ["me", "tutee"],
    queryFn: async () => {
      const r = await api.get<TuteeData>("/me/tutee");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  if (tuteeQ.isLoading) {
    return <PanelSkeleton />;
  }

  if (tuteeQ.isError || !tuteeQ.data) {
    return (
      <Link
        to="/onboarding/request"
        className="block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          + Request a tutor
        </h2>
        <p className="text-sm text-gray-600">
          Submit a request to be matched with a peer tutor.
        </p>
      </Link>
    );
  }

  const data = tuteeQ.data;
  const requests = data.requests;
  const openRequests = requests.filter(
    (r) => r.request.status === "pending" || r.request.status === "matched"
  );
  const activeMatches = requests.flatMap((r) => r.matches).length;

  const latestRequest = [...requests].sort(
    (a, b) => b.request.createdAt - a.request.createdAt
  )[0];

  const latestMatch = latestRequest?.matches[0];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Tutee</h2>
        <ViewFullLink to="/dashboard/tutee" label="View full dashboard" />
      </div>

      <CountsRow
        items={[
          `${openRequests.length} open ${openRequests.length === 1 ? "request" : "requests"}`,
          `${activeMatches} active ${activeMatches === 1 ? "match" : "matches"}`,
        ]}
      />

      {latestRequest && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900">
              {latestRequest.subjectName}{" "}
              <span className="font-normal text-gray-500">
                ({CLASS_LEVEL_LABELS[latestRequest.request.classLevel]})
              </span>
            </p>
            <span
              className={`text-xs font-medium border rounded-full px-2 py-0.5 shrink-0 ${statusChipClass(
                latestRequest.request.status,
                REQUEST_STATUS_COLORS
              )}`}
            >
              {latestRequest.request.status}
            </span>
          </div>
          {latestMatch ? (
            <p className="text-sm text-gray-700">
              {latestMatch.tutorName ?? "Tutor"} — match{" "}
              <span className="font-medium">{latestMatch.status}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">Waiting for a tutor match.</p>
          )}
        </div>
      )}

      {requests.length === 0 && (
        <p className="text-sm text-gray-500 mt-3">
          No requests yet.{" "}
          <Link
            to="/dashboard/tutee/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Submit one
          </Link>
        </p>
      )}
    </div>
  );
}

function DashboardInner() {
  const { data } = useMe();
  if (!data) return null;
  const { roles, user } = data;
  const hasAny = roles.isTutor || roles.isTutee;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Hi, {user.name.split(" ")[0]}
      </h1>
      <p className="text-gray-600 mb-8">
        {hasAny
          ? "Here's what's on your plate."
          : "Get started by choosing what brings you here."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.isTutor ? (
          <TutorSummaryPanel />
        ) : (
          <Link
            to="/onboarding/tutor"
            className="block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              + Become a tutor
            </h2>
            <p className="text-sm text-gray-600">
              Share your subjects and availability to start tutoring.
            </p>
          </Link>
        )}

        {roles.isTutee ? (
          <TuteeSummaryPanel />
        ) : (
          <Link
            to="/onboarding/request"
            className="block rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-400 transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              + Request a tutor
            </h2>
            <p className="text-sm text-gray-600">
              Submit a request to be matched with a peer tutor.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <RequireUser>
      <DashboardInner />
    </RequireUser>
  );
}
