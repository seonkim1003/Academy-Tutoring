import { z } from "zod";
import { CLASS_LEVELS, SUBJECT_IDS, GRADE_LEVELS } from "./constants";

// Reusable building blocks

const schoolEmail = (domain?: string) =>
  z
    .string()
    .email("Must be a valid email address")
    .refine(
      (email) => (domain ? email.endsWith(`@${domain}`) : true),
      { message: "Must be a school email address" }
    );

const gradePercent = z
  .number()
  .min(0, "Grade must be at least 0")
  .max(100, "Grade must be at most 100")
  .optional();

const availabilitySlot = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
});

// ── Tutee request form ────────────────────────────────────────────────────────

export const tuteeRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: schoolEmail(),
  gradeLevel: z.coerce.number().refine((v): v is (typeof GRADE_LEVELS)[number] =>
    (GRADE_LEVELS as readonly number[]).includes(v), { message: "Invalid grade level" }),
  subjectId: z.enum(SUBJECT_IDS as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a subject" }),
  }),
  classLevel: z.enum(CLASS_LEVELS, {
    errorMap: () => ({ message: "Please select a class level" }),
  }),
  currentGradePct: gradePercent,
  needsDescription: z
    .string()
    .min(10, "Please describe what you need help with (at least 10 characters)")
    .max(1000),
  availability: z
    .array(availabilitySlot)
    .min(1, "Please select at least one availability window"),
});

export type TuteeRequestInput = z.infer<typeof tuteeRequestSchema>;

// ── Tutor signup form ─────────────────────────────────────────────────────────

const tutorSubject = z.object({
  subjectId: z.enum(SUBJECT_IDS as [string, ...string[]]),
  maxLevel: z.enum(CLASS_LEVELS),
});

export const tutorSignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: schoolEmail(),
  gradeLevel: z.coerce.number().refine((v): v is (typeof GRADE_LEVELS)[number] =>
    (GRADE_LEVELS as readonly number[]).includes(v), { message: "Invalid grade level" }),
  bio: z.string().max(500).optional(),
  phone: z.string().trim().max(30).optional(),
  subjects: z
    .array(tutorSubject)
    .min(1, "Please select at least one subject you can tutor"),
  availability: z
    .array(availabilitySlot)
    .min(1, "Please select at least one availability window"),
});

export type TutorSignupInput = z.infer<typeof tutorSignupSchema>;

// ── Admin login ───────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email("Must be a valid email address"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// ── Post-session feedback form ────────────────────────────────────────────────

const rating = z.number().int().min(1).max(5);

export const feedbackSchema = z.object({
  helpfulness: rating,
  comfort: rating,
  satisfaction: rating,
  updatedGradePct: gradePercent,
  comments: z.string().max(1000).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// ── Session log form (tutor) ──────────────────────────────────────────────────

export const sessionLogSchema = z.object({
  topicsCovered: z
    .string()
    .min(5, "Please describe the topics covered")
    .max(1000),
  notes: z.string().max(1000).optional(),
});

export type SessionLogInput = z.infer<typeof sessionLogSchema>;

// ── Shared types (API responses) ──────────────────────────────────────────────

export type ApiSuccess<T = void> = T extends void
  ? { success: true }
  : { success: true; data: T };

export type ApiError = {
  success: false;
  error: string;
  issues?: { field: string; message: string }[];
};

export type ApiResponse<T = void> = ApiSuccess<T> | ApiError;
