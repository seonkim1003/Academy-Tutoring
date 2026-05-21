import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tutorSignupSchema,
  type TutorSignupInput,
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

const gradeLevelOptions = GRADE_LEVELS.map((g) => ({
  value: g,
  label: `Grade ${g}`,
}));

const subjectsByCategory = SUBJECTS.reduce<
  Record<string, (typeof SUBJECTS)[number][]>
>((acc, s) => {
  if (!acc[s.category]) acc[s.category] = [];
  acc[s.category].push(s);
  return acc;
}, {});

type Props = {
  defaultValues: Partial<TutorSignupInput> & { email: string };
  submitLabel: string;
  onSubmit: (data: TutorSignupInput) => Promise<void> | void;
  pending?: boolean;
  error?: string;
  emailReadOnly?: boolean;
};

export function TutorProfileForm({
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
  } = useForm<TutorSignupInput>({
    resolver: zodResolver(tutorSignupSchema),
    defaultValues: {
      subjects: [],
      availability: [],
      ...defaultValues,
    },
  });

  const availability = watch("availability");
  const selectedSubjects = watch("subjects");
  const setAvailability = (val: TutorSignupInput["availability"]) =>
    setValue("availability", val, { shouldValidate: true });
  const setSelectedSubjects = (val: TutorSignupInput["subjects"]) =>
    setValue("subjects", val, { shouldValidate: true });

  const toggleSubject = (subjectId: string) => {
    const exists = selectedSubjects.find((s) => s.subjectId === subjectId);
    if (exists) {
      setSelectedSubjects(
        selectedSubjects.filter((s) => s.subjectId !== subjectId)
      );
    } else {
      setSelectedSubjects([
        ...selectedSubjects,
        { subjectId, maxLevel: "regular" },
      ]);
    }
  };

  const setMaxLevel = (
    subjectId: string,
    maxLevel: TutorSignupInput["subjects"][number]["maxLevel"]
  ) => {
    setSelectedSubjects(
      selectedSubjects.map((s) =>
        s.subjectId === subjectId ? { ...s, maxLevel } : s
      )
    );
  };

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
            : undefined
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

      <Textarea
        label="Short bio (optional)"
        placeholder="e.g. I'm a junior who loves math and took AP Calc BC last year..."
        hint="Helps tutees know who they're working with."
        {...register("bio")}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Subjects you can tutor <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500">
          Select subjects and set the highest level you're comfortable teaching.
        </p>
        {Object.entries(subjectsByCategory).map(([category, subs]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-1">
              {category}
            </p>
            <div className="flex flex-col gap-1.5">
              {subs.map((s) => {
                const selected = selectedSubjects.find(
                  (sel) => sel.subjectId === s.id
                );
                const levelOptions = getSubjectLevelOptions(s.id);
                const showLevel = selected && levelOptions.length > 1;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={`flex-1 text-left rounded-md border px-3 py-1.5 text-sm transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      {s.name}
                    </button>
                    {showLevel && (
                      <select
                        value={selected!.maxLevel}
                        onChange={(e) =>
                          setMaxLevel(
                            s.id,
                            e.target
                              .value as TutorSignupInput["subjects"][number]["maxLevel"]
                          )
                        }
                        className="rounded border border-gray-300 px-2 py-1 text-xs bg-white"
                      >
                        {levelOptions.map((l) => (
                          <option key={l} value={l}>
                            up to {CLASS_LEVEL_LABELS[l]}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {errors.subjects && (
          <p className="text-xs text-red-600">{errors.subjects.message}</p>
        )}
      </div>

      <AvailabilityPicker
        value={availability ?? []}
        onChange={setAvailability}
        error={
          (availability?.length ?? 0) === 0 && errors.availability
            ? "Please select at least one availability window"
            : undefined
        }
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
