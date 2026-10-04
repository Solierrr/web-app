import type { InputHTMLAttributes } from "react";
import Icon from "@@/ui/icon/Icon";
import Colors from "@/lib/shared/styles/colors/colors.enum";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export default function Checkbox({ label, className = "", disabled, ...props }: CheckboxProps) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}>
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input
          {...props}
          type="checkbox"
          disabled={disabled}
          className="peer size-5 cursor-inherit appearance-none rounded-soft bg-input-bg transition-colors duration-200 checked:bg-orange"
        />
        <Icon
          name="check"
          color={Colors.WHITE}
          size={14}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
        />
      </span>
      <span className="text-xs leading-5">{label}</span>
    </label>
  );
}
