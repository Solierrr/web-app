import { useEffect, useRef } from "react";
import { notify } from "./Toast.utils";

export default function FormError({ message }: { message?: string | null }) {
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (message && message !== previous.current) notify(message);
    previous.current = message;
  }, [message]);
  return null;
}
