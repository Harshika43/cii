/**
 * Generate a unique ID using timestamp + random base36
 */
export function genId(): string {
  return crypto.randomUUID();
}

/**
 * Clamp a number between 0 and 100
 */
export function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(Number(v) || 40)));
}

/**
 * Sleep for ms milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
