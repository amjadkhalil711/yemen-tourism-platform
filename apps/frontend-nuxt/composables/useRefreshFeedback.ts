interface RefreshFeedbackOptions {
  pendingError: Ref<unknown>;
  fallback: string;
  successMessage: string;
  rateLimitMessage?: string;
}

export const useRefreshFeedback = () => {
  const { resolveApiErrorMessage } = useApiErrorMessage();
  const { success: notifySuccess, error: notifyError } = useToast();

  const runRefreshWithFeedback = async (
    refreshAction: () => Promise<unknown>,
    options: RefreshFeedbackOptions
  ): Promise<{ ok: boolean; message: string }> => {
    try {
      await refreshAction();

      if (!options.pendingError.value) {
        notifySuccess(options.successMessage);
        return { ok: true, message: options.successMessage };
      }

      const message = resolveApiErrorMessage(options.pendingError.value, {
        fallback: options.fallback
      });
      notifyError(message);
      return { ok: false, message };
    } catch (exception) {
      const message = resolveApiErrorMessage(exception, {
        fallback: options.fallback,
        rateLimitMessage: options.rateLimitMessage
      });
      notifyError(message);
      return { ok: false, message };
    }
  };

  return {
    runRefreshWithFeedback
  };
};

