import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { TuteeRequestInput } from "@academy/shared";
import { api } from "../../lib/api";
import { RequestForm } from "../../components/forms/RequestForm";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";

function OnboardingRequestInner() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: TuteeRequestInput) => api.post("/me/tutee/request", data),
    onSuccess: async (res) => {
      if (!res.success) throw new Error(res.error);
      await qc.invalidateQueries({ queryKey: ["me"] });
      navigate("/dashboard/tutee", { replace: true });
    },
  });

  if (!me) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Request a Tutor</h1>
      <p className="text-gray-500 text-sm mb-8">
        Fill this out and we'll match you with a peer tutor.
      </p>
      <RequestForm
        defaultValues={{ name: me.user.name, email: me.user.email }}
        submitLabel="Submit Request"
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

export function OnboardingRequest() {
  return (
    <RequireUser>
      <OnboardingRequestInner />
    </RequireUser>
  );
}
