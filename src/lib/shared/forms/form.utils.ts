export function firstInvalidField(form: HTMLFormElement, positiveMessage: string) {
  const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea");
  for (const field of fields) {
    field.setCustomValidity("");
    if (field.required && field.value && !field.value.trim()) field.setCustomValidity(positiveMessage);
    if (field instanceof HTMLInputElement && field.type === "number" && field.required && field.value && Number(field.value) <= 0)
      field.setCustomValidity(positiveMessage);
    if (!field.checkValidity()) {
      field.focus();
      return field;
    }
  }
  return null;
}

export function clearFieldValidity(target: EventTarget) {
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
    target.setCustomValidity("");
    return target.name;
  }
  return null;
}
