export const MAX_GMAIL_MESSAGES_PER_SYNC = 75;
const scanCooldownMs = 60_000;

export function remainingScanCooldown(lastScanAt: number, now: number): number {
  if (lastScanAt <= 0) return 0;
  return Math.max(0, scanCooldownMs - (now - lastScanAt));
}
