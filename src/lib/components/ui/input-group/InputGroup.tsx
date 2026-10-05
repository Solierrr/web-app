import type { ReactNode } from "react";

interface InputGroupProps {
  label: string;
  children: ReactNode;
  hideLabel?: boolean;
}

export default function InputGroup({ label, children, hideLabel = false }: InputGroupProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className={hideLabel ? "sr-only" : "mb-3 text-body font-semi-bold"}>{label}</legend>
      <div className="grid min-w-0 auto-cols-fr grid-flow-col gap-4">{children}</div>
    </fieldset>
  );
}
