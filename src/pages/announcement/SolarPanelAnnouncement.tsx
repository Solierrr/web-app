import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type { SolarPanel } from "@/features/products/solar-panel/solarPanel";
import type { SolarPanelAnnouncement } from "@/features/products/solar-panel/solarPanelAnnouncement";
import type { Image } from "@/shared/types/image/image";

import Skeleton from "@@/feedbacks/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedbacks/skeleton/Skeleton.presets";

import { getSolarPanel } from "@/features/products/solar-panel/solarPanel.service";
import { SoftIconButton } from "@@/ui/button/Button.presets";
import { useContextMenu } from "@@/overlay/contextMenu/useContextMenu";
import Button from "@@/ui/button/Button";

import { useTranslation } from "react-i18next";
import { Capitalize } from "@/config/locales/utils";

interface regionsServiceI18n {
  message: string;
  and: string;
}

function regionsService(
  regions: string[],
  { message, and }: regionsServiceI18n,
): string {
  let result = "";
  if (regions.length == 1) result = regions[0];
  else if (regions.length == 2) result = `${regions[0]} ${and} ${regions[1]}`;
  else if (regions.length > 2)
    result = `${regions[0]}, ${regions[1]} ${and} ${regions[2]}`;

  return `${Capitalize(message)} ${result}`;
}

interface WrapperProps extends React.ComponentPropsWithoutRef<"section"> {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function Wrapper({ title, children, className }: WrapperProps) {
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

function ProductImages({ images }: ImagesProps) {
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
        <img
          key={image.url}
          src={image.url}
          alt={image.description}
          onContextMenu={(event) => handleContextMenu(event, image)}
        />
      ))}
    </div>
  );
}

interface Characteristic {
  label: string;
  value: string;
}

interface CharacteristicsI18n {
  widthAndLength: string;
  weight: string;
  brand: string;
  model: string;
  solarPanelType: string;
  potency: string;
  efficiency: string;
  unity: string;
}

function panelCharacteristics(
  panel: SolarPanel,
  {
    widthAndLength,
    weight,
    brand,
    model,
    solarPanelType,
    potency,
    efficiency,
    unity,
  }: CharacteristicsI18n,
): Characteristic[] {
  const characteristics: Characteristic[] = [];

  if (panel.dimension) {
    characteristics.push({
      label: widthAndLength,
      value: `${panel.dimension.width.toFixed(3)} m x ${panel.dimension.length.toFixed(2)} m`,
    });
  }
  if (panel.weight !== undefined) {
    characteristics.push({
      label: weight,
      value: `${panel.weight} kg / ${unity}`,
    });
  }

  if (panel.brand) {
    characteristics.push({ label: brand, value: panel.brand });
  }

  if (panel.model) {
    characteristics.push({ label: model, value: panel.model });
  }

  if (panel.type) {
    characteristics.push({ label: solarPanelType, value: panel.type });
  }

  if (panel.powerOutput !== undefined) {
    characteristics.push({
      label: potency,
      value: `${panel.powerOutput} W`,
    });
  }
  if (panel.efficiency !== undefined) {
    characteristics.push({
      label: efficiency,
      value: `${panel.efficiency} %`,
    });
  }

  return characteristics;
}

function Characteristics({ panel }: { panel: SolarPanel }) {
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
        <li
          key={label}
          className="flex justify-between py-4 px-6 rounded-soft bg-input-bg"
        >
          <p className="font-medium">{label}</p>
          <p className="font-medium">{value}</p>
        </li>
      ))}
    </ul>
  );
}

interface SolarPanelAnnouncementProps {
  product: SolarPanelAnnouncement;
}

