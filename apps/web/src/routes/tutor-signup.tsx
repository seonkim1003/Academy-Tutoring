import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  tutorSignupSchema,
  type TutorSignupInput,
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

const classLevelOptions = CLASS_LEVELS.map((l) => ({
  value: l,
  label: CLASS_LEVEL_LABELS[l],
}));

const gradeLevelOptions = GRADE_LEVELS.map((g) => ({
  value: g,
  label: `Grade ${g}`,
}));

const subjectsByCategory = SUBJECTS.reduce<Record<string, typeof SUBJECTS[number][]>>(
  (acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  },
  {}
);

export function TutorSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [availability, setAvailability] = useState<TutorSignupInput["availability"]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<
    TutorSignupInput["subjects"]
  >([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TutorSignupInput>({
    resolver: zodResolver(tutorSignupSchema),
    defaultValues: { subjects: [], availability: [] },
  });

  const mutation = useMutation({
    mutationFn: (data: TutorSignupInput) => api.post("/tutors", data),
    onSuccess: (res) => {
      if (res.success) setSubmitted(true);
      else setError("root", { message: res.error });
    },
    onError: () =>
      setError("root", { message: "Something went wrong. Please try again." }),
  });

  const toggleSubject = (subjectId: string) => {
    const exists = selectedSubjects.find((s) => s.subjectId === subjectId);
    if (exists) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.subjectId !== subjectId));
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

  const onSubmit = (data: TutorSignupInput) => {
    mutation.mutate({ ...data, subjects: selectedSubjects, availability });
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're signed up!</h2>
        <p className="text-gray-600">
          Thanks for joining the tutoring program. We'll email you at your school
          address when a student is matched with you.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Become a Tutor</h1>
      <p className="text-gray-500 text-sm mb-8">
        Sign up to help fellow students — takes about 2 minutes. No account needed.
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

        {/* Subject selector */}
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
                      {selected && (
                        <select
                          value={selected.maxLevel}
                          onChange={(e) =>
                            setMaxLevel(
                              s.id,
                              e.target.value as TutorSignupInput["subjects"][number]["maxLevel"]
                            )
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-xs bg-white"
                        >
                          {CLASS_LEVELS.map((l) => (
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

        <Button type="submit" size="lg" loading={mutation.isPending} className="mt-2">
          Sign Up to Tutor
        </Button>
      </form>
    </div>
  );
}
