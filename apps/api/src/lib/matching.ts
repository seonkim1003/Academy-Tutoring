import { eq, and, inArray } from "drizzle-orm";
import {
  tutors,
  tutorSubjects,
  tutorAvailability,
  requestAvailability,
} from "../schema";
import type { AppDb } from "../types";

type OverlapSlot = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
};

type TutorSuggestion = {
  tutorId: number;
  tutorName: string;
  tutorEmail: string;
  overlappingSlots: OverlapSlot[];
};

/**
 * Find active tutors who can cover the given subject+level and have at least
 * one availability window overlapping the request's availability.
 *
 * Returns suggestions sorted by overlap count (most compatible first).
 * Used in the admin dashboard for manual matching (Phase 1).
 * Phase 3 will call this same function from the auto-matcher.
 */
export async function findMatchingSuggestions(
  db: AppDb,
  requestId: number,
  subjectId: string,
  classLevel: "regular" | "honors" | "ap"
): Promise<TutorSuggestion[]> {
  const levelRank = { regular: 0, honors: 1, ap: 2 } as const;
  const requiredRank = levelRank[classLevel];

  // Tutors who teach this subject at or above the required level
  const eligibleTutorIds = await db
    .select({ tutorId: tutorSubjects.tutorId })
    .from(tutorSubjects)
    .where(eq(tutorSubjects.subjectId, subjectId));

  const qualified = eligibleTutorIds.filter(({ tutorId: _ }) => true); // filtered below
  if (qualified.length === 0) return [];

  const tutorIds = qualified.map((r) => r.tutorId);

  // Only active tutors
  const activeTutors = await db
    .select({ id: tutors.id, name: tutors.name, email: tutors.email })
    .from(tutors)
    .where(and(eq(tutors.active, true), inArray(tutors.id, tutorIds)));

  if (activeTutors.length === 0) return [];

  const activeTutorIds = activeTutors.map((t) => t.id);

  // Filter by max level — only tutors who can handle the requested level
  const levelCapable = await db
    .select({ tutorId: tutorSubjects.tutorId, maxLevel: tutorSubjects.maxLevel })
    .from(tutorSubjects)
    .where(
      and(
        eq(tutorSubjects.subjectId, subjectId),
        inArray(tutorSubjects.tutorId, activeTutorIds)
      )
    );

  const capableIds = levelCapable
    .filter((r) => levelRank[r.maxLevel] >= requiredRank)
    .map((r) => r.tutorId);

  if (capableIds.length === 0) return [];

  // Fetch availability for qualified tutors and the request
  const [tutorSlots, requestSlots] = await Promise.all([
    db
      .select()
      .from(tutorAvailability)
      .where(inArray(tutorAvailability.tutorId, capableIds)),
    db
      .select()
      .from(requestAvailability)
      .where(eq(requestAvailability.requestId, requestId)),
  ]);

  const tutorMap = new Map(activeTutors.map((t) => [t.id, t]));

  const suggestions: TutorSuggestion[] = [];

  for (const tutorId of capableIds) {
    const tSlots = tutorSlots.filter((s) => s.tutorId === tutorId);
    const overlapping: OverlapSlot[] = [];

    for (const ts of tSlots) {
      for (const rs of requestSlots) {
        if (ts.dayOfWeek !== rs.dayOfWeek) continue;
        const start = Math.max(ts.startMinute, rs.startMinute);
        const end = Math.min(ts.endMinute, rs.endMinute);
        if (end - start >= 30) {
          // at least 30 min of overlap
          overlapping.push({ dayOfWeek: ts.dayOfWeek, startMinute: start, endMinute: end });
        }
      }
    }

    if (overlapping.length > 0) {
      const tutor = tutorMap.get(tutorId)!;
      suggestions.push({
        tutorId,
        tutorName: tutor.name,
        tutorEmail: tutor.email,
        overlappingSlots: overlapping,
      });
    }
  }

  // Sort by number of overlapping slots (most flexible tutor first)
  suggestions.sort((a, b) => b.overlappingSlots.length - a.overlappingSlots.length);

  return suggestions;
}
