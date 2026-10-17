import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CompanyProfileView from "./CompanyProfileView";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Surface from "@@/ui/surface/Surface";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import EntityCard from "@/lib/components/layout/announcement/entity-card/EntityCard";
import { getCatalogCompanyBySlug, type CatalogCompany } from "@/features/companies/company.service";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { ProfileInfoRow } from "@/lib/components/layout/profile/ProfilePage.reusable";

interface CompanyProfilePackedProps {
  company: CatalogCompany;
}

function CompanyProfilePacked({ company }: CompanyProfilePackedProps) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("commons");
  const { t: tProfile } = useTranslation("profile", { keyPrefix: "edit" });
  const { t: tCompany } = useTranslation("profile", { keyPrefix: "company" });
  const [offersFailed, setOffersFailed] = useState(false);
  const [offers, setOffers] = useState<SolarPanelAnnouncement[] | null>(null);

  useEffect(() => {
    let active = true;
    getCatalogSolarPanels(lang)
      .then((result) => {
        if (active) setOffers(result.filter((offer) => offer.companySlug === company.slug));
      })
      .catch(() => {
        if (active) {
          setOffersFailed(true);
          setOffers([]);
        }
      });
    return () => {
      active = false;
    };
  }, [company.slug, lang]);

  const offersContent = (
    <section className="flex flex-col gap-4" aria-busy={offers === null}>
      <h2 className="text-label font-semi-bold">{t("companyOffers.title")}</h2>
      {offersFailed ? (
        <p role="alert">{tCompany("offersFailed")}</p>
      ) : offers === null ? (
        <p role="status">{tCompany("loadingOffers")}</p>
      ) : offers.length === 0 ? (
        <p className="text-body text-operational-muted">{tCompany("noOffers")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <EntityCard
              variant="product"
              key={offer.id}
              item={{
                id: offer.id,
                name: offer.title,
                avatarUrl: offer.photos.heroImage.url,
                subtitle: offer.panel.brand,
                href:
                  offer.panel.productType === "INFRASTRUCTURE"
                    ? routePaths.infrastructureDetail(lang, offer.companySlug, offer.slug)
                    : routePaths.productDetail(lang, offer.companySlug, offer.slug),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
  return (
    <CompanyProfileView
      company={company}
      canViewProjects={!!getAuthSession()?.accessToken}
      offers={offersContent}
      actions={
        <ToolbarAction
          to={routePaths.contactCompany(lang, company.id)}
          icon="messages"
          label={t("actions.contact")}
          content={t("actions.contact")}
          backgroundColor="var(--color-white)"
        />
      }>
      <Surface>
        <div className="p-5 sm:p-6">
          <section>
            <h2 className="mb-4 text-label font-semi-bold">{tProfile("companyDetails")}</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <ProfileInfoRow label={tProfile("tradeName")} value={company.tradeName} />
              <ProfileInfoRow label={tProfile("city")} value={company.city} />
              <ProfileInfoRow label={tProfile("state")} value={company.state} />
            </dl>
          </section>
        </div>
      </Surface>
    </CompanyProfileView>
  );
}

function CompanyProfileResource({ companySlug }: { companySlug: string }) {
  const { t } = useTranslation("chat");
  const [company, setCompany] = useState<CatalogCompany | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getCatalogCompanyBySlug(companySlug)
      .then((result) => {
        if (active) setCompany(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [companySlug]);

  if (error)
    return (
      <p role="alert" className="p-6">
        {t("companyLoadError")}
      </p>
    );
  if (!company) return <ProfilePageSkeleton />;

  return <CompanyProfilePacked key={company.id} company={company} />;
}

export default function CompanyProfile() {
  const { companySlug = "" } = useParams<{ companySlug: string }>();
  return <CompanyProfileResource key={companySlug} companySlug={companySlug} />;
}
