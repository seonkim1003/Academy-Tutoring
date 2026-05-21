// Edit this file to update the dropdowns and options shown on all forms.

export const SUBJECTS = [
  // Math
  { id: "algebra-1", name: "Algebra I", category: "Math" },
  { id: "algebra-2", name: "Algebra II", category: "Math" },
  { id: "geometry", name: "Geometry", category: "Math" },
  { id: "precalculus", name: "Pre-Calculus", category: "Math" },
  { id: "calculus", name: "Calculus (AB/BC)", category: "Math" },
  { id: "statistics", name: "Statistics", category: "Math" },
  // Science
  { id: "biology", name: "Biology", category: "Science" },
  { id: "chemistry", name: "Chemistry", category: "Science" },
  { id: "physics", name: "Physics", category: "Science" },
  { id: "environmental-science", name: "Environmental Science", category: "Science" },
  // English
  { id: "english-9", name: "English 9", category: "English" },
  { id: "english-10", name: "English 10", category: "English" },
  { id: "english-11", name: "English 11", category: "English" },
  { id: "english-12", name: "English 12", category: "English" },
  { id: "ap-lang", name: "AP Language & Composition", category: "English" },
  { id: "ap-lit", name: "AP Literature & Composition", category: "English" },
  // History
  { id: "world-history", name: "World History", category: "History" },
  { id: "us-history", name: "US History", category: "History" },
  { id: "ap-world", name: "AP World History", category: "History" },
  { id: "ap-us-history", name: "AP US History", category: "History" },
  { id: "ap-gov", name: "AP Government", category: "History" },
  // Language
  { id: "spanish", name: "Spanish", category: "Language" },
  { id: "french", name: "French", category: "Language" },
  { id: "mandarin", name: "Mandarin", category: "Language" },
  // Other
  { id: "computer-science", name: "Computer Science", category: "Other" },
  { id: "economics", name: "Economics", category: "Other" },
] as const;

export const SUBJECT_IDS = SUBJECTS.map((s) => s.id) as [string, ...string[]];

export const CLASS_LEVELS = ["regular", "honors", "ap"] as const;
export type ClassLevel = (typeof CLASS_LEVELS)[number];

export const CLASS_LEVEL_LABELS: Record<ClassLevel, string> = {
  regular: "Regular",
  honors: "Honors",
  ap: "AP / Advanced",
};

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const;

// Availability slots shown in the form — 30-minute increments, 7am–9pm
export const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const totalMinutes = 420 + i * 30; // start at 7:00 AM (420 min)
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours < 12 ? "AM" : "PM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const label = `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  return { value: totalMinutes, label };
});

export const GRADE_LEVELS = [9, 10, 11, 12] as const;
export type GradeLevel = (typeof GRADE_LEVELS)[number];
