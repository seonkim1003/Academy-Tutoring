import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminTopBar } from "../../components/admin/AdminTopBar";
import { SUBJECTS, CLASS_LEVEL_LABELS } from "@academy/shared";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";

type Request = {
  id: number;
  status: string;
  classLevel: string;
  currentGradePct: number | null;
  needsDescription: string;
  createdAt: number;
  subjectId: string;
  tuteeName: string | null;
  tuteeEmail: string | null;
};

type SlotRange = { dayOfWeek: number; startMinute: number; endMinute: number };

type Suggestion = {
  tutorId: number;
  tutorName: string;
  tutorEmail: string;
  overlappingSlots: SlotRange[];
  tutorSlots: SlotRange[];
};

type AdminTutor = {
  id: number;
  name: string;
  email: string;
  gradeLevel: number | null;
  bio: string | null;
  active: boolean;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minutesToTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h < 12 ? "AM" : "PM";
  return `${h > 12 ? h - 12 : h}:${min.toString().padStart(2, "0")} ${ampm}`;
}

function subjectName(id: string) {
  return SUBJECTS.find((s) => s.id === id)?.name ?? id;
}

function RequestRow({ req }: { req: Request }) {
  const [expanded, setExpanded] = useState(false);
  const [forceMode, setForceMode] = useState(false);
  const qc = useQueryClient();

  const suggestionsQuery = useQuery({
    queryKey: ["admin", "suggestions", req.id],
    queryFn: () =>
      api
        .get<Suggestion[]>(`/admin/requests/${req.id}/suggestions`)
        .then((r) => (r.success ? r.data : [])),
    enabled: expanded,
  });

  const allTutorsQuery = useQuery({
    queryKey: ["admin", "tutors", "all"],
    queryFn: () =>
      api
        .get<AdminTutor[]>("/admin/tutors")
        .then((r) => (r.success ? r.data : [])),
    enabled: expanded && forceMode,
  });

  const matchMutation = useMutation({
    mutationFn: ({
      tutorId,
      override,
    }: {
      tutorId: number;
      override?: boolean;
    }) =>
      api.post("/admin/matches", {
        requestId: req.id,
        tutorId,
        ...(override ? { override: true } : {}),
      }),
    onSuccess: () => {
      setExpanded(false);
      setForceMode(false);
      qc.invalidateQueries({ queryKey: ["admin", "requests"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  const handleForceMatch = (tutorId: number, tutorName: string) => {
    const ok = window.confirm(
      `Force match ${tutorName} with this request?\n\n` +
        `This skips the subject and class-level qualification check ` +
        `and will be recorded in the audit log as an override.`
    );
    if (ok) matchMutation.mutate({ tutorId, override: true });
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    matched: "bg-green-100 text-green-800",
    expired: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{req.tuteeName}</span>
            <span className="text-xs text-gray-400">{req.tuteeEmail}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[req.status] ?? "bg-gray-100 text-gray-600"}`}>
              {req.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            <strong>{subjectName(req.subjectId)}</strong> —{" "}
            {CLASS_LEVEL_LABELS[req.classLevel as keyof typeof CLASS_LEVEL_LABELS] ?? req.classLevel}
            {req.currentGradePct != null && (
              <span className="ml-2 text-gray-400">Current grade: {req.currentGradePct}%</span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{req.needsDescription}</p>
        </div>
        {req.status === "pending" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setExpanded((v) => {
                const next = !v;
                if (!next) setForceMode(false);
                return next;
              });
            }}
          >
            {expanded ? "Close" : "Match"}
          </Button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          {forceMode ? (
            <ForceMatchPanel
              tutors={allTutorsQuery.data}
              isLoading={allTutorsQuery.isLoading}
              isMatching={matchMutation.isPending}
              onCancel={() => setForceMode(false)}
              onSelect={handleForceMatch}
            />
          ) : (
            <>
              {suggestionsQuery.isLoading && (
                <p className="text-sm text-gray-400">Finding tutors…</p>
              )}

              {suggestionsQuery.data && suggestionsQuery.data.length === 0 && (
                <div>
                  <p className="text-sm text-gray-500">
                    No tutors currently qualified for this subject and level. Check the{" "}
                    <Link to="/admin/tutors" className="text-blue-600 underline">
                      Tutors
                    </Link>{" "}
                    page.
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setForceMode(true)}
                    >
                      Select tutor anyway
                    </Button>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Pick any active tutor and force a match, even if they
                      don't cover this subject or level.
                    </p>
                  </div>
                </div>
              )}

              {suggestionsQuery.data && suggestionsQuery.data.length > 0 && (() => {
                const matchingTime = suggestionsQuery.data.filter(
                  (s) => s.overlappingSlots.length > 0
                );
                const noTimeOverlap = suggestionsQuery.data.filter(
                  (s) => s.overlappingSlots.length === 0
                );

                return (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Tutors with matching times
                      <span className="ml-2 text-gray-400 normal-case font-normal">
                        {matchingTime.length}
                      </span>
                    </p>
                    {matchingTime.length === 0 && (
                      <p className="text-sm text-gray-500 mb-3">
                        No tutors are free at the tutee's available times.
                      </p>
                    )}
                    {matchingTime.map((s) => (
                      <SuggestionRow
                        key={s.tutorId}
                        s={s}
                        isMatching={matchMutation.isPending}
                        onMatch={() =>
                          matchMutation.mutate({ tutorId: s.tutorId })
                        }
                      />
                    ))}

                    {noTimeOverlap.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-5">
                          Other tutors for this subject
                          <span className="ml-2 text-gray-400 normal-case font-normal">
                            {noTimeOverlap.length} · no time overlap
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          These tutors teach this subject + level but their hours don't
                          currently line up with the tutee. You can still match them and
                          coordinate a time manually.
                        </p>
                        {noTimeOverlap.map((s) => (
                          <SuggestionRow
                            key={s.tutorId}
                            s={s}
                            isMatching={matchMutation.isPending}
                            onMatch={() =>
                              matchMutation.mutate({ tutorId: s.tutorId })
                            }
                            noOverlap
                          />
                        ))}
                      </>
                    )}

                    <div className="mt-5 pt-4 border-t border-gray-200 flex items-start justify-between gap-3">
                      <p className="text-xs text-gray-500">
                        Need someone outside this list? You can force a match
                        with any active tutor — it'll be flagged as an override
                        in the audit log.
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setForceMode(true)}
                      >
                        Select tutor anyway
                      </Button>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionRow({
  s,
  isMatching,
  onMatch,
  noOverlap = false,
}: {
  s: Suggestion;
  isMatching: boolean;
  onMatch: () => void;
  noOverlap?: boolean;
}) {
  const summary = noOverlap
    ? s.tutorSlots.length === 0
      ? "No availability on file"
      : `Free: ${s.tutorSlots
          .slice(0, 2)
          .map((sl) => `${DAYS[sl.dayOfWeek]} ${minutesToTime(sl.startMinute)}`)
          .join(", ")}${s.tutorSlots.length > 2 ? `, +${s.tutorSlots.length - 2} more` : ""}`
    : `${s.overlappingSlots.length} overlapping slot${s.overlappingSlots.length !== 1 ? "s" : ""} — ${s.overlappingSlots
        .slice(0, 2)
        .map((sl) => `${DAYS[sl.dayOfWeek]} ${minutesToTime(sl.startMinute)}`)
        .join(", ")}${s.overlappingSlots.length > 2 ? `, +${s.overlappingSlots.length - 2} more` : ""}`;

  return (
    <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2 mb-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
          {s.tutorName}
          {noOverlap && (
            <span className="rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5">
              Time mismatch
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 truncate">{summary}</p>
      </div>
      <Button
        size="sm"
        variant={noOverlap ? "secondary" : "primary"}
        loading={isMatching}
        onClick={onMatch}
      >
        Match
      </Button>
    </div>
  );
}

function ForceMatchPanel({
  tutors,
  isLoading,
  isMatching,
  onCancel,
  onSelect,
}: {
  tutors: AdminTutor[] | undefined;
  isLoading: boolean;
  isMatching: boolean;
  onCancel: () => void;
  onSelect: (tutorId: number, tutorName: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (tutors ?? [])
      .filter((t) => t.active)
      .filter(
        (t) =>
          !term ||
          t.name.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tutors, search]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Force match with any tutor
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Bypasses subject and class-level qualification. Recorded as an
            override in the audit log.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-900 shrink-0"
        >
          ← Back
        </button>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tutors by name or email…"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {isLoading && (
        <p className="text-sm text-gray-400">Loading tutors…</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-gray-500">
          {tutors && tutors.length === 0
            ? "No active tutors available."
            : "No active tutors match that search."}
        </p>
      )}

      <div className="max-h-80 overflow-y-auto -mx-1 px-1">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2 mb-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {t.name}
                {t.gradeLevel != null && (
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    Grade {t.gradeLevel}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 truncate">{t.email}</p>
            </div>
            <Button
              size="sm"
              variant="danger"
              loading={isMatching}
              onClick={() => onSelect(t.id, t.name)}
            >
              Force match
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminRequests() {
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "requests", statusFilter],
    queryFn: () =>
      api
        .get<Request[]>(`/admin/requests?status=${statusFilter}`)
        .then((r) => (r.success ? r.data : [])),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopBar title="Requests" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          {["pending", "matched", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === "all" ? "" : s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                (s === "all" ? statusFilter === "" : statusFilter === s)
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}
        {data?.length === 0 && (
          <p className="text-gray-500 text-sm">No requests found.</p>
        )}
        <div className="flex flex-col gap-3">
          {data?.map((req) => <RequestRow key={req.id} req={req} />)}
        </div>
      </div>
    </div>
  );
}
