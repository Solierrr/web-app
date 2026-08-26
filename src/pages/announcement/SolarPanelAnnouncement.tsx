import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type SolarPanel from "@/domain/models/products/solarPanel";
import type { SolarPanelAnnouncement } from "@/domain/models/announcemnt/solarPanelAnnouncement";
import SolarPanelAnnouncementPlaceholder from "@/domain/models/announcemnt/solarPanelAnnouncement.placeholder";
import type { Image } from "@/domain/models/shared/image";

import { getSolarPanel } from "@/service/feed/solarPanel.service";
import { LightIconButton } from "@@/ui/button/Button.presets";
import { useContextMenu } from "@/config/contextMenu/useContextMenu";
import Button from "@@/ui/button/Button";

import { useTranslation } from "react-i18next";
import { Capitalize } from "@/config/locales/utils";

interface regionsServiceI18n {
    message: string;
    and: string;
}

function regionsService(regions: string[], { message, and }: regionsServiceI18n): string {
  let result = "";
  if (regions.length == 1) result = regions[0];
  else if (regions.length == 2) result = `${regions[0]} ${and} ${regions[1]}`;
  else if (regions.length  > 2) result = `${regions[0]}, ${regions[1]} e ${regions[2]}`;

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

  function handleContextMenu(event: React.MouseEvent, image: Image) {
    event.preventDefault();
    event.stopPropagation();
    contextMenu.open(
      [
        {
          label: "Abrir em nova aba",
          icon: "eye",
          onClick: () => window.open(image.url, "_blank"),
        },
        {
          label: "Copiar link da imagem",
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

function panelCharacteristics(panel: SolarPanel, { widthAndLength, weight, brand, model, solarPanelType, potency, efficiency, unity }: CharacteristicsI18n): Characteristic[] {
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
  const characteristics = panelCharacteristics(panel, {...});

  if (characteristics.length === 0) {
    return <p>Nenhuma característica informada pelo fornecedor.</p>;
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
  product:  SolarPanelAnnouncement;
  loading?: boolean;
}

function SolarPanelAnnouncementPacked({ product, loading = false }: SolarPanelAnnouncementProps) {
    if (loading) { product = SolarPanelAnnouncementPlaceholder; }
    const { t:t } = useTranslation("translation", { keyPrefix: "announcements.solarPanel" });
    const { t:c } = useTranslation("commons");

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
          <section title="Informações gerais">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1>{product.title}</h1>
                <h3 className="text-black/90">
                  {regionsService(product.serviceRegions, {and: c("and"), message: t("message")})}
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
                      <h3 className="no-leading leading-none">
                        {product.unitPrice} / unidade
                      </h3>
                    </div>
                  </div>
                  <h3>{product.availableUnits} unidades</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    content="Entrar em contato"
                    description="Entrar em contato com o fornecedor"
                    className="px-8"
                    rounded
                  />
                  <LightIconButton
                    description="Adicionar ao carrinho"
                    icon="shoppingCart"
                  />
                </div>
              </div>
            </div>
          </section>
          <Wrapper
            title="Descrição"
            aria-labelledby="Descrição"
            children={
              <p className="flex max-h-60 text-black/90 overflow-auto">
                {product.description}
              </p>
            }
          />
          <Wrapper
            title="Características"
            aria-labelledby="Características"
            children={<Characteristics panel={product.panel} />}
            className="gap-4"
          />
          <Wrapper
            title="Detalhes"
            aria-labelledby="Detalhes"
            children={
              <p className="flex max-h-60 text-black/90 overflow-auto">
                {product.details}
              </p>
            }
          />
        </section>
      </div>
      <Wrapper
        title="Imagens do produto"
        aria-labelledby="Detalhes"
        className="flex"
        children={<ProductImages images={product.photos.otherImages} />}
      />
    </div>
  );
}

export default function SolarPanelAnnouncement() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<SolarPanelAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    getSolarPanel(id)
        .then((product) => { setProduct(product); })
        .catch(()   => { setError(true); })
        .finally(() => { setLoading(false); });
  }, [id]);

  if (error || !product) {
    return <p>Não foi possível carregar o produto.</p>;
  }

  return <SolarPanelAnnouncementPacked product={product} loading={loading} />;
}
