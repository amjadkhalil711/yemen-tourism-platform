import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toSafeExternalUrl } from "../../utils/safe-url.js";

describe("toSafeExternalUrl", () => {
  it("accepts valid https and http urls", () => {
    assert.equal(toSafeExternalUrl("https://maps.google.com/?q=sanaa"), "https://maps.google.com/?q=sanaa");
    assert.equal(toSafeExternalUrl("http://example.com/path"), "http://example.com/path");
  });

  it("trims whitespace from valid urls", () => {
    assert.equal(
      toSafeExternalUrl("  https://www.openstreetmap.org/?mlat=15.3&mlon=44.2  "),
      "https://www.openstreetmap.org/?mlat=15.3&mlon=44.2"
    );
  });

  it("rejects non-http protocols", () => {
    assert.equal(toSafeExternalUrl("javascript:alert(1)"), null);
    assert.equal(toSafeExternalUrl("data:text/html,<h1>x</h1>"), null);
    assert.equal(toSafeExternalUrl("ftp://example.com/file"), null);
  });

  it("rejects relative or malformed values", () => {
    assert.equal(toSafeExternalUrl("/internal/path"), null);
    assert.equal(toSafeExternalUrl("//example.com/path"), null);
    assert.equal(toSafeExternalUrl("not a url"), null);
  });

  it("rejects non-string input", () => {
    assert.equal(toSafeExternalUrl(null), null);
    assert.equal(toSafeExternalUrl(undefined), null);
    assert.equal(toSafeExternalUrl(123), null);
    assert.equal(toSafeExternalUrl({ href: "https://example.com" }), null);
  });
});
