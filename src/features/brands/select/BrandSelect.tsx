import { WhiteButton } from "@@/ui/button/Button.presets";
import type { BrandSelectProps } from "./BrandSelect.d";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Combobox from "@@/ui/combobox/Combobox";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Popover from "@@/overlay/popover/Popover";
import Alert from "@@/feedback/alert/Alert";
import BrandManager from "../manager/BrandManager";
import { listBrands } from "../brand.service";
import type { Brand } from "../brand";
export default function BrandSelect({ value, label, selectedName, invalid, errorId, onChange }: BrandSelectProps) {
  const { t } = useTranslation("brands");
  const [brands, setBrands] = useState<Brand[]>([]),
    [open, setOpen] = useState(false),
    [error, setError] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const load = useCallback(async () => {
    try {
      setBrands(await listBrands());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    let active = true;
    listBrands()
      .then((b) => {
        if (active) setBrands(b);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <Combobox
          name="brandId"
          invalid={invalid}
          errorId={errorId}
          label={label}
          required
          value={value}
          selectionLabel
          toggleLabel={t("openOptions")}
          options={(value && selectedName && !brands.some((b) => b.id === value) ? [...brands, { id: value, name: selectedName } as Brand] : brands)
            .filter((b) => (!b.archived && !b.legacy) || b.id === value)
            .map((b) => [b.name, b.id] as const)}
          onChange={(id) => onChange(id, brands.find((b) => b.id === id)?.name ?? (id === value ? (selectedName ?? "") : ""))}
          placeholder={t("choose")}
          emptyLabel={t("noResults")}
        />
        <ToolbarAction
          ref={anchor}
          icon="settings"
          iconSize={24}
          label={t("manage")}
          className="h-12! w-14! rounded-medium!"
          backgroundColor="var(--color-input-bg)"
          color="var(--color-input-icon)"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((v) => !v)}
        />
      </div>
      {error && (
        <>
          <Alert>{t("serviceError")}</Alert>
          <WhiteButton type="button" content={t("retry")} description={t("retry")} onClick={() => void load()} />
        </>
      )}
      {open && (
        <Popover label={t("manage")} anchorRef={anchor} onClose={close} className="w-[min(28rem,calc(100vw-2rem))] max-h-[80vh] overflow-y-auto">
          <BrandManager
            brands={brands}
            onSaved={async (b) => {
              await load();
              if (b) {
                onChange(b.id, b.name);
                close();
              }
            }}
            onClose={close}
          />
        </Popover>
      )}
    </div>
  );
}
