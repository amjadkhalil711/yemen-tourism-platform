import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodePathSegment } from "../../utils/path-segment.js";

describe("encodePathSegment", () => {
  it("encodes slash and query-sensitive characters", () => {
    assert.equal(encodePathSegment("city/slug"), "city%2Fslug");
    assert.equal(encodePathSegment("a?b=c"), "a%3Fb%3Dc");
  });

  it("trims surrounding spaces", () => {
    assert.equal(encodePathSegment("  aden  "), "aden");
  });

  it("supports numeric ids", () => {
    assert.equal(encodePathSegment(42), "42");
  });

  it("returns empty string for nullish values", () => {
    assert.equal(encodePathSegment(null), "");
    assert.equal(encodePathSegment(undefined), "");
  });
});
