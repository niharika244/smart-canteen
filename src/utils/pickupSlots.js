const STEP_MINUTES = 15;
const SLOT_COUNT = 6;

// Pickup slots start AFTER the earliest realistic ready time, so we never promise an impossible time.
export function getPickupSlots(nowMs, earliestMins) {
  const stepMs = STEP_MINUTES * 60000;
  const first = Math.ceil((nowMs + earliestMins * 60000) / stepMs) * stepMs;
  return Array.from({ length: SLOT_COUNT }, (_, i) => new Date(first + i * stepMs).toISOString());
}
