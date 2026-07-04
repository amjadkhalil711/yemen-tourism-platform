import type { ApiPaginated, ApiCity, ApiLandmark, ApiStatsOverview, ApiUser } from "~/types/api";
import { resolveLoginPayload } from "~/utils/api-contract";
import { executeWithRetry, normalizeRetryPolicy } from "~/utils/http-retry";
import { encodePathSegment } from "~/utils/path-segment";
import { generateRequestId } from "~/utils/request-id";

interface RequestOptions extends Record<string, any> {
  dedupe?: boolean;
  dedupeKey?: string;
  cancelPrevious?: boolean;
  cancelKey?: string;
  cacheTtlMs?: number;
}

type ReadRequestOptions = Omit<RequestOptions, "method" | "body" | "query">;

const inFlightRequests = new Map<string, Promise<unknown>>();
const inFlightControllers = new Map<string, AbortController>();
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const MAX_RESPONSE_CACHE_ENTRIES = 120;

const stableSerialize = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${key}:${stableSerialize(item)}`).join(",")}}`;
  }

  return String(value);
};

const buildAuthScope = (authToken: string | null): string => {
  if (!authToken) {
    return "anon";
  }

  // Lightweight FNV-1a hash to scope in-flight/cached auth reads per token.
  let hash = 2166136261;
  for (let index = 0; index < authToken.length; index += 1) {
    hash ^= authToken.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `auth:${(hash >>> 0).toString(16)}`;
};

const buildInFlightRequestKey = (
  method: string,
  path: string,
  query: Record<string, unknown> | undefined,
  authToken: string | null
): string => {
  const authScope = buildAuthScope(authToken);
  return `${authScope}:${method}:${path}:${stableSerialize(query || {})}`;
};

const pruneResponseCache = () => {
  const now = Date.now();
  for (const [key, entry] of responseCache) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }

  if (responseCache.size <= MAX_RESPONSE_CACHE_ENTRIES) {
    return;
  }

  const overflow = responseCache.size - MAX_RESPONSE_CACHE_ENTRIES;
  const keys = responseCache.keys();
  for (let index = 0; index < overflow; index += 1) {
    const next = keys.next();
    if (next.done) {
      break;
    }
    responseCache.delete(next.value);
  }
};

const clearResponseCacheByMatch = (predicate: (key: string) => boolean) => {
  for (const cacheKey of responseCache.keys()) {
    if (predicate(cacheKey)) {
      responseCache.delete(cacheKey);
    }
  }
};

const invalidateResponseCacheForMutation = (path: string) => {
  if (responseCache.size === 0) {
    return;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith("/auth/")) {
    responseCache.clear();
    return;
  }

  if (normalizedPath === "/contact") {
    return;
  }

  if (normalizedPath.startsWith("/contact-messages")) {
    clearResponseCacheByMatch((cacheKey) => cacheKey.includes(":GET:/contact-messages"));
    return;
  }

  if (normalizedPath.startsWith("/admin/users")) {
    clearResponseCacheByMatch((cacheKey) => cacheKey.includes(":GET:/admin/users"));
    return;
  }

  if (/^\/landmarks\/[^/]+\/views$/.test(normalizedPath)) {
    clearResponseCacheByMatch((cacheKey) => cacheKey.includes(":GET:/stats/overview:"));
    return;
  }

  if (normalizedPath.startsWith("/cities") || normalizedPath.startsWith("/landmarks")) {
    clearResponseCacheByMatch((cacheKey) => {
      return (
        cacheKey.includes(":GET:/cities:") ||
        cacheKey.includes(":GET:/landmarks:") ||
        cacheKey.includes(":GET:/admin/landmarks:") ||
        cacheKey.includes(":GET:/stats/overview:")
      );
    });
    return;
  }

  responseCache.clear();
};

