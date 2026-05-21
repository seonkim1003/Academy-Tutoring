import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { TutorSignupInput, ClassLevel } from "@academy/shared";
import { api } from "../../../lib/api";
import { TutorProfileForm } from "../../../components/forms/TutorProfileForm";
import { RequireUser } from "../../../components/auth/RequireUser";
import { useMe } from "../../../components/auth/useMe";

type TutorData = {
  tutor: {
    id: number;
    name: string;
    email: string;
    gradeLevel: number | null;
    bio: string | null;
  };
  subjects: { subjectId: string; maxLevel: ClassLevel }[];
  availability: {
    dayOfWeek: number;
    startMinute: number;
    endMinute: number;
  }[];
};

function TutorEditInner() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["me", "tutor"],
    queryFn: async () => {
      const r = await api.get<TutorData>("/me/tutor");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (body: TutorSignupInput) => api.patch("/me/tutor", body),
    onSuccess: async (res) => {
      if (!res.success) throw new Error(res.error);
      await qc.invalidateQueries({ queryKey: ["me", "tutor"] });
      navigate("/dashboard/tutor", { replace: true });
    },
  });

  if (isLoading || !data || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit profile</h1>
      <p className="text-gray-500 text-sm mb-8">
        Update your subjects, availability, or bio.
      </p>
      <TutorProfileForm
        defaultValues={{
          name: data.tutor.name,
          email: data.tutor.email,
          gradeLevel: (data.tutor.gradeLevel ?? undefined) as TutorSignupInput["gradeLevel"],
          bio: data.tutor.bio ?? undefined,
          subjects: data.subjects,
          availability: data.availability,
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

export function TutorEdit() {
  return (
    <RequireUser>
      <TutorEditInner />
    </RequireUser>
  );
}
