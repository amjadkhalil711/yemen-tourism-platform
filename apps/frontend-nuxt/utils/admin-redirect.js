const DEFAULT_ADMIN_REDIRECT = "/admin/dashboard";

/**
 * Restrict redirects to internal admin routes and avoid login-loop redirects.
 * @param {unknown} candidate
 * @param {string} [fallback]
 * @returns {string}
 */
export function sanitizeAdminRedirect(candidate, fallback = DEFAULT_ADMIN_REDIRECT) {
  if (typeof candidate !== "string") {
    return fallback;
  }

  const value = candidate.trim();
  if (value === "" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (value.includes("://") || value.includes("\\")) {
    return fallback;
  }

  if (!(value === "/admin" || value.startsWith("/admin/"))) {
    return fallback;
  }

  if (value === "/admin/login" || value.startsWith("/admin/login?") || value.startsWith("/admin/login#")) {
    return fallback;
  }

  return value;
}

export { DEFAULT_ADMIN_REDIRECT };
