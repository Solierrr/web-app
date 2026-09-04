import { useTranslation } from "react-i18next";

import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import type { Image } from "@lib/shared/types/image/image";

import { useContextMenu } from "@@/overlay/contextMenu/useContextMenu";
import { panelCharacteristics } from "./SolarPanelAnnouncement.utils";

interface WrapperProps extends React.ComponentPropsWithoutRef<"section"> {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Wrapper({ title, children, className }: WrapperProps) {
  return (
    <section className={`flex flex-col gap-2 ${className}`}>
      <h2 className="text-black/90">{title}</h2>
      {children}
    </section>
  );
}

interface ImagesProps {
  images: Image[];
}

export function ProductImages({ images }: ImagesProps) {
  const contextMenu = useContextMenu();
  const { t } = useTranslation("announcements", {
    keyPrefix: "solarPanel.images",
  });

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

  return (
    <div className="flex flex-row gap-8 overflow-auto scrollbar-none">
      {images.map((image) => (
        <img key={image.url} src={image.url} alt={image.description} onContextMenu={(event) => handleContextMenu(event, image)} />
      ))}
    </div>
  );
}

export function Characteristics({ panel }: { panel: SolarPanel }) {
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

  if (characteristics.length === 0) {
    return <p>{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {characteristics.map(({ label, value }) => (
        <li key={label} className="flex justify-between py-4 px-6 rounded-soft bg-input-bg">
          <p className="font-medium">{label}</p>
          <p className="font-medium">{value}</p>
        </li>
      ))}
    </ul>
  );
}
