import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { AdminTopBar } from "../../components/admin/AdminTopBar";
import { Button } from "../../components/ui/Button";

type Match = {
  id: number;
  status: string;
  proposedDayOfWeek: number | null;
  proposedStartMinute: number | null;
  proposedEndMinute: number | null;
  createdAt: number;
  respondedAt: number | null;
  tutorName: string | null;
  tutorEmail: string | null;
  requestId: number;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function minutesToTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h < 12 ? "AM" : "PM";
  return `${h > 12 ? h - 12 : h}:${min.toString().padStart(2, "0")} ${ampm}`;
}

const statusColor: Record<string, string> = {
  proposed: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-700",
};

export function AdminMatches() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "matches"],
    queryFn: () =>
      api.get<Match[]>("/admin/matches").then((r) => (r.success ? r.data : [])),
  });

  const cancelMatch = useMutation({
    mutationFn: (id: number) => api.post(`/admin/matches/${id}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "matches"] });
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopBar title="Matches" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}
        {data?.length === 0 && (
          <p className="text-gray-500 text-sm">No matches yet. Go to Requests to create one.</p>
        )}
        <div className="flex flex-col gap-3">
          {data?.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{m.tutorName}</span>
                    <span className="text-xs text-gray-400">{m.tutorEmail}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[m.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Request #{m.requestId}
                    {m.proposedDayOfWeek != null && m.proposedStartMinute != null && (
                      <> — {DAYS[m.proposedDayOfWeek]} {minutesToTime(m.proposedStartMinute)}</>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {new Date(m.createdAt * 1000).toLocaleDateString()}
                    {m.respondedAt && (
                      <> · Responded {new Date(m.respondedAt * 1000).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                {["proposed", "accepted"].includes(m.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={cancelMatch.isPending}
                    onClick={() => cancelMatch.mutate(m.id)}
                    className="text-red-600 hover:text-red-700 shrink-0"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
