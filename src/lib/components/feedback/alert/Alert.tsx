import type { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  state?: "error" | "success" | "warning" | "info";
}

const styles = {
  error: "bg-feedback-error/10 text-feedback-error",
  success: "bg-feedback-success/10 text-feedback-success",
  warning: "bg-feedback-warning/10 text-feedback-warning",
  info: "bg-feedback-info/10 text-feedback-info",
};

export default function Alert({ children, state = "error" }: AlertProps) {
  return (
    <div role={state === "error" ? "alert" : "status"} className={`rounded-medium px-4 py-3 text-body [&_*]:text-inherit ${styles[state]}`}>
      {children}
    </div>
  );
}