export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("auth_token", { default: () => null });
  const requestTimeout = Number(config.public.apiTimeoutMs || 15000);
  const isClient = import.meta.client;
  const retryPolicy = normalizeRetryPolicy({
    enabled: config.public.apiRetryEnabled as boolean | undefined,
    maxAttempts: Number(config.public.apiRetryMaxAttempts),
    baseDelayMs: Number(config.public.apiRetryBaseDelayMs),
    maxDelayMs: Number(config.public.apiRetryMaxDelayMs),
    jitterMs: Number(config.public.apiRetryJitterMs)
  });

  const request = async <T>(path: string, options: RequestOptions = {}) => {
    const {
      headers: customHeaders = {},
      dedupe = false,
      dedupeKey,
      cancelPrevious = false,
      cancelKey,
      cacheTtlMs = 0,
      ...restOptions
    } = options;
    const authHeaders = token.value ? { Authorization: `Bearer ${token.value}` } : {};
    const requestId = generateRequestId();
    const method = (typeof restOptions.method === "string" ? restOptions.method : "GET").toUpperCase();
    const cacheDurationMs = Number(cacheTtlMs);
    const canUseResponseCache = isClient && method === "GET" && Number.isFinite(cacheDurationMs) && cacheDurationMs > 0;
    const shouldDedupeGet = method === "GET" && (dedupe || canUseResponseCache);
    const requestKey = shouldDedupeGet ? dedupeKey || buildInFlightRequestKey(method, path, restOptions.query, token.value) : undefined;
    const responseCacheKey = canUseResponseCache ? requestKey : undefined;
    const cancelScope = cancelPrevious && method === "GET" ? cancelKey || `${method}:${path}` : undefined;

    if (isClient && responseCacheKey) {
      pruneResponseCache();
      const cachedResponse = responseCache.get(responseCacheKey);
      if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
        return cachedResponse.value as T;
      }
      if (cachedResponse) {
        responseCache.delete(responseCacheKey);
      }
    }

    if (isClient && requestKey) {
      const existingRequest = inFlightRequests.get(requestKey);
      if (existingRequest) {
        return (await existingRequest) as T;
      }
    }

    let abortController: AbortController | undefined;
    if (isClient && cancelScope && !restOptions.signal) {
      const activeController = inFlightControllers.get(cancelScope);
      if (activeController) {
        activeController.abort();
      }

      abortController = new AbortController();
      inFlightControllers.set(cancelScope, abortController);
      restOptions.signal = abortController.signal;
    }

    const requestPromise = executeWithRetry(
      () =>
        $fetch<T>(path, {
          baseURL: config.public.apiBase,
          timeout: Number.isFinite(requestTimeout) ? requestTimeout : 15000,
          ...restOptions,
          retry: 0,
          headers: {
            "X-Request-Id": requestId,
            ...authHeaders,
            ...(customHeaders as Record<string, string>)
          }
        }),
      method,
      retryPolicy
    );

    if (isClient && requestKey) {
      inFlightRequests.set(requestKey, requestPromise as Promise<unknown>);
    }

    try {
      const response = await requestPromise;

      if (isClient && responseCacheKey) {
        pruneResponseCache();
        responseCache.set(responseCacheKey, {
          expiresAt: Date.now() + cacheDurationMs,
          value: response as unknown
        });
      }

      if (isClient && method !== "GET") {
        invalidateResponseCacheForMutation(path);
      }

      return response;
    } finally {
      if (isClient && requestKey && inFlightRequests.get(requestKey) === requestPromise) {
        inFlightRequests.delete(requestKey);
      }

      if (isClient && cancelScope && abortController && inFlightControllers.get(cancelScope) === abortController) {
        inFlightControllers.delete(cancelScope);
      }
    }
  };

  return {
    login: async (identifier: string, password: string) => {
      const response = await request<{ token?: string; user?: ApiUser; data?: { token?: string; user?: ApiUser } }>("/auth/login", {
        method: "POST",
        body: identifier.includes("@") ? { login: identifier, email: identifier, password } : { login: identifier, password }
      });

      return resolveLoginPayload(response);
    },
    logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
    me: (options: ReadRequestOptions = {}) =>
      request<{ data: ApiUser }>("/auth/me", { dedupe: true, cacheTtlMs: 15_000, ...options }),
    listCities: (query: Record<string, string | number> = {}, options: ReadRequestOptions = {}) =>
      request<ApiPaginated<ApiCity>>("/cities", { query, dedupe: true, ...options }),
    getCityBySlug: (slug: string, options: ReadRequestOptions = {}) =>
      request<{ data: ApiCity }>(`/cities/${encodePathSegment(slug)}`, { dedupe: true, ...options }),
    createCity: (payload: Partial<ApiCity>) =>
      request<{ data: ApiCity }>("/cities", { method: "POST", body: payload }),
    updateCity: (slug: string, payload: Partial<ApiCity>) =>
      request<{ data: ApiCity }>(`/cities/${encodePathSegment(slug)}`, { method: "PUT", body: payload }),
    deleteCity: (slug: string) => request<void>(`/cities/${encodePathSegment(slug)}`, { method: "DELETE" }),
    listLandmarks: (query: Record<string, string | number> = {}, options: ReadRequestOptions = {}) =>
      request<ApiPaginated<ApiLandmark>>("/landmarks", { query, dedupe: true, ...options }),
    adminListLandmarks: (query: Record<string, string | number> = {}, options: ReadRequestOptions = {}) =>
      request<ApiPaginated<ApiLandmark>>("/admin/landmarks", { query, dedupe: true, ...options }),
    getLandmark: (id: number | string, options: ReadRequestOptions = {}) =>
      request<{ data: ApiLandmark }>(`/landmarks/${encodePathSegment(id)}`, { dedupe: true, ...options }),
    createLandmark: (payload: Partial<ApiLandmark> & { city_id: number; name: string }) =>
      request<{ data: ApiLandmark }>("/landmarks", { method: "POST", body: payload }),
    updateLandmark: (id: number | string, payload: Partial<ApiLandmark>) =>
      request<{ data: ApiLandmark }>(`/landmarks/${encodePathSegment(id)}`, { method: "PUT", body: payload }),
    deleteLandmark: (id: number | string) => request<void>(`/landmarks/${encodePathSegment(id)}`, { method: "DELETE" }),
    trackLandmarkView: (id: number | string) =>
      request<{ message: string }>(`/landmarks/${encodePathSegment(id)}/views`, { method: "POST" }),
    submitContact: (payload: { name: string; email: string; phone?: string | null; subject: string; message: string }) =>
      request<{ data: { accepted: boolean }; message: string }>("/contact", { method: "POST", body: payload }),
    listContactMessages: (query: Record<string, string | number> = {}, options: ReadRequestOptions = {}) =>
      request<ApiPaginated<ApiContactMessage>>("/contact-messages", { query, dedupe: true, ...options }),
    deleteContactMessage: (id: number | string) =>
      request<void>(`/contact-messages/${encodePathSegment(id)}`, { method: "DELETE" }),
    listAdmins: (options: ReadRequestOptions = {}) =>
      request<{ data: ApiUser[] }>("/admin/users", { dedupe: true, ...options }),
    createAdmin: (payload: Partial<ApiUser> & { password?: string }) =>
      request<{ data: ApiUser }>("/admin/users", { method: "POST", body: payload }),
    deleteAdmin: (id: number | string) =>
      request<void>(`/admin/users/${encodePathSegment(id)}`, { method: "DELETE" }),
    statsOverview: (options: ReadRequestOptions = {}) =>
      request<{ data: ApiStatsOverview }>("/stats/overview", { dedupe: true, ...options })
  };
};
