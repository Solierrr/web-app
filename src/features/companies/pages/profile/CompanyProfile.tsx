import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/lib/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import EntityCard from "@/lib/components/layout/announcement/entity-card/EntityCard";
import { getCatalogCompanyBySlug, type CatalogCompany } from "@/features/companies/company.service";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { ProfileInfoRow, ProfileInfoSection } from "@/lib/components/layout/profile/ProfilePage.reusable";

interface CompanyProfilePackedProps {
  company: CatalogCompany;
}

function CompanyProfilePacked({ company }: CompanyProfilePackedProps) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("commons");
  const { t: tProfile } = useTranslation("profile", { keyPrefix: "edit" });
  const [offers, setOffers] = useState<SolarPanelAnnouncement[] | null>(null);

  useEffect(() => {
    let active = true;
    getCatalogSolarPanels(lang)
      .then((result) => {
        if (active) setOffers(result.filter((offer) => offer.companySlug === company.slug));
      })
      .catch(() => {
        if (active) setOffers([]);
      });
    return () => {
      active = false;
    };
  }, [company.slug, lang]);

  return (
    <ProfilePage
      avatarUrl={company.logoUrl}
      name={company.tradeName}
      subtitle={company.city && company.state ? `${company.city}/${company.state}` : undefined}
      actions={
        <Link to={routePaths.contactCompany(lang, company.id)} className="rounded-medium bg-orange px-4 py-2 font-medium text-white">
          {t("actions.contact")}
        </Link>
      }>
      <ProfileInfoSection title={tProfile("companyDetails")}>
        <dl className="divide-y divide-black/5">
          <ProfileInfoRow label={tProfile("tradeName")} value={company.tradeName} />
          <ProfileInfoRow label={tProfile("city")} value={company.city} />
          <ProfileInfoRow label={tProfile("state")} value={company.state} />
        </dl>
      </ProfileInfoSection>
      {offers && offers.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2>{t("companyOffers.title")}</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {offers.map((offer) => (
              <EntityCard
                key={offer.id}
                item={{
                  id: offer.id,
                  name: offer.title,
                  avatarUrl: offer.photos.heroImage.url,
                  subtitle: offer.panel.brand,
                  href: routePaths.productDetail(lang, offer.companySlug, offer.slug),
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </ProfilePage>
  );
}

export default function CompanyProfile() {
  const { companySlug = "" } = useParams<{ companySlug: string }>();
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

  return <CompanyProfilePacked company={company} />;
}
