export interface ToastMessage {
  message: string;
  duration: number;
  urgent?: boolean;
}

export const toastEventName = "solaria:toast";

export function notify(message: string, duration = 5000, urgent = false) {
  window.dispatchEvent(new CustomEvent<ToastMessage>(toastEventName, { detail: { message, duration, urgent } }));
}
