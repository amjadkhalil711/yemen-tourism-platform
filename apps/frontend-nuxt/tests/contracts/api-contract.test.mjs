import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveLoginPayload } from "../../utils/api-contract.js";

describe("resolveLoginPayload", () => {
  it("accepts legacy login shape with top-level token and user", () => {
    const result = resolveLoginPayload({
      token: "legacy-token",
      user: {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        role: "admin"
      }
    });

    assert.equal(result.token, "legacy-token");
    assert.equal(result.user.email, "admin@example.com");
  });

  it("accepts standardized envelope shape with nested data token and user", () => {
    const result = resolveLoginPayload({
      status: "success",
      message: "Login successful.",
      data: {
        token: "envelope-token",
        user: {
          id: 2,
          name: "Editor",
          email: "editor@example.com",
          role: "editor"
        }
      }
    });

    assert.equal(result.token, "envelope-token");
    assert.equal(result.user.name, "Editor");
  });

  it("prefers top-level token/user when both legacy and nested data exist", () => {
    const result = resolveLoginPayload({
      token: "top-token",
      user: {
        id: 3,
        name: "Top Level User",
        email: "top@example.com",
        role: "admin"
      },
      data: {
        token: "nested-token",
        user: {
          id: 4,
          name: "Nested User",
          email: "nested@example.com",
          role: "viewer"
        }
      }
    });

    assert.equal(result.token, "top-token");
    assert.equal(result.user.id, 3);
  });

  it("throws when token or user is missing", () => {
    assert.throws(() => resolveLoginPayload({ status: "success", data: {} }), {
      message: "Login response is missing token or user."
    });
  });
});
