import { toSafeExternalUrl } from "./safe-url.js";

const toTrimmedString = (value) => String(value ?? "").trim();

/**
 * @param {unknown} value
 * @param {{ min: number; max: number; label: string; integer?: boolean }} options
 * @returns {{ value: number | null; error: string }}
 */
export function parseBoundedOptionalNumber(value, options) {
  const raw = toTrimmedString(value);
  if (raw === "") {
    return { value: null, error: "" };
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${options.label} must be a valid number.` };
  }

  if (options.integer && !Number.isInteger(parsed)) {
    return { value: null, error: `${options.label} must be a whole number.` };
  }

  if (parsed < options.min || parsed > options.max) {
    return { value: null, error: `${options.label} must be between ${options.min} and ${options.max}.` };
  }

  return { value: parsed, error: "" };
}

/**
 * @param {unknown} value
 * @returns {{ value: number | null; error: string }}
 */
export function parseLandmarkLatitude(value) {
  return parseBoundedOptionalNumber(value, {
    min: -90,
    max: 90,
    label: "Latitude"
  });
}

/**
 * @param {unknown} value
 * @returns {{ value: number | null; error: string }}
 */
export function parseLandmarkLongitude(value) {
  return parseBoundedOptionalNumber(value, {
    min: -180,
    max: 180,
    label: "Longitude"
  });
}

/**
 * @param {unknown} value
 * @returns {{ value: number | null; error: string }}
 */
export function parseLandmarkSortOrder(value) {
  return parseBoundedOptionalNumber(value, {
    min: 1,
    max: 100000,
    label: "Sort order",
    integer: true
  });
}

/**
 * @param {unknown} value
 * @returns {{ value: string | null; error: string }}
 */
export function parseOptionalGoogleMapsUrl(value) {
  const raw = toTrimmedString(value);
  if (raw === "") {
    return { value: null, error: "" };
  }

  const safeUrl = toSafeExternalUrl(raw);
  if (!safeUrl) {
    return { value: null, error: "Google Maps URL must be a valid http(s) URL." };
  }

  return { value: safeUrl, error: "" };
}
