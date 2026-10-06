export interface ToastMessage {
  message: string;
  duration: number;
}

export const toastEventName = "solaria:toast";

export function notify(message: string, duration = 5000) {
  window.dispatchEvent(new CustomEvent<ToastMessage>(toastEventName, { detail: { message, duration } }));
}
