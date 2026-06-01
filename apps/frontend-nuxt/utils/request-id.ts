export const generateRequestId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const now = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 12);

  return `rq-${now}-${random}`;
};
