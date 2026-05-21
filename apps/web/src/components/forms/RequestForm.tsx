import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tuteeRequestSchema,
  type TuteeRequestInput,
  SUBJECTS,
  CLASS_LEVEL_LABELS,
  GRADE_LEVELS,
  getSubjectLevelOptions,
} from "@academy/shared";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { AvailabilityPicker } from "./AvailabilityPicker";

const subjectOptions = SUBJECTS.map((s) => ({
  value: s.id,
  label: `${s.name} (${s.category})`,
}));

const gradeLevelOptions = GRADE_LEVELS.map((g) => ({
  value: g,
  label: `Grade ${g}`,
}));

type Props = {
  defaultValues: Partial<TuteeRequestInput> & { email: string };
  submitLabel: string;
  onSubmit: (data: TuteeRequestInput) => Promise<void> | void;
  pending?: boolean;
  error?: string;
  emailReadOnly?: boolean;
};

export function RequestForm({
  defaultValues,
  submitLabel,
  onSubmit,
  pending,
  error,
  emailReadOnly = true,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TuteeRequestInput>({
    resolver: zodResolver(tuteeRequestSchema),
    defaultValues: {
      availability: [],
      ...defaultValues,
    },
  });

  const availability = watch("availability");
  const subjectId = watch("subjectId");
  const classLevel = watch("classLevel");
  const setAvailability = (val: TuteeRequestInput["availability"]) =>
    setValue("availability", val, { shouldValidate: true });

  const levelOptions = subjectId ? getSubjectLevelOptions(subjectId) : [];
  const showLevel = levelOptions.length > 1;

  // Whenever the subject changes, reconcile classLevel:
  //  - if subject has a single level (or none selected yet), force "regular"
  //  - if the previously chosen level is no longer valid for this subject,
  //    fall back to the first available option.
  useEffect(() => {
    if (!subjectId) return;
    if (levelOptions.length <= 1) {
      if (classLevel !== "regular") {
        setValue("classLevel", "regular", { shouldValidate: true });
      }
      return;
    }
    if (!classLevel || !levelOptions.includes(classLevel)) {
      setValue("classLevel", levelOptions[0], { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="flex flex-col gap-5"
    >
      <Input
        label="Your name"
        required
        placeholder="First and last name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Email"
        type="email"
        required
        readOnly={emailReadOnly}
        className={emailReadOnly ? "bg-gray-50 text-gray-500" : undefined}
        hint={
          emailReadOnly
            ? "From your signed-in Google account."
            : "We'll contact you here when a match is found."
        }
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

      {showLevel && (
        <Select
          label="Class level"
          required
          placeholder="Select level"
          options={levelOptions.map((l) => ({
            value: l,
            label: CLASS_LEVEL_LABELS[l],
          }))}
          error={errors.classLevel?.message}
          {...register("classLevel")}
        />
      )}

      <Input
        label="Current grade (%)"
        type="number"
        min={0}
        max={100}
        step={0.1}
        placeholder="e.g. 74"
        hint="Optional — helps us track improvement over time."
        error={errors.currentGradePct?.message}
        {...register("currentGradePct", {
          setValueAs: (v) =>
            v === "" || v == null || Number.isNaN(v) ? undefined : Number(v),
        })}
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
        value={availability ?? []}
        onChange={setAvailability}
        error={errors.availability?.message as string | undefined}
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={pending} className="mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
