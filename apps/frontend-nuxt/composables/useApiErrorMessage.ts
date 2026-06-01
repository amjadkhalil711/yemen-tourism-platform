interface ResolveApiErrorOptions {
  fallback: string;
  rateLimitMessage?: string;
  includeRequestId?: boolean;
}

interface ParsedApiError {
  statusCode?: number;
  message?: string;
  name?: string;
  code?: string;
  data?: {
    message?: string;
    errors?: Record<string, string[] | string>;
    request_id?: string;
  };
}

export const useApiErrorMessage = () => {
  const isAbortError = (exception: unknown): boolean => {
    if (!exception || typeof exception !== "object") {
      return false;
    }

    const payload = exception as ParsedApiError;
    const message = typeof payload.message === "string" ? payload.message.toLowerCase() : "";

    return payload.name === "AbortError" || payload.code === "ABORT_ERR" || message.includes("aborted");
  };

  const appendRequestId = (message: string, requestId: string | undefined, includeRequestId = true): string => {
    if (!includeRequestId || !requestId || requestId.trim() === "") {
      return message;
    }

    return `${message} (Ref: ${requestId})`;
  };

  const resolveApiErrorMessage = (exception: unknown, options: ResolveApiErrorOptions): string => {
    if (!exception || typeof exception !== "object") {
      return options.fallback;
    }

    const payload = exception as ParsedApiError;

    if (payload.data?.errors) {
      for (const messages of Object.values(payload.data.errors)) {
        if (Array.isArray(messages) && messages.length > 0 && messages[0]) {
          return messages[0];
        }

        if (typeof messages === "string" && messages.trim() !== "") {
          return messages;
        }
      }
    }

    if (payload.statusCode === 429) {
      return appendRequestId(
        options.rateLimitMessage || "Too many requests. Please wait and try again.",
        payload.data?.request_id,
        options.includeRequestId ?? true
      );
    }

    return appendRequestId(
      payload.data?.message || payload.message || options.fallback,
      payload.data?.request_id,
      options.includeRequestId ?? true
    );
  };

  return {
    isAbortError,
    resolveApiErrorMessage
  };
};
