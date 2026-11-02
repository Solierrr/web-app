import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import type { Image } from "@/lib/shared/types/image/image";

import { useContextMenu } from "@@/overlay/contextMenu/useContextMenu";
import { panelCharacteristics } from "./SolarPanelAnnouncement.utils";

interface WrapperProps extends React.ComponentPropsWithoutRef<"section"> {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Wrapper({ title, children, className = "" }: WrapperProps) {
  return (
    <section className={`flex flex-col gap-4 ${className}`}>
      <h2 className="text-subtitle font-semi-bold leading-tight tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

interface ImagesProps {
  images: Image[];
}

export function ProductImages({ images, label }: ImagesProps & { label: string }) {
  const contextMenu = useContextMenu();
  const { t } = useTranslation("announcements", {
    keyPrefix: "solarPanel.images",
  });
  const [selected, setSelected] = useState(0);
  const current = images[Math.min(selected, images.length - 1)];

  function handleContextMenu(event: React.MouseEvent, image: Image) {
    event.preventDefault();
    event.stopPropagation();
    contextMenu.open(
      [
        {
          label: t("openInNewTab"),
          icon: "eye",
          onClick: () => window.open(image.url, "_blank"),
        },
        {
          label: t("copyLink"),
          onClick: () => navigator.clipboard.writeText(image.url),
        },
      ],
      event.clientX,
      event.clientY,
    );
  }

  if (!current) return null;
  return (
    <div className="flex min-w-0 flex-col gap-4" aria-label={label} role="group">
      <div className="flex aspect-4/3 w-full items-center lg:aspect-square justify-center overflow-hidden rounded-surface bg-operational-surface">
        <img
          src={current.url}
          alt={current.description}
          onContextMenu={(event) => handleContextMenu(event, current)}
          className="size-full object-contain p-6 mix-blend-multiply"
        />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto scrollbar-none snap-x">
          {images.map((image, index) => (
            <li key={image.url} className="shrink-0 snap-start">
              <button
                type="button"
                aria-label={image.description || String(index + 1)}
                aria-current={index === selected}
                onClick={() => setSelected(index)}
                className={`size-20 cursor-pointer overflow-hidden rounded-soft bg-operational-surface outline-2 outline-offset-2 transition-colors ${
                  index === selected ? "outline-operational-ink" : "outline-transparent hover:outline-operational-border"
                }`}>
                <img src={image.url} alt="" className="size-full object-contain p-2 mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Characteristics({ panel }: { panel: SolarPanel }) {
  const { t: tCatalog } = useTranslation("feed", { keyPrefix: "catalog" });
  const { t } = useTranslation("announcements", {
    keyPrefix: "solarPanel.characteristics",
  });
  const { t: c } = useTranslation("commons", { keyPrefix: "units" });

  const characteristics = panelCharacteristics(panel, {
    widthAndLength: t("dimensions"),
    weight: t("weight"),
    brand: t("brand"),
    model: t("model"),
    solarPanelType: t("type"),
    potency: t("power"),
    efficiency: t("efficiency"),
    unity: c("unit"),
  });

  if (panel.productType === "INFRASTRUCTURE") {
    if (panel.infrastructureType) characteristics.unshift({ label: tCatalog("type"), value: tCatalog(`types.${panel.infrastructureType}`) });
    if (panel.material) characteristics.push({ label: tCatalog("material"), value: panel.material });
  }

  if (characteristics.length === 0) {
    return <p>{t("empty")}</p>;
  }

  return (
    <dl className="flex flex-col divide-y divide-operational-border border-y border-operational-border">
      {characteristics.map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-6 py-4">
          <dt className="text-operational-muted">{label}</dt>
          <dd className="text-right font-medium text-operational-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ExpandableText({ text }: { text: string }) {
  const { t } = useTranslation("announcements", { keyPrefix: "solarPanel.actions" });
  const [open, setOpen] = useState(false);
  const long = text.length > 420;
  return (
    <div className="flex flex-col items-start gap-3">
      <p className={`whitespace-pre-line text-operational-ink/90 ${long && !open ? "line-clamp-6" : ""}`}>{text}</p>
      {long && (
        <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="cursor-pointer font-medium underline underline-offset-4">
          {open ? t("showLess") : t("showMore")}
        </button>
      )}
    </div>
  );
}
