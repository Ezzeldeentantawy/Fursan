/**
 * Extract alpha value (0-1) from a color value.
 * Supports #RRGGBB, #RRGGBBAA, legacy opacity numbers (0-100).
 */
export function getAlpha(value) {
  if (!value || value === 'transparent') return 1;
  if (typeof value === 'number') return Math.min(1, Math.max(0, value / 100));
  if (typeof value === 'string' && value.startsWith('#')) {
    if (value.length === 9) {
      return parseInt(value.slice(7, 9), 16) / 255;
    }
    return 1;
  }
  return 1;
}

/**
 * Merge a 6-digit hex color with an alpha value (0-1) into CSS-compatible value.
 * Returns #RRGGBB when alpha >= 1, #RRGGBBAA when alpha < 1.
 */
export function mergeAlpha(hex, alpha) {
  if (!hex || hex === 'transparent' || typeof hex !== 'string') return hex;
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  const a = Math.min(1, Math.max(0, alpha));
  if (a >= 1) return hex;
  const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
  return hex + alphaHex;
}

/**
 * Check if a value is a valid CSS hex color (6 or 8 digits).
 */
export function isValidHex(value) {
  return value && typeof value === 'string' && /^#[0-9A-Fa-f]{6,8}$/.test(value);
}

/**
 * Get the clean 6-digit hex from a value (strips alpha if present).
 * Falls back to #000000 for invalid values.
 */
export function toSixDigitHex(value) {
  if (!value || value === 'transparent' || typeof value !== 'string') return '#000000';
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) return value;
  if (/^#[0-9A-Fa-f]{8}$/.test(value)) return value.slice(0, 7);
  return '#000000';
}

/**
 * Format a number for the opacity display (0-100 integer).
 */
export function formatOpacity(alpha) {
  return Math.round(Math.min(1, Math.max(0, alpha)) * 100);
}
