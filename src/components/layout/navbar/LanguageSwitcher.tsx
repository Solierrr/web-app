import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { MenuList, MenuItem } from "@@/overlay/Menu";

const LANGUAGES = [
  ["pt-BR", "Português"],
  ["en-US", "English"],
  ["es-ES", "Español"],
] as const;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(language: string) {
    i18n.changeLanguage(language);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Idioma"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center-safe gap-1 cursor-pointer"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <Icon name="globe" />
        <Icon name="chevronDown" size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <MenuList className="absolute right-0 z-10 mt-1" role="listbox" aria-label="Idioma">
          {LANGUAGES.map(([code, label]) => (
            <MenuItem
              key={code}
              role="option"
              selected={i18n.language === code}
              onSelect={() => handleSelect(code)}
            >
              {label}
            </MenuItem>
          ))}
        </MenuList>
      )}
    </div>
  );
}
