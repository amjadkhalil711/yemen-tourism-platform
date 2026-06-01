const firstStringValue = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return typeof value === "string" ? value : "";
};

export const normalizeCitiesSearchQuery = (value) => {
  return firstStringValue(value).trim();
};

export const normalizeCitiesPageQuery = (value) => {
  const normalized = Number(firstStringValue(value).trim());
  if (!Number.isFinite(normalized)) {
    return 1;
  }

  return Math.max(1, Math.trunc(normalized));
};

export const buildCitiesQueryForPage = (currentQuery, page) => {
  const nextQuery = typeof currentQuery === "object" && currentQuery !== null ? { ...currentQuery } : {};
  const normalizedPage = Math.max(1, Math.trunc(Number(page) || 1));

  if (normalizedPage <= 1) {
    delete nextQuery.page;
  } else {
    nextQuery.page = String(normalizedPage);
  }

  return nextQuery;
};

export const buildCitiesQueryForSearch = (currentQuery, searchQuery) => {
  const nextQuery = typeof currentQuery === "object" && currentQuery !== null ? { ...currentQuery } : {};
  const normalizedSearchQuery = normalizeCitiesSearchQuery(searchQuery);

  if (normalizedSearchQuery === "") {
    delete nextQuery.q;
  } else {
    nextQuery.q = normalizedSearchQuery;
  }

  delete nextQuery.page;

  return nextQuery;
};
