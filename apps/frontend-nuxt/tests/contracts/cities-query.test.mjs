import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCitiesQueryForPage,
  buildCitiesQueryForSearch,
  normalizeCitiesPageQuery,
  normalizeCitiesSearchQuery
} from "../../utils/cities-query.js";

describe("cities-query", () => {
  it("normalizes search query values from strings and arrays", () => {
    assert.equal(normalizeCitiesSearchQuery("  sanaa  "), "sanaa");
    assert.equal(normalizeCitiesSearchQuery(["  aden  ", "ignored"]), "aden");
  });

  it("returns empty search query for invalid values", () => {
    assert.equal(normalizeCitiesSearchQuery(null), "");
    assert.equal(normalizeCitiesSearchQuery(undefined), "");
    assert.equal(normalizeCitiesSearchQuery(123), "");
    assert.equal(normalizeCitiesSearchQuery(["", "fallback"]), "");
  });

  it("normalizes page query to positive integers", () => {
    assert.equal(normalizeCitiesPageQuery("3"), 3);
    assert.equal(normalizeCitiesPageQuery("3.8"), 3);
    assert.equal(normalizeCitiesPageQuery(["7", "9"]), 7);
  });

  it("falls back page query to 1 for invalid values", () => {
    assert.equal(normalizeCitiesPageQuery("0"), 1);
    assert.equal(normalizeCitiesPageQuery("-9"), 1);
    assert.equal(normalizeCitiesPageQuery("not-a-number"), 1);
    assert.equal(normalizeCitiesPageQuery(null), 1);
  });

  it("builds route query for page changes while keeping existing filters", () => {
    const query = buildCitiesQueryForPage({ q: "aden", status: "published" }, 4);
    assert.deepEqual(query, { q: "aden", status: "published", page: "4" });
  });

  it("removes page query key when navigating to first page", () => {
    const query = buildCitiesQueryForPage({ q: "aden", page: "2" }, 1);
    assert.deepEqual(query, { q: "aden" });
  });

  it("builds route query for search changes and resets pagination", () => {
    const query = buildCitiesQueryForSearch({ page: "5", status: "published" }, "  taiz  ");
    assert.deepEqual(query, { status: "published", q: "taiz" });
  });

  it("removes q and page when search is blank", () => {
    const query = buildCitiesQueryForSearch({ q: "old", page: "5", status: "published" }, "   ");
    assert.deepEqual(query, { status: "published" });
  });
});