function SolarPanelAnnouncementPacked({ product }: SolarPanelAnnouncementProps) {
  const { t } = useTranslation("announcements", { keyPrefix: "solarPanel" });
  const { t: c } = useTranslation("commons");

  return (
    <div className="flex flex-col">
      <div className="flex flex-row relative gap-12">
        <div className="w-[40%] flex justify-center">
          <img
            className="w-[80%] h-fit sticky top-10 pb-10 object-cover"
            src={product.photos.heroImage.url}
            alt={product.photos.heroImage.description}
          />
        </div>

        <section className="w-[60%] flex flex-col gap-announcement">
          <section title={t("general.information")}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1>{product.title}</h1>
                <h3 className="text-black/90">
                  {regionsService(product.serviceRegions, {
                    and: c("and"),
                    message: t("general.service"),
                  })}
                </h3>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex flex-row gap-6 items-baseline justify-between">
                  <div className="flex flex-row gap-4 items-baseline">
                    <span className="flex flex-row items-baseline gap-1">
                      <h2>{product.discountPercentage}</h2>
                      <span className="font-bold">%</span>
                    </span>
                    <div className="flex flex-row gap-1 h-min items-baseline">
                      <h5 className="font-semi-bold no-leading">R$</h5>
                      <h3 className="no-leading leading-none text-nowrap">
                        {product.unitPrice} {t("general.perUnit")}
                      </h3>
                    </div>
                  </div>
                  <h3 className="text-nowrap">
                    {product.availableUnits} {t("general.units")}
                  </h3>
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    content={t("actions.contactSupplier")}
                    description={t("actions.contactSupplierDescription")}
                    className="px-8"
                    rounded
                  />
                  <SoftIconButton
                    description={t("actions.addToCart")}
                    icon="shoppingCart"
                  />
                  <SoftIconButton
                    description={t("actions.addToCart")}
                    icon="heart"
                  />
                </div>
              </div>
            </div>
          </section>
          <Wrapper
            title={t("sections.description")}
            aria-labelledby={t("sections.description")}
          >
            <p className="flex max-h-60 text-black/90 overflow-auto">
              {product.description}
            </p>
          </Wrapper>
          <Wrapper
            title={t("sections.characteristics")}
            aria-labelledby={t("sections.characteristics")}
            className="gap-4"
          >
            <Characteristics panel={product.panel} />
          </Wrapper>
          <Wrapper
            title={t("sections.details")}
            aria-labelledby={t("sections.details")}
          >
            <p className="flex max-h-60 text-black/90 overflow-auto">
              {product.details}
            </p>
          </Wrapper>
        </section>
      </div>
      <Wrapper
        title={t("sections.productImages")}
        aria-labelledby={t("sections.productImages")}
        className="flex"
      >
        <ProductImages images={product.photos.otherImages} />
      </Wrapper>
    </div>
  );
}

function SolarPanelAnnouncementSkeleton() {
  return (
    <div className="flex flex-col" aria-busy="true">
      <div className="flex flex-row relative gap-12">
        <div className="w-[40%] flex justify-center">
          <ImageSkeleton className="w-[80%] max-h-80! sticky top-10 pb-10" />
        </div>
        <section className="w-[60%] flex flex-col gap-announcement">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton height="6.25rem" width="100%" />
              <Skeleton height="1.5rem" width="65%" />
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline">
                <Skeleton height="1.5rem" width="100%" />
              </div>
              <div className="flex gap-2">
                <Skeleton height="2.5rem" width="12rem" className="rounded-full" />
                <Skeleton height="2.5rem" width="2.5rem" className="rounded-full" />
                <Skeleton height="2.5rem" width="2.5rem" className="rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton height="1.65rem" width="10rem" />
            <Skeleton height="1.5rem" />
            <Skeleton height="1.5rem" width="85%" />
            <Skeleton height="1.5rem" width="70%" />
            <Skeleton height="1.5rem" width="85%" />
            <Skeleton height="1.5rem" width="70%" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton height="1.65rem" width="12rem" />
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} height="3.5rem" className="rounded-soft" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton height="1.65rem" width="8rem" />
            <Skeleton height="1.5rem" />
            <Skeleton height="1.5rem" width="78%" />
          </div>
        </section>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton height="1.65rem" width="11rem" />
        <div className="flex gap-8 overflow-hidden">
          {Array.from({ length: 3 }, (_, index) => (
            <ImageSkeleton key={index} width="10rem" className="shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SolarPanelAnnouncement() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("announcements", {
    keyPrefix: "solarPanel.errors",
  });

  const [product, setProduct] = useState<SolarPanelAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    getSolarPanel(id)
      .then((product) => {
        setProduct(product);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (!id || error) {
    return <p>{t("load")}</p>;
  }

  if (loading || !product) {
    return <SolarPanelAnnouncementSkeleton />;
  }

  return <SolarPanelAnnouncementPacked product={product} />;
}
