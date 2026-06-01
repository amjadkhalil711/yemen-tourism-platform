import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeAdminRedirect } from "../../utils/admin-redirect.js";

describe("sanitizeAdminRedirect", () => {
  it("keeps valid admin paths", () => {
    assert.equal(sanitizeAdminRedirect("/admin/cities?page=2"), "/admin/cities?page=2");
    assert.equal(sanitizeAdminRedirect("/admin/dashboard"), "/admin/dashboard");
  });

  it("falls back for non-admin paths", () => {
    assert.equal(sanitizeAdminRedirect("/contact"), "/admin/dashboard");
    assert.equal(sanitizeAdminRedirect("https://example.com/admin"), "/admin/dashboard");
  });

  it("falls back for admin login route to avoid redirect loops", () => {
    assert.equal(sanitizeAdminRedirect("/admin/login"), "/admin/dashboard");
    assert.equal(sanitizeAdminRedirect("/admin/login?redirect=/admin/cities"), "/admin/dashboard");
  });

  it("falls back for invalid input values", () => {
    assert.equal(sanitizeAdminRedirect(""), "/admin/dashboard");
    assert.equal(sanitizeAdminRedirect(null), "/admin/dashboard");
    assert.equal(sanitizeAdminRedirect(["/admin/dashboard"]), "/admin/dashboard");
  });

  it("supports custom fallback", () => {
    assert.equal(sanitizeAdminRedirect("/contact", "/admin/landmarks"), "/admin/landmarks");
  });
});
