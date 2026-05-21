import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { AdminTopBar } from "../../components/admin/AdminTopBar";

type Overview = {
  pendingRequests: number;
  activeTutors: number;
  totalMatches: number;
  acceptedMatches: number;
};

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () =>
      api.get<Overview>("/admin/analytics/overview").then((r) =>
        r.success ? r.data : Promise.reject(r.error)
      ),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-2">Session expired or not logged in.</p>
          <a href="/admin/login" className="text-blue-600 text-sm underline">
            Log in again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopBar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Overview</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Pending requests" value={data?.pendingRequests ?? 0} />
          <StatCard label="Active tutors" value={data?.activeTutors ?? 0} />
          <StatCard label="Total matches" value={data?.totalMatches ?? 0} />
          <StatCard
            label="Accepted matches"
            value={data?.acceptedMatches ?? 0}
            sub={
              data?.totalMatches
                ? `${Math.round((data.acceptedMatches / data.totalMatches) * 100)}% acceptance`
                : undefined
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/requests"
            className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Manage Requests</h2>
            <p className="text-sm text-gray-500">
              View pending tutoring requests and create matches.
            </p>
          </Link>
          <Link
            to="/admin/tutors"
            className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Manage Tutors</h2>
            <p className="text-sm text-gray-500">
              View all tutors, their subjects, and toggle their active status.
            </p>
          </Link>
          <Link
            to="/admin/matches"
            className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Manage Matches</h2>
            <p className="text-sm text-gray-500">
              Track all proposed and confirmed tutoring matches.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
