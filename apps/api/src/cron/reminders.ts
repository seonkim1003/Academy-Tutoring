// Phase 2: send next-day session reminders
// Triggered daily at 1pm UTC via wrangler.toml cron trigger.
export async function handleReminders(_env: unknown): Promise<void> {
  // TODO Phase 2: query sessions scheduled for tomorrow that haven't been reminded,
  // send reminder emails, update reminder_sent_at.
  console.log("Reminders cron fired — not yet implemented (Phase 2)");
}
