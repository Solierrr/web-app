import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useRequiredParam } from "@/lib/shared/routing/useRequiredParam";
import { NotFoundPage } from "@/features/error/pages/not-found/NotFound";
import { useEffect, useState } from "react";

import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";

import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";

import { getSolarPanelBySlug } from "@/features/solar-panel/solarPanel.service";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { SoftIconButton } from "@@/ui/button/Button.presets";
import ActionLink from "@@/ui/button/ActionLink";
import { notify } from "@@/feedback/toast/Toast.utils";
import { putCartItem } from "@/features/purchases/purchases.service";

import { useTranslation } from "react-i18next";
import { regionsService } from "./SolarPanelAnnouncement.utils";
import { Wrapper, ProductImages, Characteristics, ExpandableText } from "./SolarPanelAnnouncement.reusable";

interface SolarPanelAnnouncementProps {
  product: SolarPanelAnnouncement;
}

export function SolarPanelAnnouncementPacked({ product }: SolarPanelAnnouncementProps) {
  const { t } = useTranslation("announcements", { keyPrefix: "solarPanel" });
  const { t: c } = useTranslation("commons");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const location = useLocation();
  const [adding, setAdding] = useState(false);

  async function addToCart() {
    if (adding || product.availableUnits < 1) return;
    if (!getAuthSession()) {
      navigate(routePaths.login(lang), { state: { returnTo: location.pathname + location.search } });
      return;
    }
    setAdding(true);
    try {
      await putCartItem(product.id, 1);
      navigate(routePaths.cart(lang));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("actions.addToCartError"));
    } finally {
      setAdding(false);
    }
  }

  const images = [product.photos.heroImage, ...product.photos.otherImages].filter((image) => image.url);
  const discounted = product.discountPercentage != null && product.discountPercentage > 0;
  return (
    <main className="mx-auto grid w-full max-w-marketplace-page min-w-0 grid-cols-1 gap-10 px-5 pb-20 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:px-18">
      <div className="min-w-0 lg:sticky lg:top-10 lg:self-start">
        {images.length ? (
          <ProductImages images={images} label={t("sections.productImages")} />
        ) : (
          <ImageSkeleton className="aspect-square! w-full! rounded-surface!" />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-10">
        <section title={t("general.information")} className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-title font-bold leading-tight tracking-tight">{product.title}</h1>
            <Link to={routePaths.companyProfile(lang, product.companySlug)} className="flex w-fit items-center gap-2">
              {product.company.logoUrl && (
                <img src={product.company.logoUrl} alt={product.company.tradeName} className="size-6 rounded-full object-cover" />
              )}
              <span className="font-medium text-operational-ink underline-offset-4 hover:underline">
                {t("general.announcedBy", { company: product.company.tradeName })}
              </span>
            </Link>
            {product.serviceRegions.length > 0 && (
              <p className="text-body text-operational-muted">
                {regionsService(product.serviceRegions, {
                  and: c("and"),
                  message: t("general.service"),
                })}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-title font-bold leading-none tracking-tight">
                {new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(product.unitPrice)}
              </span>
              <span className="text-body text-operational-muted">{t("general.perUnit")}</span>
              {discounted && (
                <span className="rounded-full bg-orange/10 px-3 py-1 text-body font-medium text-orange-text">-{product.discountPercentage}%</span>
              )}
            </div>
            <p className="text-body text-operational-muted">
              {product.availableUnits} {t("general.units")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ActionLink
              to={routePaths.contactCompany(lang, product.company.id, product.title)}
              content={t("actions.contactSupplier")}
              description={t("actions.contactSupplier")}
            />
            <SoftIconButton
              description={t("actions.addToCart")}
              disabled={adding || product.availableUnits < 1}
              icon="shoppingCart"
              onClick={() => void addToCart()}
            />
          </div>
        </section>
        {product.description && (
          <Wrapper title={t("sections.description")}>
            <ExpandableText text={product.description} />
          </Wrapper>
        )}
        <Wrapper title={t("sections.characteristics")}>
          <Characteristics panel={product.panel} />
        </Wrapper>
        {product.details?.length ? (
          <Wrapper title={t("sections.details")}>
            <ExpandableText text={product.details.join("\n\n")} />
          </Wrapper>
        ) : null}
      </div>
    </main>
  );
}

function SolarPanelAnnouncementSkeleton() {
  return (
    <main
      aria-busy="true"
      className="mx-auto grid w-full max-w-marketplace-page min-w-0 grid-cols-1 gap-10 px-5 pb-20 pt-10 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-18">
      <ImageSkeleton className="aspect-square! w-full! rounded-surface!" />
      <div className="flex flex-col gap-8">
        <Skeleton height="2.5rem" width="80%" />
        <Skeleton height="1.25rem" width="45%" />
        <Skeleton height="2.5rem" width="50%" />
        <Skeleton height="3rem" width="14rem" className="rounded-full" />
        <Skeleton height="1.5rem" />
        <Skeleton height="1.5rem" width="85%" />
        <Skeleton height="12rem" />
      </div>
    </main>
  );
}

export default function SolarPanelAnnouncement() {
  const companySlug = useRequiredParam("companySlug");
  const productSlug = useRequiredParam("productSlug");
  return companySlug && productSlug ? <SolarPanelAnnouncementResource companySlug={companySlug} productSlug={productSlug} /> : <NotFoundPage />;
}

function SolarPanelAnnouncementResource({ companySlug, productSlug }: { companySlug: string; productSlug: string }) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("announcements", {
    keyPrefix: "solarPanel.errors",
  });

  const [product, setProduct] = useState<SolarPanelAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSolarPanelBySlug(companySlug, productSlug, lang)
      .then((product) => {
        setProduct(product);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [companySlug, productSlug, lang]);

  if (error) {
    return <p>{t("load")}</p>;
  }

  if (loading || !product) {
    return <SolarPanelAnnouncementSkeleton />;
  }

  return <SolarPanelAnnouncementPacked product={product} />;
}
