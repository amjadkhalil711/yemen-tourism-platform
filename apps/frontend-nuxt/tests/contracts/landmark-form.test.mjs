import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseLandmarkLatitude,
  parseLandmarkLongitude,
  parseLandmarkSortOrder,
  parseOptionalGoogleMapsUrl
} from "../../utils/landmark-form.js";

describe("landmark-form validators", () => {
  it("accepts blank optional numeric fields", () => {
    assert.deepEqual(parseLandmarkLatitude(""), { value: null, error: "" });
    assert.deepEqual(parseLandmarkLongitude("   "), { value: null, error: "" });
  });

  it("validates latitude and longitude ranges", () => {
    assert.equal(parseLandmarkLatitude("91").error, "Latitude must be between -90 and 90.");
    assert.equal(parseLandmarkLongitude("-181").error, "Longitude must be between -180 and 180.");
    assert.equal(parseLandmarkLatitude("15.3").value, 15.3);
    assert.equal(parseLandmarkLongitude("44.2").value, 44.2);
  });

  it("validates sort order as positive whole number", () => {
    assert.equal(parseLandmarkSortOrder("0").error, "Sort order must be between 1 and 100000.");
    assert.equal(parseLandmarkSortOrder("1.5").error, "Sort order must be a whole number.");
    assert.equal(parseLandmarkSortOrder("999").value, 999);
  });

  it("accepts valid http(s) google maps urls", () => {
    assert.equal(
      parseOptionalGoogleMapsUrl(" https://maps.google.com/?q=sanaa ").value,
      "https://maps.google.com/?q=sanaa"
    );
  });

  it("rejects unsafe or malformed google maps urls", () => {
    assert.equal(
      parseOptionalGoogleMapsUrl("javascript:alert(1)").error,
      "Google Maps URL must be a valid http(s) URL."
    );
    assert.equal(parseOptionalGoogleMapsUrl("/internal/path").error, "Google Maps URL must be a valid http(s) URL.");
  });
});
