import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanelAnnouncement";

import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";

import { getSolarPanelBySlug } from "@/features/solar-panel/solarPanel.service";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { SoftIconButton } from "@@/ui/button/Button.presets";
import Button from "@@/ui/button/Button";

import { useTranslation } from "react-i18next";
import WrapperLayout from "@@/layout/wrappers/WrapperLayout";
import { regionsService } from "./SolarPanelAnnouncement.utils";
import { Wrapper, ProductImages, Characteristics } from "./SolarPanelAnnouncement.reusable";

interface SolarPanelAnnouncementProps {
  product: SolarPanelAnnouncement;
}

function SolarPanelAnnouncementPacked({ product }: SolarPanelAnnouncementProps) {
  const { t } = useTranslation("announcements", { keyPrefix: "solarPanel" });
  const { t: c } = useTranslation("commons");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <div>
      <WrapperLayout ptop>
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
                    <Link to={routePaths.companyProfile(lang, product.companySlug)} className="flex w-fit flex-row items-center gap-2">
                      {product.company.logoUrl && (
                        <img src={product.company.logoUrl} alt={product.company.tradeName} className="size-6 rounded-full object-cover" />
                      )}
                      <span className="text-hyperlink">{t("general.announcedBy", { company: product.company.tradeName })}</span>
                    </Link>
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
                      <Button content={t("actions.contactSupplier")} description={t("actions.contactSupplierDescription")} className="px-8" rounded />
                      <SoftIconButton description={t("actions.addToCart")} icon="shoppingCart" />
                      <SoftIconButton description={t("actions.addToCart")} icon="heart" />
                    </div>
                  </div>
                </div>
              </section>
              <Wrapper title={t("sections.description")} aria-labelledby={t("sections.description")}>
                <p className="flex max-h-60 text-black/90 overflow-auto">{product.description}</p>
              </Wrapper>
              <Wrapper title={t("sections.characteristics")} aria-labelledby={t("sections.characteristics")} className="gap-4">
                <Characteristics panel={product.panel} />
              </Wrapper>
              <Wrapper title={t("sections.details")} aria-labelledby={t("sections.details")}>
                <p className="flex max-h-60 text-black/90 overflow-auto">{product.details}</p>
              </Wrapper>
            </section>
          </div>
        </div>
      </WrapperLayout>
      <Wrapper title={t("sections.productImages")} aria-labelledby={t("sections.productImages")} className="flex">
        <ProductImages images={product.photos.otherImages} />
      </Wrapper>
    </div>
  );
}

function SolarPanelAnnouncementSkeleton() {
  return (
    <div>
      <WrapperLayout ptop>
        <div className="flex flex-col" aria-busy="true">
          <div className="flex flex-row relative gap-12">
            <div className="w-[40%] flex justify-center">
              <ImageSkeleton className="w-[80%]! max-h-[80vh]! sticky top-10 pb-10" />
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
        </div>
      </WrapperLayout>
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
  const { companySlug, productSlug } = useParams<{ companySlug: string; productSlug: string }>();
  const { t } = useTranslation("announcements", {
    keyPrefix: "solarPanel.errors",
  });

  const [product, setProduct] = useState<SolarPanelAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!companySlug || !productSlug) return;

    getSolarPanelBySlug(companySlug, productSlug)
      .then((product) => {
        setProduct(product);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [companySlug, productSlug]);

  if (!companySlug || !productSlug || error) {
    return <p>{t("load")}</p>;
  }

  if (loading || !product) {
    return <SolarPanelAnnouncementSkeleton />;
  }

  return <SolarPanelAnnouncementPacked product={product} />
}
