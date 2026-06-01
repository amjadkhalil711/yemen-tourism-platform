export const focusFirstInvalidField = (formElement: HTMLFormElement | null) => {
  if (!import.meta.client || !formElement) {
    return;
  }

  const firstInvalidField = formElement.querySelector<HTMLElement>(
    'input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]'
  );

  if (!firstInvalidField) {
    return;
  }

  firstInvalidField.focus();
};
