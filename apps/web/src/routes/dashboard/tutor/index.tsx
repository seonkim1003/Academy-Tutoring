import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUBJECTS, CLASS_LEVEL_LABELS, type ClassLevel } from "@academy/shared";
import { api } from "../../../lib/api";
import {
  formatTime,
  dayLabel,
  MATCH_STATUS_COLORS,
  statusChipClass,
} from "../../../lib/format";
import { Button } from "../../../components/ui/Button";
import { RequireUser } from "../../../components/auth/RequireUser";
import { invalidateUserNotifications } from "../../../components/notifications/useNotifications";

type TutorData = {
  tutor: {
    id: number;
    name: string;
    email: string;
    gradeLevel: number | null;
    bio: string | null;
    phone: string | null;
    active: boolean;
  };
  subjects: { subjectId: string; maxLevel: ClassLevel }[];
  availability: {
    dayOfWeek: number;
    startMinute: number;
    endMinute: number;
  }[];
};

type Match = {
  id: number;
  status: string;
  proposedDayOfWeek: number | null;
  proposedStartMinute: number | null;
  proposedEndMinute: number | null;
  createdAt: number;
  respondedAt: number | null;
  requestId: number;
  subjectId: string | null;
  subjectName: string | null;
  classLevel: string | null;
  needsDescription: string | null;
  tuteeName: string | null;
  tuteeEmail: string | null;
};

function TutorDashboardInner() {
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
      const r = await api.get<Match[]>("/me/matches");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) =>
      api.post(`/me/matches/${id}/${action}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "matches"] });
      invalidateUserNotifications(qc);
    },
  });

  if (tutorQ.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (tutorQ.isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-700 mb-4">You don't have a tutor profile yet.</p>
        <Link to="/onboarding/tutor">
          <Button>Become a tutor</Button>
        </Link>
      </div>
    );
  }

  const data = tutorQ.data!;
  const matches = matchesQ.data ?? [];

  // Group availability for display: by (start, end), list the days
  const availGroups = new Map<
    string,
    { startMinute: number; endMinute: number; days: number[] }
  >();
  for (const a of data.availability) {
    const key = `${a.startMinute}-${a.endMinute}`;
    const g = availGroups.get(key);
    if (g) g.days.push(a.dayOfWeek);
    else
      availGroups.set(key, {
        startMinute: a.startMinute,
        endMinute: a.endMinute,
        days: [a.dayOfWeek],
      });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutor dashboard</h1>
        <Link to="/dashboard/tutor/edit">
          <Button variant="secondary" size="sm">
            Edit profile
          </Button>
        </Link>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <p className="text-gray-900 font-medium">{data.tutor.name}</p>
        <p className="text-sm text-gray-500">{data.tutor.email}</p>
        {data.tutor.phone && (
          <p className="text-sm text-gray-500">{data.tutor.phone}</p>
        )}
        {data.tutor.gradeLevel != null && (
          <p className="text-sm text-gray-500">Grade {data.tutor.gradeLevel}</p>
        )}
        {data.tutor.bio && (
          <p className="text-sm text-gray-700 italic mt-2">"{data.tutor.bio}"</p>
        )}
        {!data.tutor.active && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-2 inline-block">
            Your profile is currently inactive — an admin can reactivate it.
          </p>
        )}
      </Section>

      {/* Subjects */}
      <Section title="Subjects you tutor">
        {data.subjects.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No subjects yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {data.subjects.map((s) => {
              const name =
                SUBJECTS.find((x) => x.id === s.subjectId)?.name ?? s.subjectId;
              return (
                <li
                  key={s.subjectId}
                  className="rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 text-xs font-medium"
                >
                  {name}
                  <span className="ml-1 text-blue-500">
                    · up to {CLASS_LEVEL_LABELS[s.maxLevel]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Availability */}
      <Section title="Availability">
        {availGroups.size === 0 ? (
          <p className="text-sm text-gray-400 italic">No availability set.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200">
            {[...availGroups.values()]
              .sort((a, b) => a.startMinute - b.startMinute)
              .map((g, i) => (
                <li
                  key={i}
                  className="px-3 py-2 text-sm text-gray-800 flex justify-between"
                >
                  <span className="font-medium">
                    {g.days
                      .sort()
                      .map((d) => dayLabel(d).slice(0, 3))
                      .join(", ")}
                  </span>
                  <span>
                    {formatTime(g.startMinute)} – {formatTime(g.endMinute)}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Section>

      {/* Matches */}
      <Section title={`Matches (${matches.length})`}>
        {matchesQ.isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            No matches yet. An admin will match you with a tutee when one needs
            help in your subject.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {matches.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {m.tuteeName ?? "Tutee"} — {m.subjectName ?? "—"}
                    </p>
                    {m.classLevel && (
                      <p className="text-xs text-gray-500">
                        {CLASS_LEVEL_LABELS[m.classLevel as ClassLevel] ??
                          m.classLevel}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium border rounded-full px-2 py-0.5 ${statusChipClass(
                      m.status,
                      MATCH_STATUS_COLORS
                    )}`}
                  >
                    {m.status}
                  </span>
                </div>
                {m.proposedDayOfWeek != null &&
                  m.proposedStartMinute != null &&
                  m.proposedEndMinute != null && (
                    <p className="text-sm text-gray-700">
                      Proposed:{" "}
                      <span className="font-medium">
                        {dayLabel(m.proposedDayOfWeek)},{" "}
                        {formatTime(m.proposedStartMinute)} –{" "}
                        {formatTime(m.proposedEndMinute)}
                      </span>
                    </p>
                  )}
                {m.needsDescription && (
                  <p className="text-sm text-gray-600 mt-1">
                    "{m.needsDescription}"
                  </p>
                )}
                {m.status === "proposed" && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      loading={respond.isPending}
                      onClick={() =>
                        respond.mutate({ id: m.id, action: "accept" })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={respond.isPending}
                      onClick={() =>
                        respond.mutate({ id: m.id, action: "decline" })
                      }
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        {title}
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {children}
      </div>
    </section>
  );
}

export function TutorDashboard() {
  return (
    <RequireUser>
      <TutorDashboardInner />
    </RequireUser>
  );
}
