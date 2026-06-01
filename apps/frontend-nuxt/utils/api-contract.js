/**
 * @typedef {object} LoginUserShape
 * @property {number} [id]
 * @property {string} [name]
 * @property {string} [email]
 * @property {string|null} [role]
 */

/**
 * Resolve login payload while supporting both:
 * - legacy fields at top level (`token`, `user`)
 * - standardized envelope fields (`data.token`, `data.user`)
 *
 * @param {unknown} response
 * @returns {{ token: string, user: LoginUserShape }}
 */
export function resolveLoginPayload(response) {
  if (!response || typeof response !== "object") {
    throw new Error("Login response is not an object.");
  }

  const payload = /** @type {{ token?: unknown; user?: unknown; data?: { token?: unknown; user?: unknown } }} */ (response);

  const topLevelToken = typeof payload.token === "string" ? payload.token.trim() : "";
  const nestedToken = typeof payload.data?.token === "string" ? payload.data.token.trim() : "";
  const token = topLevelToken || nestedToken;

  const topLevelUser = payload.user && typeof payload.user === "object" ? payload.user : null;
  const nestedUser = payload.data?.user && typeof payload.data.user === "object" ? payload.data.user : null;
  const user = topLevelUser || nestedUser;

  if (!token || !user) {
    throw new Error("Login response is missing token or user.");
  }

  return {
    token,
    user: /** @type {LoginUserShape} */ (user)
  };
}
