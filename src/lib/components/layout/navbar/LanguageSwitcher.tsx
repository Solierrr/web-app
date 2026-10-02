import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { MenuList, MenuItem } from "@@/overlay/Menu";
import { SUPPORTED as SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/config/inter/browser/languages";
import { translatePathToLanguage } from "@/config/inter/paths";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  "pt-BR": "Português",
  "en-US": "English",
  "es-ES": "Español",
};

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation("commons");
  const location = useLocation();
  const navigate = useNavigate();
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

  // Troca de idioma navega para a URL traduzida (mesma página, segmentos
  // literais trocados) em vez de só trocar o idioma do i18next — é a URL
  // quem manda no idioma atual (ver LanguageLayout), então precisamos mudar
  // ela pra refletir a escolha.
  function handleSelect(language: SupportedLanguage) {
    const translatedPath = translatePathToLanguage(location.pathname, language);
    navigate(translatedPath);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center-safe gap-1 cursor-pointer"
        onClick={() => setOpen((isOpen) => !isOpen)}>
        <Icon name="globe" />
        <Icon name="chevronDown" size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <MenuList className="absolute right-0 z-10 mt-1" role="listbox" aria-label={t("language")}>
          {SUPPORTED_LANGUAGES.map((code) => (
            <MenuItem key={code} role="option" selected={i18n.language === code} onSelect={() => handleSelect(code)}>
              {LANGUAGE_LABELS[code]}
            </MenuItem>
          ))}
        </MenuList>
      )}
    </div>
  );
}
