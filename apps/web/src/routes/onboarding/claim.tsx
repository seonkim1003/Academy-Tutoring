import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { RequireUser } from "../../components/auth/RequireUser";
import { useMe } from "../../components/auth/useMe";

type Candidates = {
  tutor: {
    name: string;
    gradeLevel: number | null;
    bio: string | null;
    createdAt: number;
    subjects: string[];
  } | null;
  tutee: {
    name: string;
    gradeLevel: number | null;
    createdAt: number;
    requestCount: number;
  } | null;
};

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ClaimInner() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useMe();

  const [tutorChoice, setTutorChoice] = useState<"yes" | "no" | null>(null);
  const [tuteeChoice, setTuteeChoice] = useState<"yes" | "no" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["me", "claim-candidates"],
    queryFn: async () => {
      const r = await api.get<Candidates>("/me/claim-candidates");
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (body: { claimTutor?: boolean; claimTutee?: boolean }) =>
      api.post("/me/claim", body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      navigate("/dashboard", { replace: true });
    },
  });

  const startFresh = () => {
    // User wants to ignore the existing records and start a brand new profile.
    // We don't claim either candidate; the onboarding flow handles row reuse
    // (and overwrites the orphan with the fresh data) on submit.
    navigate("/onboarding/role");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  // No candidates? Should not happen given pendingClaim flag, but guard anyway.
  if (!data?.tutor && !data?.tutee) {
    navigate("/onboarding/role", { replace: true });
    return null;
  }

  const tutorNeedsAnswer = !!data?.tutor;
  const tuteeNeedsAnswer = !!data?.tutee;
  const ready =
    (!tutorNeedsAnswer || tutorChoice !== null) &&
    (!tuteeNeedsAnswer || tuteeChoice !== null);

  const submit = () => {
    mutation.mutate({
      claimTutor: tutorChoice === "yes",
      claimTutee: tuteeChoice === "yes",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Is this you?
        </h1>
        <p className="text-gray-600 mb-8">
          We found existing data under{" "}
          <strong className="text-gray-900">{me?.user.email}</strong>. Confirm
          which records belong to you.
        </p>

        <div className="flex flex-col gap-4">
          {data?.tutor && (
            <Candidate
              title="Tutor profile"
              choice={tutorChoice}
              onChoose={setTutorChoice}
            >
              <p>
                <span className="font-medium">{data.tutor.name}</span>
                {data.tutor.gradeLevel != null && (
                  <span className="text-gray-500"> — Grade {data.tutor.gradeLevel}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted {formatDate(data.tutor.createdAt)}
              </p>
              {data.tutor.subjects.length > 0 && (
                <p className="text-sm text-gray-700 mt-2">
                  Subjects: {data.tutor.subjects.join(", ")}
                </p>
              )}
              {data.tutor.bio && (
                <p className="text-sm text-gray-500 italic mt-1">
                  "{data.tutor.bio}"
                </p>
              )}
            </Candidate>
          )}

          {data?.tutee && (
            <Candidate
              title="Tutee profile"
              choice={tuteeChoice}
              onChoose={setTuteeChoice}
            >
              <p>
                <span className="font-medium">{data.tutee.name}</span>
                {data.tutee.gradeLevel != null && (
                  <span className="text-gray-500"> — Grade {data.tutee.gradeLevel}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted {formatDate(data.tutee.createdAt)}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {data.tutee.requestCount} open request
                {data.tutee.requestCount !== 1 ? "s" : ""}
              </p>
            </Candidate>
          )}
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button
            variant="secondary"
            onClick={startFresh}
            disabled={mutation.isPending}
          >
            Create new profile
          </Button>
          <Button
            onClick={submit}
            loading={mutation.isPending}
            disabled={!ready}
          >
            Continue
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-500 text-center sm:text-left">
          None of these are you? Use <span className="font-medium">Create new profile</span> to start fresh.
        </p>
      </div>
    </div>
  );
}

function Candidate({
  title,
  choice,
  onChoose,
  children,
}: {
  title: string;
  choice: "yes" | "no" | null;
  onChoose: (c: "yes" | "no") => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
        {title}
      </h2>
      <div className="text-gray-800">{children}</div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => onChoose("yes")}
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${
            choice === "yes"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Yes, that's me
        </button>
        <button
          type="button"
          onClick={() => onChoose("no")}
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${
            choice === "no"
              ? "border-gray-700 bg-gray-100 text-gray-900"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Not mine
        </button>
      </div>
    </div>
  );
}

export function OnboardingClaim() {
  return (
    <RequireUser allowPendingClaim>
      <ClaimInner />
    </RequireUser>
  );
}
