type ToastKind = "success" | "error" | "info";

type ToastPayload = {
  kind?: ToastKind;
  title?: string;
  message: string;
  durationMs?: number;
};

export type AppToast = {
  id: string;
  kind: ToastKind;
  title: string;
  message: string;
};

const MAX_TOASTS = 5;

const resolveDefaultTitle = (kind: ToastKind) => {
  if (kind === "success") {
    return "Success";
  }

  if (kind === "error") {
    return "Error";
  }

  return "Info";
};

export const useToast = () => {
  const toasts = useState<AppToast[]>("app_toasts", () => []);
  const toastTimers = useState<Record<string, ReturnType<typeof setTimeout>>>("app_toast_timers", () => ({}));

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);

    const timer = toastTimers.value[id];
    if (timer) {
      clearTimeout(timer);
      delete toastTimers.value[id];
    }
  };

  const clearToasts = () => {
    for (const id of Object.keys(toastTimers.value)) {
      clearTimeout(toastTimers.value[id]);
      delete toastTimers.value[id];
    }

    toasts.value = [];
  };

  const addToast = ({ kind = "info", title, message, durationMs = 4500 }: ToastPayload) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return "";
    }

    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    toasts.value = [
      ...toasts.value,
      {
        id,
        kind,
        title: title?.trim() || resolveDefaultTitle(kind),
        message: trimmedMessage
      }
    ];

    if (toasts.value.length > MAX_TOASTS) {
      const overflowCount = toasts.value.length - MAX_TOASTS;
      const removed = toasts.value.slice(0, overflowCount);
      toasts.value = toasts.value.slice(overflowCount);
      for (const toast of removed) {
        const timer = toastTimers.value[toast.id];
        if (timer) {
          clearTimeout(timer);
          delete toastTimers.value[toast.id];
        }
      }
    }

    if (import.meta.client && durationMs > 0) {
      toastTimers.value[id] = setTimeout(() => removeToast(id), durationMs);
    }

    return id;
  };

  const success = (message: string, title = "Success") => addToast({ kind: "success", title, message });
  const error = (message: string, title = "Error") => addToast({ kind: "error", title, message });
  const info = (message: string, title = "Info") => addToast({ kind: "info", title, message });

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    info
  };
};
