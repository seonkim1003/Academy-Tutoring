import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import type { TuteeRequestInput, ClassLevel } from "@academy/shared";
import { api } from "../../../lib/api";
import { RequestForm } from "../../../components/forms/RequestForm";
import { RequireUser } from "../../../components/auth/RequireUser";
import { useMe } from "../../../components/auth/useMe";

type TuteeData = {
  tutee: {
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
    };
    availability: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
    }[];
  }[];
};

function TuteeEditInner() {
  const { id } = useParams();
  const requestId = Number(id);
  const { data: me } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["me", "tutee"],
    queryFn: async () => {
      const r = await api.get<TuteeData>("/me/tutee");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (body: TuteeRequestInput) =>
      api.patch(`/me/tutee/request/${requestId}`, body),
    onSuccess: async (res) => {
      if (!res.success) throw new Error(res.error);
      await qc.invalidateQueries({ queryKey: ["me", "tutee"] });
      navigate("/dashboard/tutee", { replace: true });
    },
  });

  if (isLoading || !data || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  const item = data.requests.find((r) => r.request.id === requestId);
  if (!item) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-700">Request not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit request</h1>
      <p className="text-gray-500 text-sm mb-8">
        Update the subject, schedule, or description.
      </p>
      <RequestForm
        defaultValues={{
          name: data.tutee.name,
          email: data.tutee.email,
          gradeLevel: (data.tutee.gradeLevel ?? undefined) as TuteeRequestInput["gradeLevel"],
          subjectId: item.request.subjectId as TuteeRequestInput["subjectId"],
          classLevel: item.request.classLevel,
          currentGradePct: item.request.currentGradePct ?? undefined,
          needsDescription: item.request.needsDescription,
          availability: item.availability,
        }}
        submitLabel="Save changes"
        pending={mutation.isPending}
        error={
          mutation.isError
            ? "Something went wrong. Please try again."
            : mutation.data && !mutation.data.success
              ? mutation.data.error
              : undefined
        }
        onSubmit={(d) => mutation.mutate(d)}
      />
    </div>
  );
}

export function TuteeEdit() {
  return (
    <RequireUser>
      <TuteeEditInner />
    </RequireUser>
  );
}
