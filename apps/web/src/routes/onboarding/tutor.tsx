import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { TutorSignupInput } from "@academy/shared";
import { api } from "../../lib/api";
import { TutorProfileForm } from "../../components/forms/TutorProfileForm";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";

function OnboardingTutorInner() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: TutorSignupInput) => api.post("/me/tutor", data),
    onSuccess: async (res) => {
      if (!res.success) throw new Error(res.error);
      await qc.invalidateQueries({ queryKey: ["me"] });
      navigate("/dashboard/tutor", { replace: true });
    },
  });

  if (!me) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Become a Tutor</h1>
      <p className="text-gray-500 text-sm mb-8">
        Tell us what you can teach and when you're free.
      </p>
      <TutorProfileForm
        defaultValues={{ name: me.user.name, email: me.user.email }}
        submitLabel="Sign Up to Tutor"
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

export function OnboardingTutor() {
  return (
    <RequireUser>
      <OnboardingTutorInner />
    </RequireUser>
  );
}
