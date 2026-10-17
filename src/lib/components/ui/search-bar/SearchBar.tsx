import type { ComponentProps, ReactNode } from "react";
import Input from "@@/ui/input/Input";
import Surface from "@@/ui/surface/Surface";

interface SearchBarProps extends Omit<ComponentProps<typeof Input>, "icon" | "className"> {
  actions?: ReactNode;
  className?: string;
}

export default function SearchBar({ actions, className = "", ...props }: SearchBarProps) {
  return (
    <Surface className={`w-full ${className}`}>
      <div className={`grid items-center gap-3 px-3 py-2 ${actions ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1"}`}>
        <Input {...props} icon={{ name: "search" }} className="w-full!" />
        {actions}
      </div>
    </Surface>
  );
}
