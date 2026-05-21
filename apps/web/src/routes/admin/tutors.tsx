import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";

type Tutor = {
  id: number;
  name: string;
  email: string;
  gradeLevel: number | null;
  bio: string | null;
  active: boolean;
  createdAt: number;
};

export function AdminTutors() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tutors"],
    queryFn: () =>
      api.get<Tutor[]>("/admin/tutors").then((r) => (r.success ? r.data : [])),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.patch(`/admin/tutors/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tutors"] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Dashboard
          </Link>
          <span className="font-semibold text-gray-900">Tutors</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}
        {data?.length === 0 && (
          <p className="text-gray-500 text-sm">No tutors have signed up yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {data?.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{tutor.name}</span>
                  {tutor.gradeLevel && (
                    <span className="text-xs text-gray-400">Grade {tutor.gradeLevel}</span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      tutor.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tutor.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{tutor.email}</p>
                {tutor.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tutor.bio}</p>
                )}
              </div>
              <Button
                size="sm"
                variant={tutor.active ? "secondary" : "primary"}
                loading={toggleMutation.isPending}
                onClick={() =>
                  toggleMutation.mutate({ id: tutor.id, active: !tutor.active })
                }
              >
                {tutor.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
