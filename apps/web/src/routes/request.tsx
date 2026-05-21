import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  tuteeRequestSchema,
  type TuteeRequestInput,
  SUBJECTS,
  CLASS_LEVEL_LABELS,
  CLASS_LEVELS,
  GRADE_LEVELS,
} from "@academy/shared";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { AvailabilityPicker } from "../components/forms/AvailabilityPicker";
import { api } from "../lib/api";

// Group subjects by category for the dropdown
const subjectOptions = SUBJECTS.map((s) => ({
  value: s.id,
  label: `${s.name} (${s.category})`,
}));

const classLevelOptions = CLASS_LEVELS.map((l) => ({
  value: l,
  label: CLASS_LEVEL_LABELS[l],
}));

const gradeLevelOptions = GRADE_LEVELS.map((g) => ({
  value: g,
  label: `Grade ${g}`,
}));

export function RequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [availability, setAvailability] = useState<
    TuteeRequestInput["availability"]
  >([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TuteeRequestInput>({
    resolver: zodResolver(tuteeRequestSchema),
    defaultValues: { availability: [] },
  });

  const mutation = useMutation({
    mutationFn: (data: TuteeRequestInput) => api.post("/requests", data),
    onSuccess: (res) => {
      if (res.success) {
        setSubmitted(true);
      } else {
        setError("root", { message: res.error });
      }
    },
    onError: () => {
      setError("root", { message: "Something went wrong. Please try again." });
    },
  });

  const onSubmit = (data: TuteeRequestInput) => {
    if (availability.length === 0) return;
    mutation.mutate({ ...data, availability });
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request submitted!</h2>
        <p className="text-gray-600">
          We'll match you with a tutor and reach out to your school email once a
          match is confirmed. This usually takes a few days.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Request a Tutor</h1>
      <p className="text-gray-500 text-sm mb-8">
        Fill this out and we'll match you with a peer tutor. No account needed.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Your name"
          required
          placeholder="First and last name"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="School email"
          type="email"
          required
          placeholder="you@yourschool.org"
          hint="We'll contact you here when a match is found."
          error={errors.email?.message}
          {...register("email")}
        />

        <Select
          label="Your grade"
          required
          placeholder="Select your grade"
          options={gradeLevelOptions}
          error={errors.gradeLevel?.message}
          {...register("gradeLevel")}
        />

        <Select
          label="Subject"
          required
          placeholder="Select a subject"
          options={subjectOptions}
          error={errors.subjectId?.message}
          {...register("subjectId")}
        />

        <Select
          label="Class level"
          required
          placeholder="Select level"
          options={classLevelOptions}
          error={errors.classLevel?.message}
          {...register("classLevel")}
        />

        <Input
          label="Current grade (%)"
          type="number"
          min={0}
          max={100}
          step={0.1}
          placeholder="e.g. 74"
          hint="Optional — helps us track improvement over time."
          error={errors.currentGradePct?.message}
          {...register("currentGradePct", { valueAsNumber: true })}
        />

        <Textarea
          label="What do you need help with?"
          required
          placeholder="e.g. I'm struggling with integration by parts and related rates problems..."
          hint="Be specific — this helps us find the best match."
          error={errors.needsDescription?.message}
          {...register("needsDescription")}
        />

        <AvailabilityPicker
          value={availability}
          onChange={setAvailability}
          error={
            availability.length === 0 && errors.availability
              ? "Please select at least one availability window"
              : undefined
          }
        />

        {errors.root && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          loading={mutation.isPending}
          className="mt-2"
        >
          Submit Request
        </Button>
      </form>
    </div>
  );
}
