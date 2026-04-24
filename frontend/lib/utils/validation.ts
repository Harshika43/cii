/**
 * Strip Indian phone number formatting to raw 10 digits
 */
export function parseIndianPhone(raw: string): string {
  const stripped = raw.replace(/[\s\-().]/g, "");
  return stripped.replace(/^(\+91|91|0)/, "");
}

/**
 * Validate Indian mobile number (6–9 series, 10 digits)
 */
export function isValidIndianPhone(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(parseIndianPhone(raw));
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
