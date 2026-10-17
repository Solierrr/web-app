import { useId, useState } from "react";
import Input from "@@/ui/input/Input";
import { MenuItem, MenuList } from "@@/overlay/Menu";

import type { ComboboxProps } from "./Combobox.d";

export default function Combobox({
  name,
  label,
  value,
  options,
  onChange,
  emptyLabel,
  required,
  placeholder,
  maxLength,
  normalize,
  selectionLabel = false,
  toggleLabel,
  disabled,
  invalid,
  errorId,
}: ComboboxProps) {
  const id = useId();
  const [query, setQuery] = useState<string | null>(null);
  const selectedLabel = options.find(([, code]) => code === value)?.[0] ?? "";
  const search = selectionLabel ? (query ?? "") : value;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const normalizeSearch = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const matches = (selectionLabel ? query === null : options.some(([, code]) => code === value))
    ? options
    : options.filter(([text, code]) => normalizeSearch(`${code} ${text}`).includes(normalizeSearch(search)));
  const currentIndex = Math.min(active, matches.length - 1);
  const select = (code: string) => {
    setQuery(null);
    onChange(code);
    setOpen(false);
  };
  return (
    <div
      className="relative w-full"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery(null);
        }
      }}>
      <Input
        name={name}
        aria-invalid={invalid}
        aria-describedby={errorId}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={label}
        role="combobox"
        aria-expanded={open}
        aria-controls={id}
        aria-autocomplete="list"
        aria-activedescendant={open && currentIndex >= 0 ? `${id}-${currentIndex}` : undefined}
        value={selectionLabel ? (query ?? selectedLabel) : value}
        disabled={disabled}
        required={required}
        pattern={selectionLabel ? undefined : options.map(([, code]) => code).join("|")}
        autoComplete="off"
        spellCheck={false}
        className={`w-full [&_svg]:transition-transform [&_svg]:duration-300 motion-reduce:[&_svg]:transition-none ${open ? "[&_svg]:rotate-180" : ""}`}
        icon={{
          name: "chevronDown",
          label: toggleLabel ?? label,
          onClick: () => {
            setOpen(!open);
            setActive(
              Math.max(
                0,
                options.findIndex(([, code]) => code === value),
              ),
            );
          },
        }}
        onClick={() => setOpen(true)}
        onFocus={() => {
          setOpen(true);
          setActive(
            Math.max(
              0,
              options.findIndex(([, code]) => code === value),
            ),
          );
        }}
        onChange={(event) => {
          const value = selectionLabel ? event.target.value : normalize ? normalize(event.target.value) : event.target.value.toUpperCase();
          event.currentTarget.value = value;
          if (selectionLabel) {
            setQuery(value);
            onChange("");
          } else onChange(value);
          setActive(
            Math.max(
              0,
              options.findIndex(([, code]) => code === value),
            ),
          );
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActive(Math.max(0, Math.min(matches.length - 1, active + (event.key === "ArrowDown" ? 1 : -1))));
          }
          if (event.key === "Enter" && open && matches[currentIndex]) {
            event.preventDefault();
            select(matches[currentIndex][1]);
          }
        }}
      />
      {open && (
        <MenuList id={id} role="listbox" aria-label={label} className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto">
          {matches.map(([text, code], index) => (
            <MenuItem
              id={`${id}-${index}`}
              key={code}
              role="option"
              selected={index === currentIndex}
              onMouseDown={(event) => event.preventDefault()}
              onSelect={() => select(code)}>
              {text}
            </MenuItem>
          ))}
          {!matches.length && <li className="px-4 py-2 text-body">{emptyLabel}</li>}
        </MenuList>
      )}
    </div>
  );
}
