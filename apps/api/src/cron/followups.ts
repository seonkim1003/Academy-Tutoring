// Phase 2: follow up on stale proposed matches (no response after 48h)
// Triggered daily at 2pm UTC via wrangler.toml cron trigger.
export async function handleFollowups(_env: unknown): Promise<void> {
  // TODO Phase 2: query matches in 'proposed' status older than 48h,
  // send follow-up emails to tutor, optionally alert admin.
  console.log("Follow-ups cron fired — not yet implemented (Phase 2)");
}
