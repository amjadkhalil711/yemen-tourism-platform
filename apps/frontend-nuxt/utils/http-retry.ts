interface RetryableError {
  statusCode?: number;
  response?: {
    status?: number;
    headers?: {
      get?: (name: string) => string | null;
      [key: string]: any;
    };
  };
  name?: string;
  code?: string;
  message?: string;
}

export interface ApiRetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
  retriableMethods: string[];
  retriableStatusCodes: number[];
}

interface RetryContext {
  attempt: number;
  method: string;
  policy: ApiRetryPolicy;
  error: unknown;
}

const DEFAULT_RETRIABLE_METHODS = ["GET", "HEAD", "OPTIONS"];
const DEFAULT_RETRIABLE_STATUS_CODES = [429, 500, 502, 503, 504];

const normalizeNumber = (value: unknown, fallback: number, minimum: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum) {
    return fallback;
  }

  return parsed;
};

export const normalizeRetryPolicy = (config: Partial<ApiRetryPolicy>): ApiRetryPolicy => {
  const maxAttempts = Math.floor(normalizeNumber(config.maxAttempts, 3, 1));
  const baseDelayMs = Math.floor(normalizeNumber(config.baseDelayMs, 250, 1));
  const maxDelayMs = Math.floor(normalizeNumber(config.maxDelayMs, 2000, baseDelayMs));
  const jitterMs = Math.floor(normalizeNumber(config.jitterMs, 100, 0));

  const retriableMethods =
    Array.isArray(config.retriableMethods) && config.retriableMethods.length > 0
      ? config.retriableMethods.map((method) => String(method).toUpperCase())
      : DEFAULT_RETRIABLE_METHODS;

  const retriableStatusCodes =
    Array.isArray(config.retriableStatusCodes) && config.retriableStatusCodes.length > 0
      ? config.retriableStatusCodes
      : DEFAULT_RETRIABLE_STATUS_CODES;

  return {
    enabled: config.enabled !== false,
    maxAttempts,
    baseDelayMs,
    maxDelayMs,
    jitterMs,
    retriableMethods,
    retriableStatusCodes
  };
};

const getStatusCode = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const payload = error as RetryableError;
  if (typeof payload.statusCode === "number") {
    return payload.statusCode;
  }

  if (typeof payload.response?.status === "number") {
    return payload.response.status;
  }

  return undefined;
};

const getRetryAfterMs = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const payload = error as RetryableError;
  const headerGetter = payload.response?.headers?.get;
  const retryAfterRaw = typeof headerGetter === "function" ? headerGetter("retry-after") : null;

  if (!retryAfterRaw || retryAfterRaw.trim() === "") {
    return undefined;
  }

  const seconds = Number(retryAfterRaw);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.floor(seconds * 1000);
  }

  const dateAsTime = Date.parse(retryAfterRaw);
  if (Number.isFinite(dateAsTime)) {
    const delay = dateAsTime - Date.now();
    if (delay > 0) {
      return delay;
    }
  }

  return undefined;
};

const isLikelyNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const payload = error as RetryableError;
  if (getStatusCode(payload) !== undefined) {
    return false;
  }

  const normalizedMessage = typeof payload.message === "string" ? payload.message.toLowerCase() : "";
  if (payload.name === "AbortError" || payload.code === "ABORT_ERR" || normalizedMessage.includes("aborted")) {
    return false;
  }

  return payload.name === "FetchError" || typeof payload.code === "string";
};

const delay = (durationMs: number): Promise<void> => {
  if (durationMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

const computeBackoffMs = (attempt: number, policy: ApiRetryPolicy, retryAfterMs?: number): number => {
  const boundedAttempt = Math.max(1, attempt);
  const exponential = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** (boundedAttempt - 1));
  const jitter = policy.jitterMs > 0 ? Math.floor(Math.random() * (policy.jitterMs + 1)) : 0;
  const preferredDelay = retryAfterMs !== undefined ? retryAfterMs : exponential;

  return Math.min(policy.maxDelayMs, Math.max(0, preferredDelay) + jitter);
};

const shouldRetry = (context: RetryContext): boolean => {
  if (!context.policy.enabled) {
    return false;
  }

  if (context.attempt >= context.policy.maxAttempts) {
    return false;
  }

  if (!context.policy.retriableMethods.includes(context.method)) {
    return false;
  }

  const statusCode = getStatusCode(context.error);
  if (statusCode !== undefined) {
    return context.policy.retriableStatusCodes.includes(statusCode);
  }

  return isLikelyNetworkError(context.error);
};

export const executeWithRetry = async <T>(
  executor: () => Promise<T>,
  method: string | undefined,
  policy: ApiRetryPolicy
): Promise<T> => {
  const normalizedMethod = (method || "GET").toUpperCase();
  let attempt = 1;

  while (true) {
    try {
      return await executor();
    } catch (error) {
      if (!shouldRetry({ attempt, method: normalizedMethod, policy, error })) {
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(error);
      const waitMs = computeBackoffMs(attempt, policy, retryAfterMs);

      await delay(waitMs);
      attempt += 1;
    }
  }
};
