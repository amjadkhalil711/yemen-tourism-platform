/**
 * Encode dynamic URL path segments safely before interpolating into API paths.
 * @param {unknown} value
 * @returns {string}
 */
export function encodePathSegment(value) {
  return encodeURIComponent(String(value ?? "").trim());
}
